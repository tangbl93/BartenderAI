import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { AppModule } from '../app.module';
import { RecipeEntity } from '../database/entities';
import { IllustrationService } from '../ai/illustration.service';

// Hand-drawn cartoon step-card style reference (i2i style anchor).
const REFERENCE_PATH = resolve(process.cwd(), 'uploads/202606/ee6dcd2ea4ab048d.png');
function loadReference(): string | undefined {
  try {
    const b64 = readFileSync(REFERENCE_PATH).toString('base64');
    return `data:image/png;base64,${b64}`;
  } catch {
    return undefined;
  }
}

/**
 * Pre-render the Chinese step/result image for every FEATURED (example) recipe
 * signature, and stamp it (plus the card thumbnail) onto ALL locale variants of
 * that cocktail — so opening a featured recipe needs no live generation.
 *
 *   NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7897 \
 *     node dist/scripts/seed-featured-images.js [--force]
 *
 * Groups examples by their zh-CN name (one image per cocktail, ~N signatures).
 */
async function main(): Promise<void> {
  const logger = new Logger('SeedFeaturedImages');
  const force = process.argv.includes('--force');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });
  const recipes = app.get<Repository<RecipeEntity>>(
    getRepositoryToken(RecipeEntity),
  );
  const illustration = app.get(IllustrationService);
  const referenceImage = loadReference();
  if (referenceImage) logger.log('Loaded style reference image (i2i).');
  else logger.warn('No style reference found; falling back to text-only.');

  const all = await recipes.find({ where: { isExample: true } });
  // Group locale variants of the same cocktail by their ingredientIds signature
  // (stable across locales) so one image is shared per cocktail.
  const byIngKey = new Map<string, RecipeEntity[]>();
  for (const r of all) {
    const ingKey = (r.ingredientIds || []).slice().sort().join('|');
    if (!ingKey) continue;
    const arr = byIngKey.get(ingKey) ?? [];
    arr.push(r);
    byIngKey.set(ingKey, arr);
  }

  const groupsArr = [...byIngKey.values()].filter((g) => g.length > 0);
  const targets = force
    ? groupsArr
    : groupsArr.filter((g) => g.some((r) => !r.featuredImageUrl));

  logger.log(
    `${targets.length} cocktail signature(s) need a featured image (of ${groupsArr.length}).`,
  );

  let ok = 0;
  let fail = 0;
  for (const group of targets) {
    // Use the zh-CN row for the Chinese name + steps in the prompt.
    const cn = group.find((r) => r.locale === 'zh-CN') ?? group[0];
    const items = (cn.items || []).map((i) => ({ name: i.name, amount: i.amount }));
    const prompt = illustration.featuredRecipePrompt(cn.name, items, cn.steps || []);
    // Portrait cartoon step image (tall, multi-panel), style-anchored to the reference.
    const url = await illustration.generate(
      prompt,
      `featured-${cn.id}`,
      '768x1536',
      referenceImage,
    );
    if (!url) {
      fail++;
      logger.warn(`✗ "${cn.name}" generation failed`);
      continue;
    }
    const ids = group.map((r) => r.id);
    // Only the step image; leave the flat cover (imageUrl) untouched.
    await recipes.update({ id: In(ids) }, { featuredImageUrl: url });
    ok++;
    logger.log(`✓ "${cn.name}" (${group.length} locales) -> ${url}`);
  }

  logger.log(`Done: ${ok} featured images, ${fail} failed.`);
  await app.close();
  process.exit(fail > 0 ? 2 : 0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed crashed:', err);
  process.exit(1);
});
