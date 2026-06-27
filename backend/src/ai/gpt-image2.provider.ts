import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ImageGenerationRequest,
  ImageGenerationResult,
  ImageProvider,
} from './image-provider.interface';

/**
 * Real image provider that POSTs to an OpenAI-compatible image endpoint.
 *
 *  - WITHOUT a reference image: POST /images/generations  (text-to-image)
 *  - WITH a reference image (i2i): POST /images/edits  (multipart/form-data)
 *
 * The rcouyi/gpt-image-2 i2i entry point is undocumented, so when a reference
 * image is supplied we attempt /images/edits first; on rejection we fall back
 * to text-only /images/generations and log a warning. IMAGE_API_KEY stays
 * server-side (read from env); the reference image is NEVER persisted.
 */
@Injectable()
export class GptImage2Provider implements ImageProvider {
  private readonly logger = new Logger(GptImage2Provider.name);

  constructor(private readonly config: ConfigService) {}

  async generateImage(
    req: ImageGenerationRequest,
  ): Promise<ImageGenerationResult> {
    const baseUrl = this.config.get<string>('image.baseUrl');
    const apiKey = this.config.get<string>('image.apiKey');
    const model = this.config.get<string>('image.model') || 'gpt-image-2';

    if (!baseUrl || !apiKey) {
      throw new InternalServerErrorException(
        'Image provider not configured (missing IMAGE_API_BASE_URL/IMAGE_API_KEY)',
      );
    }

    // i2i path: forward reference image via /images/edits, fall back to t2i.
    if (req.referenceImage) {
      try {
        return await this.editImage(baseUrl!, apiKey!, model, req);
      } catch (err: any) {
        this.logger.warn(
          `i2i /images/edits failed (${err?.message || err}); falling back to text-only generation.`,
        );
      }
    }

    return this.generateTextImage(baseUrl!, apiKey!, model, req);
  }

  private async generateTextImage(
    baseUrl: string,
    apiKey: string,
    model: string,
    req: ImageGenerationRequest,
  ): Promise<ImageGenerationResult> {
    const url = `${baseUrl.replace(/\/$/, '')}/images/generations`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt: req.prompt,
        size: req.size || '1024x1024',
        n: 1,
      }),
    });
    return this.parseResult(res, `${req.referenceImage ? 'i2i-fallback ' : ''}generations`);
  }

  /** i2i via OpenAI-compatible multipart /images/edits. */
  private async editImage(
    baseUrl: string,
    apiKey: string,
    model: string,
    req: ImageGenerationRequest,
  ): Promise<ImageGenerationResult> {
    const { buffer, mime } = this.parseDataUrl(req.referenceImage!);
    const url = `${baseUrl.replace(/\/$/, '')}/images/edits`;
    const form = new FormData();
    form.append('model', model);
    form.append('prompt', req.prompt);
    form.append('n', '1');
    if (req.size) form.append('size', req.size);
    form.append(
      'image',
      new Blob([new Uint8Array(buffer)], { type: mime }),
      'reference.png',
    );

    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    return this.parseResult(res, 'i2i edits');
  }

  private async parseResult(
    res: Response,
    label: string,
  ): Promise<ImageGenerationResult> {
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      this.logger.error(`Image API (${label}) error ${res.status}: ${text}`);
      throw new InternalServerErrorException(
        `Image API (${label}) error ${res.status}`,
      );
    }
    const json: any = await res.json();
    const item = json?.data?.[0];
    const imageUrl =
      item?.url ||
      (item?.b64_json ? `data:image/png;base64,${item.b64_json}` : undefined);
    if (!imageUrl) {
      throw new InternalServerErrorException(
        `Image API (${label}) returned no image`,
      );
    }
    return { imageUrl };
  }

  /** Parse a `data:<mime>;base64,<b64>` URL into bytes + mime. */
  private parseDataUrl(dataUrl: string): {
    buffer: Buffer;
    mime: string;
  } {
    const m = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl);
    if (!m) {
      throw new Error('referenceImage is not a valid base64 data URL');
    }
    return { mime: m[1], buffer: Buffer.from(m[2], 'base64') };
  }
}
