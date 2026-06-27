import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IMAGE_PROVIDER,
  ImageProvider,
} from './image-provider.interface';
import {
  STORAGE_SERVICE,
  StorageService,
} from '../storage/storage.interface';

/**
 * Shared flat-illustration / icon-style artwork generator for ingredients and
 * recipes. Distinct from poster generation (which uses style templates + text
 * overlay): this produces a single, neutral, text-free catalog illustration.
 *
 * All generation is best-effort — callers fire it in the background and treat a
 * `null` result as "no image yet" rather than an error.
 */
const FLAT_STYLE =
  'Flat vector illustration, icon style, minimal and clean, bold simple shapes, ' +
  'soft solid pastel background, centered subject, no text, no watermark, no logo.';

@Injectable()
export class IllustrationService {
  private readonly logger = new Logger(IllustrationService.name);

  constructor(
    @Inject(IMAGE_PROVIDER) private readonly imageProvider: ImageProvider,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  /** Prompt for a single ingredient illustration. */
  ingredientPrompt(name: string, category: string): string {
    const cat = category.replace(/_/g, ' ');
    return `${FLAT_STYLE} A single bar ${cat} item: ${name}.`;
  }

  /** Prompt for a cocktail/recipe illustration. */
  recipePrompt(name: string, ingredients: string[]): string {
    const list = ingredients.filter(Boolean).join(', ');
    return (
      `${FLAT_STYLE} A finished cocktail drink served in a glass: ${name}.` +
      (list ? ` Made with ${list}.` : '')
    );
  }

  /**
   * Generate an illustration and return a persisted public URL, or `null` on
   * any failure. Never throws — safe to call without a try/catch.
   */
  async generate(prompt: string, seed: string): Promise<string | null> {
    try {
      const { imageUrl } = await this.imageProvider.generateImage({
        prompt,
        size: '1024x1024',
        seed,
      });
      if (!imageUrl) return null;
      return await this.persist(imageUrl, seed);
    } catch (err: any) {
      this.logger.warn(
        `Illustration generation failed (${seed}): ${err?.message || err}`,
      );
      return null;
    }
  }

  /**
   * Base64 data URLs are uploaded to object storage (never stored inline in the
   * DB); already-hosted http(s) URLs are passed through unchanged.
   */
  private async persist(imageUrl: string, seed: string): Promise<string> {
    const m = /^data:([^;]+);base64,(.*)$/s.exec(imageUrl);
    if (!m) return imageUrl;
    const mimetype = m[1];
    const data = Buffer.from(m[2], 'base64');
    const ext = mimetype.includes('jpeg') || mimetype.includes('jpg')
      ? '.jpg'
      : '.png';
    const { url } = await this.storage.upload({
      filename: `illustration-${seed}${ext}`,
      data,
      mimetype,
    });
    return url;
  }
}
