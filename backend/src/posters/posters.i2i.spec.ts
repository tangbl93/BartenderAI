import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PostersService } from './posters.service';
import { OverlayService } from './overlay.service';
import {
  PosterEntity,
  PosterJobEntity,
  RecipeEntity,
  StyleTemplateEntity,
} from '../database/entities';
import { createTestDataSource } from '../../test/test-datasource';
import { TemplatesService } from '../templates/templates.service';
import {
  ImageGenerationRequest,
  ImageProvider,
} from '../ai/image-provider.interface';
import {
  StorageService,
  StorageUpload,
} from '../storage/storage.interface';

/** Minimal in-memory storage stub (avoids touching the filesystem). */
class InMemStorage implements StorageService {
  async upload(u: StorageUpload) {
    return { url: `https://storage.local/${u.filename}`, key: u.filename };
  }
}

/** Provider that records the last request so we can assert referenceImage. */
class RecordingProvider implements ImageProvider {
  lastReq?: ImageGenerationRequest;
  async generateImage(req: ImageGenerationRequest) {
    this.lastReq = req;
    return { imageUrl: `https://stub.local/i2i-${Date.now()}.png` };
  }
}

describe('PostersService i2i reference image forwarding', () => {
  let ds: DataSource;
  let service: PostersService;
  let provider: RecordingProvider;
  let templatesService: TemplatesService;

  beforeEach(async () => {
    ds = await createTestDataSource();
    provider = new RecordingProvider();
    const config = {
      get: (k: string) => (k === 'posterTimeoutMs' ? 5000 : undefined),
    } as ConfigService;
    templatesService = new TemplatesService(
      ds.getRepository(StyleTemplateEntity),
      provider,
      new InMemStorage(),
    );
    // Seed one enabled template so resolveForJob returns it.
    const repo = ds.getRepository(StyleTemplateEntity);
    await repo.save(
      repo.create({
        name: 'T',
        dimension: 'home_closeup',
        prompt: 'p',
        layout: { textAlign: 'center', watermarkPosition: 'bottom-right' },
        textRenderMode: 'backend',
        enabled: true,
        version: 1,
      }),
    );
    // Seed a recipe so createJob can resolve it.
    const recipeRepo = ds.getRepository(RecipeEntity);
    const recipe = await recipeRepo.save(
      recipeRepo.create({
        name: 'Mojito',
        tagline: 't',
        locale: 'en',
        items: [],
        steps: [],
        toolSubstitutions: [],
        alcoholRange: '0%',
        safetyNotes: [],
        ingredientIds: [],
        isExample: false,
        ownerId: 'u1',
      }),
    );

    // Build the service with a real RecipesService stub (only getEntity used).
    const recipesService = {
      getEntity: async () => recipe,
    } as any;
    service = new PostersService(
      ds.getRepository(PosterJobEntity),
      ds.getRepository(PosterEntity),
      provider as any,
      recipesService,
      templatesService,
      new OverlayService(),
      config,
    );
  });

  afterEach(async () => {
    await ds.destroy();
  });

  it('forwards referenceImage to the image provider when present', async () => {
    const recipe = await ds.getRepository(RecipeEntity).findOne({ where: {} });
    const job = await service.createJob(
      {
        recipeId: recipe!.id,
        locale: 'en',
        referenceImage: 'data:image/png;base64,AAAA',
      },
      'u1',
    );
    expect(job.status).toBe('done');
    expect(provider.lastReq?.referenceImage).toBe('data:image/png;base64,AAAA');
  });

  it('omits referenceImage when the request did not include one', async () => {
    const recipe = await ds.getRepository(RecipeEntity).findOne({ where: {} });
    await service.createJob({ recipeId: recipe!.id, locale: 'en' }, 'u1');
    expect(provider.lastReq?.referenceImage).toBeUndefined();
  });
});
