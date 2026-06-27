import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { IngredientEntity, RecipeEntity } from '../database/entities';
import { IllustrationService } from '../ai/illustration.service';
import { resolveLocalized } from '../common/constants';

/**
 * One-shot backfill: generate flat illustrations for every ingredient and every
 * example recipe (isExample) that doesn't have one yet, then persist the URL.
 *
 * Run AFTER building (`npm run build`) and with the image provider + outbound
 * proxy configured, e.g.:
 *   NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7897 \
 *     node dist/scripts/backfill-illustrations.js [--force]
 *
 * `--force` regenerates even when an imageUrl already exists.
 */
async function runLimited<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (cursor < items.length) {
        const idx = cursor++;
        await fn(items[idx]);
      }
    },
  );
  await Promise.all(workers);
}

async function main(): Promise<void> {
  const logger = new Logger('BackfillIllustrations');
  const force = process.argv.includes('--force');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['warn', 'error'],
  });

  const ingredients = app.get<Repository<IngredientEntity>>(
    getRepositoryToken(IngredientEntity),
  );
  const recipes = app.get<Repository<RecipeEntity>>(
    getRepositoryToken(RecipeEntity),
  );
  const illustration = app.get(IllustrationService);

  let ok = 0;
  let fail = 0;

  // ---- Ingredients ----
  const allIngredients = await ingredients.find();
  const ingTargets = allIngredients.filter((i) => force || !i.imageUrl);
  logger.log(
    `Ingredients: ${ingTargets.length} to generate (of ${allIngredients.length}).`,
  );
  await runLimited(ingTargets, 4, async (ing) => {
    const name =
      resolveLocalized(ing.names, 'en') || resolveLocalized(ing.names, 'zh-CN');
    if (!name) return;
    const url = await illustration.generate(
      illustration.ingredientPrompt(name, ing.category),
      `ingredient-${ing.id}`,
    );
    if (url) {
      await ingredients.update(ing.id, { imageUrl: url });
      ok++;
      logger.log(`✓ ingredient "${name}" -> ${url}`);
    } else {
      fail++;
      logger.warn(`✗ ingredient "${name}" generation failed`);
    }
  });

  // ---- Example recipes ----
  const allExamples = await recipes.find({ where: { isExample: true } });
  const exTargets = allExamples.filter((r) => force || !r.imageUrl);
  logger.log(
    `Example recipes: ${exTargets.length} to generate (of ${allExamples.length}).`,
  );
  await runLimited(exTargets, 4, async (r) => {
    const ingNames = (r.items || []).map((i) => i.name);
    const url = await illustration.generate(
      illustration.recipePrompt(r.name, ingNames),
      `recipe-${r.id}`,
    );
    if (url) {
      await recipes.update(r.id, { imageUrl: url });
      ok++;
      logger.log(`✓ recipe "${r.name}" -> ${url}`);
    } else {
      fail++;
      logger.warn(`✗ recipe "${r.name}" generation failed`);
    }
  });

  logger.log(`Backfill complete: ${ok} generated, ${fail} failed.`);
  await app.close();
  process.exit(fail > 0 ? 2 : 0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Backfill crashed:', err);
  process.exit(1);
});
