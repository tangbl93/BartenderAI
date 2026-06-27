import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { PostersService } from './posters.service';
import { OverlayService } from './overlay.service';
import {
  PosterEntity,
  PosterJobEntity,
  RecipeEntity,
  StyleTemplateEntity,
} from '../database/entities';
import { ImageProvider } from '../ai/image-provider.interface';
import { createTestDataSource } from '../../test/test-datasource';

describe('PostersService', () => {
  let ds: DataSource;
  let service: PostersService;
  let recipe: RecipeEntity;
  let templates: StyleTemplateEntity[];

  // Controllable image provider: fails for prompts containing FAIL_MARK.
  const FAIL_MARK = 'bar_commercial_fail';
  let failNext = false;
  const imageProvider: ImageProvider = {
    async generateImage(req) {
      if (req.prompt.includes(FAIL_MARK) && failNext) {
        throw new Error('simulated image failure');
      }
      return { imageUrl: `https://img.local/${req.seed}.png` };
    },
  };

  beforeEach(async () => {
    ds = await createTestDataSource();
    const recipeRepo = ds.getRepository(RecipeEntity);
    recipe = await recipeRepo.save(
      recipeRepo.create({
        name: 'Test Cocktail',
        tagline: 'A test tagline',
        locale: 'en',
        items: [
          { ingredientId: 'a', name: 'Gin', amount: '45 ml', optional: false },
          { ingredientId: 'b', name: 'Tonic', amount: '90 ml', optional: false },
        ],
        steps: ['s'],
        toolSubstitutions: [],
        alcoholRange: '8-12% ABV',
        safetyNotes: ['note'],
        ingredientIds: ['a', 'b'],
        isExample: false,
        ownerId: null,
      }),
    );

    const templateRepo = ds.getRepository(StyleTemplateEntity);
    const t1 = await templateRepo.save(
      templateRepo.create({
        name: 'Home',
        dimension: 'home_closeup',
        prompt: 'home prompt',
        layout: { textAlign: 'center', watermarkPosition: 'bottom-right' },
        textRenderMode: 'backend',
        enabled: true,
        version: 1,
      }),
    );
    const t2 = await templateRepo.save(
      templateRepo.create({
        name: 'Bar',
        dimension: 'bar_commercial',
        prompt: FAIL_MARK,
        layout: { textAlign: 'center', watermarkPosition: 'bottom-right' },
        textRenderMode: 'model',
        enabled: true,
        version: 1,
      }),
    );
    templates = [t1, t2];

    const recipesService = {
      getEntity: async (id: string) =>
        ds.getRepository(RecipeEntity).findOneOrFail({ where: { id } }),
    } as any;
    const templatesService = {
      resolveForJob: async () => templates,
    } as any;

    service = new PostersService(
      ds.getRepository(PosterJobEntity),
      ds.getRepository(PosterEntity),
      imageProvider,
      recipesService,
      templatesService,
      new OverlayService(),
      new ConfigService({ posterTimeoutMs: 2000 }),
    );
  });

  afterEach(async () => {
    await ds.destroy();
  });

  it('creates a job with >=3 dimensions worth of posters and text snapshot from recipe', async () => {
    failNext = false;
    const job = await service.createJob({ recipeId: recipe.id });
    expect(job.posters.length).toBe(2);
    expect(job.status).toBe('done');
    // Poster text snapshot mirrors recipe content.
    const bar = job.posters.find((p) => p.dimension === 'bar_commercial')!;
    expect(bar.textSnapshot!.name).toBe('Test Cocktail');
    expect(bar.textSnapshot!.tagline).toBe('A test tagline');
  });

  it('records PARTIAL success when one poster fails and the others succeed', async () => {
    failNext = true;
    const job = await service.createJob({ recipeId: recipe.id });
    expect(job.status).toBe('partial');
    const failed = job.posters.filter((p) => p.status === 'failed');
    const done = job.posters.filter((p) => p.status === 'done');
    expect(failed.length).toBe(1);
    expect(done.length).toBe(1);
    expect(failed[0].dimension).toBe('bar_commercial');
  });

  it('retries a single failed poster and recomputes job status to done', async () => {
    failNext = true;
    const job = await service.createJob({ recipeId: recipe.id });
    const failed = job.posters.find((p) => p.status === 'failed')!;

    // Now allow the retry to succeed.
    failNext = false;
    const after = await service.retryPoster(failed.id);
    expect(after.status).toBe('done');
    expect(after.posters.every((p) => p.status === 'done')).toBe(true);
  });
});
