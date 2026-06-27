import { UnprocessableEntityException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RecipesService } from './recipes.service';
import { IngredientEntity, RecipeEntity } from '../database/entities';
import { StubTextProvider } from '../ai/stub-text.provider';
import { I18nService } from '../i18n/i18n.service';
import { createTestDataSource } from '../../test/test-datasource';

describe('RecipesService', () => {
  let ds: DataSource;
  let service: RecipesService;
  let ingredientRepo: ReturnType<DataSource['getRepository']>;
  const i18n = new I18nService();

  async function seedIngredient(category: string, name: string) {
    return ingredientRepo.save(
      ingredientRepo.create({
        category: category as any,
        names: { en: name },
        enabled: true,
      }),
    );
  }

  beforeEach(async () => {
    ds = await createTestDataSource();
    ingredientRepo = ds.getRepository(IngredientEntity);
    service = new RecipesService(
      ds.getRepository(RecipeEntity),
      ds.getRepository(IngredientEntity) as any,
      new StubTextProvider(i18n),
      i18n,
    );
  });

  afterEach(async () => {
    await ds.destroy();
  });

  it('rejects with 422 when fewer than 2 ingredients are selected', async () => {
    const gin: any = await seedIngredient('base_spirit', 'Gin');
    await expect(
      service.generate({ ingredientIds: [gin.id], locale: 'en' }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('generates a recipe using ONLY the selected ingredients', async () => {
    const gin: any = await seedIngredient('base_spirit', 'Gin');
    const tonic: any = await seedIngredient('drink', 'Tonic');
    // An unselected ingredient that must NOT appear.
    await seedIngredient('fruit', 'Lemon');

    const recipe = await service.generate({
      ingredientIds: [gin.id, tonic.id],
      locale: 'en',
    });

    const usedIds = recipe.items.map((i) => i.ingredientId);
    expect(usedIds.sort()).toEqual([gin.id, tonic.id].sort());
    expect(recipe.items.length).toBe(2);
    // Precise amounts present.
    expect(recipe.items.find((i) => i.ingredientId === gin.id)!.amount).toBe('45 ml');
    // Safety notes include moderate-drinking + underage prohibition.
    expect(recipe.safetyNotes.join(' ')).toContain('moderation');
    expect(recipe.safetyNotes.join(' ')).toContain('minors');
    expect(recipe.name).toBeTruthy();
    expect(recipe.tagline).toBeTruthy();
  });

  it('matches the Gin & Tonic signature (not the old "Midnight Gin Fusion")', async () => {
    const gin: any = await seedIngredient('base_spirit', 'Gin');
    const tonic: any = await seedIngredient('drink', 'Tonic Water');
    const recipe = await service.generate({
      ingredientIds: [gin.id, tonic.id],
      locale: 'en',
    });
    expect(recipe.name).toBe('Gin & Tonic');
    expect(recipe.alcoholRange).toBe('10% ABV');
  });

  it('produces Traditional Chinese for zh-TW', async () => {
    const gin: any = await seedIngredient('base_spirit', 'Gin');
    const tonic: any = await seedIngredient('drink', 'Tonic');
    const recipe = await service.generate({
      ingredientIds: [gin.id, tonic.id],
      locale: 'zh-TW',
    });
    expect(recipe.locale).toBe('zh-TW');
    // Traditional form 「攪」 not simplified 「搅」
    expect(recipe.steps.join(' ')).toContain('攪');
    expect(recipe.safetyNotes.join(' ')).toContain('適量飲用');
  });

  it('lists example recipes', async () => {
    const repo = ds.getRepository(RecipeEntity);
    await repo.save(
      repo.create({
        name: 'Example One',
        tagline: 't',
        locale: 'en',
        items: [],
        steps: [],
        toolSubstitutions: [],
        alcoholRange: '8% ABV',
        safetyNotes: [],
        ingredientIds: [],
        isExample: true,
        ownerId: null,
      }),
    );
    const examples = await service.examples('en');
    expect(examples.length).toBe(1);
    expect(examples[0].isExample).toBe(true);
  });

  it('returns at least 15 seeded example recipes after seed', async () => {
    // Seed uses a shared file DB; this test exercises the full seed() to
    // guarantee 15 classic examples are produced from signatures.
    const { seed } = await import('../database/seed');
    const { DataSource } = await import('typeorm');
    const { ENTITIES } = await import('../database/entities');
    const fileDs = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: ENTITIES,
      synchronize: true,
      dropSchema: true,
    });
    await fileDs.initialize();
    await seed(fileDs);
    const recipesRepo = fileDs.getRepository(RecipeEntity);
    const examples = await recipesRepo.find({ where: { isExample: true } });
    expect(examples.length).toBeGreaterThanOrEqual(15);
    await fileDs.destroy();
  });
});
