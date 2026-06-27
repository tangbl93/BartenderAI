import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { buildDataSourceOptions } from './data-source-options';
import {
  IngredientEntity,
  RecipeEntity,
  StyleTemplateEntity,
  UserEntity,
} from './entities';
import { SEED_INGREDIENTS, SEED_TEMPLATES } from './seed-data';
import { resolveLocalized } from '../common/constants';
import { COCKTAIL_SIGNATURES } from '../ai/cocktail-signatures';

/**
 * Idempotent seed. Inserts:
 *  - admin + operator users (and a demo front-end user)
 *  - sample ingredients across all 4 categories with 5-language names
 *  - the 3 default StyleTemplates
 *  - 2-3 example recipes (isExample=true)
 *
 * Reusable from `npm run seed` and from e2e tests.
 */
export async function seed(dataSource: DataSource): Promise<void> {
  const users = dataSource.getRepository(UserEntity);
  const ingredients = dataSource.getRepository(IngredientEntity);
  const templates = dataSource.getRepository(StyleTemplateEntity);
  const recipes = dataSource.getRepository(RecipeEntity);

  // ---- Users ----
  await upsertUser(users, 'admin@bartender.ai', 'admin12345', 'admin', 'Admin');
  await upsertUser(
    users,
    'operator@bartender.ai',
    'operator12345',
    'operator',
    'Operator',
  );
  await upsertUser(users, 'demo@bartender.ai', 'demo12345', 'user', 'Demo User');

  // ---- Ingredients ----
  const existingIngredients = await ingredients.find();
  const existingNames = new Set(
    existingIngredients.map((i) => resolveLocalized(i.names, 'en')),
  );
  const created: IngredientEntity[] = [...existingIngredients];
  for (const seed of SEED_INGREDIENTS) {
    if (existingNames.has(seed.names.en)) continue;
    const saved = await ingredients.save(
      ingredients.create({
        category: seed.category,
        names: seed.names,
        enabled: true,
      }),
    );
    created.push(saved);
  }

  // ---- Templates ----
  const existingTemplates = await templates.find();
  const existingTemplateNames = new Set(existingTemplates.map((t) => t.name));
  for (const seed of SEED_TEMPLATES) {
    if (existingTemplateNames.has(seed.name)) continue;
    await templates.save(
      templates.create({
        name: seed.name,
        dimension: seed.dimension,
        prompt: seed.prompt,
        layout: seed.layout,
        textRenderMode: seed.textRenderMode,
        enabled: true,
        version: 1,
      }),
    );
  }

  // ---- Example recipes (derived from COCKTAIL_SIGNATURES, en) ----
  // Idempotent: wipe prior seed examples (ownerId=null, isExample=true) and
  // re-insert. User recipes (isExample:false) are never touched.
  await recipes.delete({ isExample: true });

  const byEn = (en: string) =>
    created.find((c) => resolveLocalized(c.names, 'en') === en);

  for (const sig of COCKTAIL_SIGNATURES) {
    // Resolve each required ingredient's seeded id via its en name.
    const resolved = sig.require.map((req) => ({
      ...req,
      ingredient: byEn(req.enName),
    }));
    // Skip an example only if fewer than 2 required ingredients resolved.
    if (resolved.filter((r) => r.ingredient).length < 2) continue;

    const items = resolved
      .filter((r) => r.ingredient)
      .map((r) => ({
        ingredientId: r.ingredient!.id,
        name: r.enName,
        amount: r.amount,
        optional: r.optional ?? false,
      }));

    await recipes.save(
      recipes.create({
        name: sig.name.en,
        tagline: sig.tagline.en,
        locale: 'en',
        items,
        steps: sig.steps.en,
        toolSubstitutions: [
          { tool: 'jigger', homeAlternative: '1 jigger ≈ 1.5 tablespoons' },
        ],
        alcoholRange: sig.abv,
        safetyNotes: [
          'Please drink responsibly and in moderation.',
          'Alcohol is prohibited for minors.',
        ],
        ingredientIds: items.map((it) => it.ingredientId),
        isExample: true,
        ownerId: null,
      }),
    );
  }
}

async function upsertUser(
  repo: any,
  account: string,
  password: string,
  role: string,
  displayName: string,
): Promise<void> {
  const existing = await repo.findOne({ where: { account } });
  if (existing) return;
  const passwordHash = await bcrypt.hash(password, 10);
  await repo.save(repo.create({ account, passwordHash, role, displayName }));
}

// Standalone runner: `npm run seed`
if (require.main === module) {
  (async () => {
    const ds = new DataSource(buildDataSourceOptions(process.env));
    await ds.initialize();
    await seed(ds);
    await ds.destroy();
    // eslint-disable-next-line no-console
    console.log('Seed complete.');
  })().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
