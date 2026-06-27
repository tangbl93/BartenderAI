import { DataSource } from 'typeorm';
import { ENTITIES } from './entities';
import {
  IngredientEntity,
  RecipeEntity,
  StyleTemplateEntity,
  UserEntity,
} from './entities';
import { seed } from './seed';
import { resolveLocalized } from '../common/constants';

async function freshDs(): Promise<DataSource> {
  const ds = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: ENTITIES,
    synchronize: true,
    dropSchema: true,
  });
  await ds.initialize();
  return ds;
}

describe('seed()', () => {
  it('seeds ~40 ingredients, 3 templates, and exactly 16 example recipes', async () => {
    const ds = await freshDs();
    await seed(ds);

    const ingredients = await ds.getRepository(IngredientEntity).count();
    const templates = await ds.getRepository(StyleTemplateEntity).count();
    const examples = await ds
      .getRepository(RecipeEntity)
      .count({ where: { isExample: true } });
    const users = await ds.getRepository(UserEntity).count();

    expect(ingredients).toBeGreaterThanOrEqual(38); // ~40
    expect(templates).toBe(3);
    expect(examples).toBe(16);
    expect(users).toBeGreaterThanOrEqual(3); // admin + operator + demo
    await ds.destroy();
  });

  it('is idempotent: running twice yields stable counts and no stale examples', async () => {
    const ds = await freshDs();
    await seed(ds);

    const counts1 = {
      ingredients: await ds.getRepository(IngredientEntity).count(),
      examples: await ds.getRepository(RecipeEntity).count({
        where: { isExample: true },
      }),
    };

    await seed(ds);

    const counts2 = {
      ingredients: await ds.getRepository(IngredientEntity).count(),
      examples: await ds.getRepository(RecipeEntity).count({
        where: { isExample: true },
      }),
    };

    // Counts stable across re-seed.
    expect(counts2.ingredients).toBe(counts1.ingredients);
    expect(counts2.examples).toBe(counts1.examples);
    expect(counts2.examples).toBe(16);
    await ds.destroy();
  });

  it('wipes stale (edited) example rows and re-inserts the canonical set', async () => {
    const ds = await freshDs();
    await seed(ds);

    // Mutate one example as if a user/admin "broke" it.
    const repo = ds.getRepository(RecipeEntity);
    const one = await repo.findOne({ where: { isExample: true } });
    expect(one).toBeTruthy();
    await repo.update(one!.id, { name: 'STALE-NAME', tagline: 'stale' });

    // Re-seed: stale example must be gone, replaced by the canonical name.
    await seed(ds);
    const stillThere = await repo.findOne({
      where: { id: one!.id },
    });
    // The old row was deleted (delete by isExample=true), so by-id lookup
    // should either be null OR the id is fresh — assert the STALE name is gone.
    if (stillThere) {
      expect(stillThere.name).not.toBe('STALE-NAME');
    }
    const anyStale = await repo.findOne({ where: { name: 'STALE-NAME' } as any });
    expect(anyStale).toBeNull();
    const examples = await repo.count({ where: { isExample: true } });
    expect(examples).toBe(16);
    await ds.destroy();
  });

  it('example recipes resolve to seeded ingredient ids (en names align)', async () => {
    const ds = await freshDs();
    await seed(ds);
    const repo = ds.getRepository(RecipeEntity);
    const examples = await repo.find({ where: { isExample: true } });
    // At least one example is the Margarita, using Tequila + Triple Sec.
    const marg = examples.find((e) => e.name === 'Margarita');
    expect(marg).toBeTruthy();
    const margItemNames = marg!.items.map((i) => i.name);
    expect(margItemNames).toEqual(
      expect.arrayContaining(['Tequila', 'Triple Sec']),
    );
    // Each example ingredient id must reference a real seeded ingredient.
    const ingredients = await ds.getRepository(IngredientEntity).find();
    const ids = new Set(ingredients.map((i) => i.id));
    for (const ex of examples) {
      for (const it of ex.items) {
        expect(ids.has(it.ingredientId)).toBe(true);
      }
    }
    await ds.destroy();
  });
});
