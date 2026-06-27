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
 * Real image provider that POSTs to an OpenAI-compatible image endpoint:
 *   POST ${IMAGE_API_BASE_URL}/images/generations
 *   model: gpt-image-2
 *   Authorization: Bearer ${IMAGE_API_KEY}
 *
 * The API key is read from config (env) — NEVER hardcoded. If no key is set the
 * module wiring defaults to the stub provider instead of this one.
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

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      this.logger.error(`Image API error ${res.status}: ${text}`);
      throw new InternalServerErrorException(`Image API error ${res.status}`);
    }

    const json: any = await res.json();
    // OpenAI-compatible shape: { data: [{ url } | { b64_json }] }
    const item = json?.data?.[0];
    const imageUrl =
      item?.url ||
      (item?.b64_json ? `data:image/png;base64,${item.b64_json}` : undefined);

    if (!imageUrl) {
      throw new InternalServerErrorException('Image API returned no image');
    }
    return { imageUrl };
  }
}
