import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngredientEntity, RecipeEntity } from '../database/entities';
import {
  INGREDIENT_CATEGORIES,
  IngredientCategory,
  resolveLocalized,
} from '../common/constants';
import { IngredientDto, IngredientViewDto } from './dto/ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(IngredientEntity)
    private readonly ingredients: Repository<IngredientEntity>,
    @InjectRepository(RecipeEntity)
    private readonly recipes: Repository<RecipeEntity>,
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
    };
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

  async create(dto: IngredientDto): Promise<IngredientViewDto> {
    this.assertCategory(dto.category);
    const entity = await this.ingredients.save(
      this.ingredients.create({
        category: dto.category as IngredientCategory,
        names: dto.names,
        enabled: dto.enabled ?? true,
      }),
    );
    return this.toView(entity, 'en');
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
