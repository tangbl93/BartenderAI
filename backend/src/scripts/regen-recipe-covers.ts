import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AppModule } from '../app.module';
import { RecipeEntity } from '../database/entities';
import { IllustrationService } from '../ai/illustration.service';

/**
 * Regenerate the flat-illustration COVER (imageUrl) for every example recipe,
 * keeping the pre-rendered step image (featuredImageUrl) untouched. One flat
 * image per cocktail signature, shared across locale variants.
 *
 *   NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7897 \
 *     node dist/scripts/regen-recipe-covers.js
 */
async function main(): Promise<void> {
  const logger = new Logger('RegenRecipeCovers');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });
  const recipes = app.get<Repository<RecipeEntity>>(
    getRepositoryToken(RecipeEntity),
  );
  const illustration = app.get(IllustrationService);

  const all = await recipes.find({ where: { isExample: true } });
  const byIngKey = new Map<string, RecipeEntity[]>();
  for (const r of all) {
    const ingKey = (r.ingredientIds || []).slice().sort().join('|');
    if (!ingKey) continue;
    const arr = byIngKey.get(ingKey) ?? [];
    arr.push(r);
    byIngKey.set(ingKey, arr);
  }
  const groups = [...byIngKey.values()].filter((g) => g.length > 0);
  logger.log(`${groups.length} cocktail signature(s) to (re)cover.`);

  let ok = 0;
  let fail = 0;
  for (const group of groups) {
    const cn = group.find((r) => r.locale === 'zh-CN') ?? group[0];
    const ingredients = (cn.items || []).map((i) => i.name);
    const url = await illustration.generate(
      illustration.recipePrompt(cn.name, ingredients),
      `cover-${cn.id}`,
    );
    if (!url) {
      fail++;
      logger.warn(`✗ "${cn.name}" cover failed`);
      continue;
    }
    await recipes.update(
      { id: In(group.map((r) => r.id)) },
      { imageUrl: url },
    );
    ok++;
    logger.log(`✓ "${cn.name}" cover -> ${url}`);
  }

  logger.log(`Done: ${ok} covers, ${fail} failed.`);
  await app.close();
  process.exit(fail > 0 ? 2 : 0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Crashed:', err);
  process.exit(1);
});
