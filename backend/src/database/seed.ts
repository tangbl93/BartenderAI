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

  // ---- Example recipes ----
  const exampleCount = await recipes.count({ where: { isExample: true } });
  if (exampleCount === 0) {
    const byEn = (en: string) =>
      created.find((c) => resolveLocalized(c.names, 'en') === en);

    const gin = byEn('Gin');
    const tonic = byEn('Tonic Water');
    const lime = byEn('Lime');
    const vodka = byEn('Vodka');
    const oj = byEn('Orange Juice');
    const rum = byEn('Rum');
    const cola = byEn('Cola');
    const lemon = byEn('Lemon');

    const examples = [
      {
        name: 'Garden Gin & Tonic',
        tagline: 'A crisp, botanical pick-me-up for golden evenings.',
        locale: 'en',
        ids: [gin?.id, tonic?.id, lime?.id].filter(Boolean) as string[],
        items: [
          { ingredientId: gin?.id, name: 'Gin', amount: '45 ml', optional: false },
          { ingredientId: tonic?.id, name: 'Tonic Water', amount: '90 ml', optional: false },
          { ingredientId: lime?.id, name: 'Lime', amount: '1 pc', optional: true },
        ],
        alcohol: '8-12% ABV',
      },
      {
        name: 'Sunrise Screwdriver',
        tagline: 'Bright citrus over smooth vodka — brunch in a glass.',
        locale: 'en',
        ids: [vodka?.id, oj?.id].filter(Boolean) as string[],
        items: [
          { ingredientId: vodka?.id, name: 'Vodka', amount: '45 ml', optional: false },
          { ingredientId: oj?.id, name: 'Orange Juice', amount: '120 ml', optional: false },
        ],
        alcohol: '8-10% ABV',
      },
      {
        name: 'Easy Rum Cola',
        tagline: 'The no-fuss classic for a mellow night in.',
        locale: 'en',
        ids: [rum?.id, cola?.id, lemon?.id].filter(Boolean) as string[],
        items: [
          { ingredientId: rum?.id, name: 'Rum', amount: '45 ml', optional: false },
          { ingredientId: cola?.id, name: 'Cola', amount: '120 ml', optional: false },
          { ingredientId: lemon?.id, name: 'Lemon', amount: '1 wedge', optional: true },
        ],
        alcohol: '8-12% ABV',
      },
    ];

    for (const ex of examples) {
      if (ex.ids.length < 2) continue;
      await recipes.save(
        recipes.create({
          name: ex.name,
          tagline: ex.tagline,
          locale: ex.locale,
          items: ex.items.map((it) => ({
            ingredientId: it.ingredientId as string,
            name: it.name,
            amount: it.amount,
            optional: it.optional,
          })),
          steps: [
            'Fill a glass with ice.',
            'Pour the spirit, then the mixer.',
            'Stir gently and garnish.',
            'Sip slowly and enjoy responsibly.',
          ],
          toolSubstitutions: [
            { tool: 'jigger', homeAlternative: '1 jigger ≈ 1.5 tablespoons' },
          ],
          alcoholRange: ex.alcohol,
          safetyNotes: [
            'Please drink responsibly and in moderation.',
            'Alcohol is prohibited for minors.',
          ],
          ingredientIds: ex.ids,
          isExample: true,
          ownerId: null,
        }),
      );
    }
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
