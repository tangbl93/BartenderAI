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
   * Prompt for a featured recipe's pre-rendered STEP image (Chinese, shared
   * across locales). Rendered in the hand-drawn cartoon recipe-card style of
   * the reference template (i2i style anchor), with the cocktail's Chinese
   * title, materials and steps as legible text.
   */
  featuredRecipePrompt(
    name: string,
    items: { name: string; amount: string }[],
    steps: string[],
  ): string {
    const materials = items.map((i) => `${i.name} ${i.amount}`).join('、');
    const stepText = steps
      .slice(0, 5)
      .map((s, i) => `${i + 1}. ${s}`)
      .join('  ');
    return [
      '严格保持参考图的手绘卡通调酒步骤教学长图风格：米白底、低饱和马卡龙配色、',
      '深棕文字、可爱卡通插画与装饰图标、清新治愈氛围。模块化分栏：顶部大标题，',
      '中部「准备材料」图文区，核心区编号步骤（每步：序号+动作插画+中文说明），',
      '底部小贴士。务必把下面的中文文字清晰、正确地渲染到图上，替换参考图里的内容。',
      `大标题（中文）：${name}`,
      `准备材料（中文）：${materials}`,
      `制作步骤（中文，逐条渲染）：${stepText}`,
    ].join(' ');
  }

  /**
   * Generate an illustration and return a persisted public URL, or `null` on
   * any failure. Never throws — safe to call without a try/catch.
   */
  async generate(
    prompt: string,
    seed: string,
    size = '1024x1024',
    referenceImage?: string,
  ): Promise<string | null> {
    try {
      const { imageUrl } = await this.imageProvider.generateImage({
        prompt,
        size,
        seed,
        referenceImage,
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
