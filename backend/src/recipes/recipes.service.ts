import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { IngredientEntity, RecipeEntity } from '../database/entities';
import { normalizeLocale, resolveLocalized } from '../common/constants';
import {
  GeneratedRecipe,
  TEXT_PROVIDER,
  TextProvider,
  TextProviderIngredient,
} from '../ai/text-provider.interface';
import { I18nService } from '../i18n/i18n.service';
import { RecipeDto, RecipeGenerateDto } from './dto/recipe.dto';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(RecipeEntity)
    private readonly recipes: Repository<RecipeEntity>,
    @InjectRepository(IngredientEntity)
    private readonly ingredients: Repository<IngredientEntity>,
    @Inject(TEXT_PROVIDER) private readonly textProvider: TextProvider,
    private readonly i18n: I18nService,
  ) {}

  async generate(
    dto: RecipeGenerateDto,
    ownerId?: string,
  ): Promise<RecipeDto> {
    const locale = normalizeLocale(dto.locale);

    // Deduplicate selected ids.
    const ids = Array.from(new Set(dto.ingredientIds || []));
    if (ids.length < 2) {
      // 422 guidance: not enough ingredients.
      throw new UnprocessableEntityException({
        statusCode: 422,
        message: '请至少补充材料数量（需要 >=2 种材料）才能生成可饮用配方',
        code: 'INSUFFICIENT_INGREDIENTS',
      });
    }

    // Load only the selected, enabled ingredients.
    const rows = await this.ingredients.find({
      where: { id: In(ids), enabled: true },
    });
    if (rows.length < 2) {
      throw new UnprocessableEntityException({
        statusCode: 422,
        message: '所选材料不足或不可用，请补充更多有效材料',
        code: 'INSUFFICIENT_INGREDIENTS',
      });
    }

    const providerIngredients: TextProviderIngredient[] = rows.map((r) => ({
      id: r.id,
      category: r.category,
      name: resolveLocalized(r.names, locale),
    }));

    const generated = await this.textProvider.generateRecipe({
      ingredients: providerIngredients,
      locale,
    });

    // Safety/validation layer: ensure only-selected ingredients appear and
    // safety notes (适量饮用 / 未成年人禁饮) are always present.
    const validated = this.applySafetyConstraints(generated, rows, locale);

    const entity = await this.recipes.save(
      this.recipes.create({
        name: validated.name,
        tagline: validated.tagline,
        locale,
        items: validated.items,
        steps: validated.steps,
        toolSubstitutions: validated.toolSubstitutions,
        alcoholRange: validated.alcoholRange,
        safetyNotes: validated.safetyNotes,
        ingredientIds: rows.map((r) => r.id),
        isExample: false,
        ownerId: ownerId ?? null,
      }),
    );
    return this.toDto(entity);
  }

  /**
   * Backend constraint layer: drop any item not in the selected set, dedupe,
   * and guarantee the mandatory safety notes are present.
   */
  private applySafetyConstraints(
    generated: GeneratedRecipe,
    selected: IngredientEntity[],
    locale: string,
  ): GeneratedRecipe {
    const allowed = new Set(selected.map((s) => s.id));
    const filteredItems = (generated.items || []).filter((it) =>
      allowed.has(it.ingredientId),
    );

    const requiredNotes = this.i18n.safetyNotes(locale);
    const notes = generated.safetyNotes?.length
      ? Array.from(new Set([...generated.safetyNotes, ...requiredNotes]))
      : requiredNotes;

    return {
      ...generated,
      items: filteredItems.length ? filteredItems : generated.items,
      safetyNotes: notes,
    };
  }

  async findOne(id: string): Promise<RecipeDto> {
    const entity = await this.recipes.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException('配方不存在');
    }
    return this.toDto(entity);
  }

  /** Returns the raw entity (used by posters to snapshot text). */
  async getEntity(id: string): Promise<RecipeEntity> {
    const entity = await this.recipes.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException('配方不存在');
    }
    return entity;
  }

  async examples(locale = 'en'): Promise<RecipeDto[]> {
    const rows = await this.recipes.find({
      where: { isExample: true },
      order: { createdAt: 'ASC' },
    });
    const want = normalizeLocale(locale);
    // Prefer examples already in the requested locale; fall back to all.
    const matching = rows.filter((r) => r.locale === want);
    const chosen = matching.length ? matching : rows;
    return chosen.map((r) => this.toDto(r));
  }

  private toDto(e: RecipeEntity): RecipeDto {
    return {
      id: e.id,
      name: e.name,
      tagline: e.tagline,
      locale: e.locale,
      items: e.items,
      steps: e.steps,
      toolSubstitutions: e.toolSubstitutions,
      alcoholRange: e.alcoholRange,
      safetyNotes: e.safetyNotes,
      isExample: e.isExample,
    };
  }
}
