import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { StyleTemplateEntity } from '../database/entities';
import { TemplatesService } from '../templates/templates.service';

/**
 * Seed 8 preset cocktail POSTER STYLE templates (distinct art aesthetics) and
 * generate a reference image for each (and for any template missing one).
 * Idempotent on template name.
 *
 *   NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7897 \
 *     node dist/scripts/seed-cocktail-templates.js
 */
const COCKTAIL_TEMPLATES: Array<{
  name: string;
  dimension: string;
  prompt: string;
}> = [
  {
    name: '霓虹赛博',
    dimension: 'custom',
    prompt:
      'Neon cyberpunk cocktail poster, glowing electric-blue and magenta neon lights, ' +
      'dark moody bar background, futuristic glassware, cinematic rim light, no text.',
  },
  {
    name: '复古海报',
    dimension: 'custom',
    prompt:
      'Vintage 1950s art-deco cocktail poster, warm sepia and gold palette, retro ' +
      'typography-free illustration, halftone texture, classic martini glass, no text.',
  },
  {
    name: '水彩手绘',
    dimension: 'custom',
    prompt:
      'Soft watercolor cocktail illustration, hand-painted pastel washes, light paper ' +
      'texture, delicate brush strokes, fresh and airy, no text.',
  },
  {
    name: '极简线条',
    dimension: 'custom',
    prompt:
      'Minimalist single-line cocktail illustration, clean black line art on off-white, ' +
      'lots of negative space, elegant and modern, no text.',
  },
  {
    name: '日式和风',
    dimension: 'custom',
    prompt:
      'Japanese ukiyo-e style cocktail illustration, muted indigo and vermilion, wave ' +
      'and floral motifs, traditional woodblock print texture, no text.',
  },
  {
    name: '热带夏日',
    dimension: 'custom',
    prompt:
      'Tropical summer cocktail illustration, lush palm leaves, bright coral and ' +
      'sunshine yellow, tiki glass with fruit garnish, vibrant flat colors, no text.',
  },
  {
    name: '暗夜奢华',
    dimension: 'custom',
    prompt:
      'Dark luxury cocktail poster, deep black and emerald, golden highlights, ' +
      'crystal highball glass with condensation, dramatic spotlight, opulent mood, no text.',
  },
  {
    name: '波普艺术',
    dimension: 'custom',
    prompt:
      'Pop-art comic cocktail illustration, bold primary colors, thick black outlines, ' +
      'halftone dots, playful retro-comic energy, no text.',
  },
];

async function main(): Promise<void> {
  const logger = new Logger('SeedCocktailTemplates');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  const repo = app.get<Repository<StyleTemplateEntity>>(
    getRepositoryToken(StyleTemplateEntity),
  );
  const templates = app.get(TemplatesService);

  // ---- Insert presets (idempotent by name) ----
  const existing = await repo.find();
  const byName = new Map(existing.map((t) => [t.name, t]));
  for (const seed of COCKTAIL_TEMPLATES) {
    if (byName.has(seed.name)) {
      logger.log(`skip existing template "${seed.name}"`);
      continue;
    }
    await repo.save(
      repo.create({
        name: seed.name,
        dimension: seed.dimension,
        prompt: seed.prompt,
        layout: { textAlign: 'center', watermarkPosition: 'bottom-right' },
        textRenderMode: 'backend',
        enabled: true,
        version: 1,
      }),
    );
    logger.log(`created template "${seed.name}"`);
  }

  // ---- Generate reference images for every template missing one ----
  const all = await repo.find();
  const missing = all.filter((t) => !t.referenceImageUrl);
  logger.log(
    `generating reference images for ${missing.length} template(s) (of ${all.length}).`,
  );
  let ok = 0;
  let fail = 0;
  for (const t of missing) {
    try {
      const { referenceImageUrl } = await templates.generateReferenceImage(t.id);
      ok++;
      logger.log(`✓ "${t.name}" -> ${referenceImageUrl}`);
    } catch (err: any) {
      fail++;
      logger.warn(`✗ "${t.name}" failed: ${err?.message || err}`);
    }
  }
  logger.log(`Done: ${ok} generated, ${fail} failed.`);
  await app.close();
  process.exit(fail > 0 ? 2 : 0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed crashed:', err);
  process.exit(1);
});
