import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngredientEntity, RecipeEntity } from '../database/entities';
import {
  INGREDIENT_CATEGORIES,
  IngredientCategory,
  normalizeLocale,
  resolveLocalized,
} from '../common/constants';
import { IllustrationService } from '../ai/illustration.service';
import {
  IngredientDto,
  IngredientViewDto,
  PublicIngredientDto,
} from './dto/ingredient.dto';

@Injectable()
export class IngredientsService {
  private readonly logger = new Logger(IngredientsService.name);

  constructor(
    @InjectRepository(IngredientEntity)
    private readonly ingredients: Repository<IngredientEntity>,
    @InjectRepository(RecipeEntity)
    private readonly recipes: Repository<RecipeEntity>,
    private readonly illustration: IllustrationService,
  ) {}

  private assertCategory(category: string): void {
    if (!(INGREDIENT_CATEGORIES as readonly string[]).includes(category)) {
      throw new BadRequestException('分类非法');
    }
  }

  private toView(e: IngredientEntity, locale: string): IngredientViewDto {
    return {
      id: e.id,
      category: e.category,
      name: resolveLocalized(e.names, locale),
      enabled: e.enabled,
      imageUrl: e.imageUrl ?? null,
    };
  }

  /**
   * Fire-and-forget flat illustration generation. Writes only the imageUrl
   * column when the provider returns; failures are swallowed so they never
   * block ingredient creation.
   */
  private scheduleIllustration(entity: IngredientEntity): void {
    const name =
      resolveLocalized(entity.names, 'en') ||
      resolveLocalized(entity.names, 'zh-CN');
    if (!name) return;
    const prompt = this.illustration.ingredientPrompt(name, entity.category);
    void this.illustration
      .generate(prompt, `ingredient-${entity.id}`)
      .then((url) => {
        if (url) return this.ingredients.update(entity.id, { imageUrl: url });
      })
      .catch((err) =>
        this.logger.warn(
          `Ingredient ${entity.id} illustration failed: ${err?.message || err}`,
        ),
      );
  }

  /** Public list: enabled only, localized name, optional category filter. */
  async listPublic(
    locale: string,
    category?: string,
  ): Promise<IngredientViewDto[]> {
    if (category) {
      this.assertCategory(category);
    }
    const where: any = { enabled: true };
    if (category) {
      where.category = category;
    }
    const rows = await this.ingredients.find({ where, order: { createdAt: 'ASC' } });
    return rows.map((r) => this.toView(r, locale));
  }

  /** Admin list: includes disabled. Localized for readability (default en). */
  async listAll(locale = 'en'): Promise<IngredientViewDto[]> {
    const rows = await this.ingredients.find({ order: { createdAt: 'ASC' } });
    return rows.map((r) => this.toView(r, locale));
  }

  async create(
    dto: IngredientDto,
    createdBy: string | null = null,
  ): Promise<IngredientViewDto> {
    this.assertCategory(dto.category);
    const entity = await this.ingredients.save(
      this.ingredients.create({
        category: dto.category as IngredientCategory,
        names: dto.names,
        enabled: dto.enabled ?? true,
        createdBy,
      }),
    );
    this.scheduleIllustration(entity);
    return this.toView(entity, 'en');
  }

  /**
   * User-contributed ingredient. Enabled + public immediately, attributed to
   * the submitter, and given a flat illustration in the background.
   */
  async createPublic(
    dto: PublicIngredientDto,
    userId: string,
  ): Promise<IngredientViewDto> {
    this.assertCategory(dto.category);
    const locale = normalizeLocale(dto.locale);
    const name = dto.name.trim();
    if (!name) {
      throw new BadRequestException('材料名称不能为空');
    }
    const entity = await this.ingredients.save(
      this.ingredients.create({
        category: dto.category as IngredientCategory,
        names: { [locale]: name },
        enabled: true,
        createdBy: userId,
      }),
    );
    this.scheduleIllustration(entity);
    return this.toView(entity, locale);
  }

  async update(id: string, dto: IngredientDto): Promise<IngredientViewDto> {
    this.assertCategory(dto.category);
    const entity = await this.ingredients.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException('材料不存在');
    }
    entity.category = dto.category as IngredientCategory;
    entity.names = dto.names;
    if (dto.enabled !== undefined) {
      entity.enabled = dto.enabled;
    }
    await this.ingredients.save(entity);
    return this.toView(entity, 'en');
  }

  /**
   * Delete or soft-disable. If the ingredient is referenced by any recipe we
   * soft-disable (set enabled=false) to protect historical recipes; otherwise
   * we hard-delete.
   */
  async remove(id: string): Promise<void> {
    const entity = await this.ingredients.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException('材料不存在');
    }
    const referenced = await this.isReferenced(id);
    if (referenced) {
      entity.enabled = false;
      await this.ingredients.save(entity);
      return;
    }
    await this.ingredients.remove(entity);
  }

  private async isReferenced(ingredientId: string): Promise<boolean> {
    const recipes = await this.recipes.find();
    return recipes.some((r) =>
      (r.ingredientIds || []).includes(ingredientId) ||
      (r.items || []).some((it) => it.ingredientId === ingredientId),
    );
  }
}
