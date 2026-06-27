import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IngredientsService } from './ingredients.service';
import {
  IngredientEntity,
  RecipeEntity,
} from '../database/entities';
import { createTestDataSource } from '../../test/test-datasource';

describe('IngredientsService', () => {
  let ds: DataSource;
  let service: IngredientsService;

  beforeEach(async () => {
    ds = await createTestDataSource();
    service = new IngredientsService(
      ds.getRepository(IngredientEntity),
      ds.getRepository(RecipeEntity),
    );
  });

  afterEach(async () => {
    await ds.destroy();
  });

  const names = {
    en: 'Gin',
    'zh-CN': '金酒',
    'zh-TW': '琴酒',
    ja: 'ジン',
    ko: '진',
  };

  it('rejects an invalid category (400)', async () => {
    await expect(
      service.create({ category: 'poison' as any, names }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts a valid category and localizes the name', async () => {
    const created = await service.create({ category: 'base_spirit', names });
    expect(created.category).toBe('base_spirit');

    const zh = await service.listPublic('zh-CN');
    expect(zh[0].name).toBe('金酒');
    const fallback = await service.listPublic('fr'); // unsupported → en fallback
    expect(fallback[0].name).toBe('Gin');
  });

  it('public list only returns enabled ingredients', async () => {
    const a = await service.create({ category: 'drink', names: { en: 'Cola' } });
    await service.create({ category: 'drink', names: { en: 'Soda' }, enabled: false });
    const list = await service.listPublic('en');
    expect(list.map((i) => i.name)).toContain('Cola');
    expect(list.map((i) => i.name)).not.toContain('Soda');
    expect(a).toBeDefined();
  });

  it('SOFT-disables (not hard-deletes) an ingredient referenced by a recipe', async () => {
    const ing = await service.create({ category: 'base_spirit', names });
    const recipeRepo = ds.getRepository(RecipeEntity);
    await recipeRepo.save(
      recipeRepo.create({
        name: 'Test',
        tagline: 't',
        locale: 'en',
        items: [{ ingredientId: ing.id, name: 'Gin', amount: '45 ml', optional: false }],
        steps: ['s'],
        toolSubstitutions: [],
        alcoholRange: '8% ABV',
        safetyNotes: [],
        ingredientIds: [ing.id],
        isExample: false,
        ownerId: null,
      }),
    );

    await service.remove(ing.id);
    const stillThere = await ds
      .getRepository(IngredientEntity)
      .findOne({ where: { id: ing.id } });
    expect(stillThere).not.toBeNull();
    expect(stillThere!.enabled).toBe(false);
  });

  it('hard-deletes an unreferenced ingredient', async () => {
    const ing = await service.create({ category: 'fruit', names: { en: 'Lemon' } });
    await service.remove(ing.id);
    const gone = await ds
      .getRepository(IngredientEntity)
      .findOne({ where: { id: ing.id } });
    expect(gone).toBeNull();
  });
});
