import { DataSource } from 'typeorm';
import { AdminContentService } from './admin-content.service';
import { ModerationService } from '../moderation/moderation.service';
import {
  LabEntryEntity,
  ModerationRecordEntity,
  PosterEntity,
  PosterJobEntity,
  RecipeEntity,
} from '../database/entities';
import { createTestDataSource } from '../../test/test-datasource';

describe('AdminContentService + ModerationService (public/hidden flow)', () => {
  let ds: DataSource;
  let moderation: ModerationService;
  let content: AdminContentService;
  let labRepo: ReturnType<DataSource['getRepository']>;

  beforeEach(async () => {
    ds = await createTestDataSource();
    labRepo = ds.getRepository(LabEntryEntity);
    moderation = new ModerationService(
      ds.getRepository(LabEntryEntity),
      ds.getRepository(ModerationRecordEntity),
    );
    content = new AdminContentService(
      ds.getRepository(RecipeEntity),
      ds.getRepository(PosterJobEntity),
      ds.getRepository(LabEntryEntity),
      moderation,
    );
  });

  afterEach(async () => {
    await ds.destroy();
  });

  async function makeEntry(status: any = 'private') {
    return labRepo.save(
      labRepo.create({
        ownerId: 'u1',
        recipeId: 'r1',
        imageUrl: 'http://img/1.png',
        result: 'success',
        moderationStatus: status,
        isPublic: status === 'public' || status === 'approved',
      }),
    ) as any;
  }

  it('submit makes an entry public and it appears on the wall', async () => {
    const entry = await makeEntry('private');
    // Simulate submit (LabService.submit) by setting public directly.
    entry.moderationStatus = 'public';
    entry.isPublic = true;
    await labRepo.save(entry);

    const wall = await moderation.wall('time');
    expect(wall.map((w) => w.id)).toContain(entry.id);
  });

  it('hide sets hidden and removes the entry from the wall', async () => {
    const entry = await makeEntry('public');
    await content.hideContent(entry.id, 'admin-1');

    const hidden = await labRepo.findOne({ where: { id: entry.id } });
    expect(hidden?.moderationStatus).toBe('hidden');
    const wall = await moderation.wall('time');
    expect(wall.map((w) => w.id)).not.toContain(entry.id);
  });

  it('delete permanently removes the lab entry', async () => {
    const entry = await makeEntry('public');
    await content.deleteContent(entry.id, 'admin-1');
    expect(await labRepo.findOne({ where: { id: entry.id } })).toBeNull();
  });

  it('hide/delete on unknown id throws NotFound', async () => {
    await expect(content.hideContent('nope', 'admin-1')).rejects.toBeDefined();
    await expect(content.deleteContent('nope', 'admin-1')).rejects.toBeDefined();
  });

  it('listShared returns entries across statuses and supports filters', async () => {
    await makeEntry('public');
    await makeEntry('hidden');
    const all = await content.listShared(undefined, undefined, 1, 20);
    expect(all.total).toBe(2);
    const onlyPublic = await content.listShared(undefined, 'public', 1, 20);
    expect(onlyPublic.total).toBe(1);
    expect(onlyPublic.items[0].moderationStatus).toBe('public');
  });

  it('listResults returns recipes (title=name) and poster jobs (imageUrl=first poster)', async () => {
    const recipeRepo = ds.getRepository(RecipeEntity);
    await recipeRepo.save(
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
        ownerId: 'u1',
      }),
    );
    const jobRepo = ds.getRepository(PosterJobEntity);
    const posterRepo = ds.getRepository(PosterEntity);
    const job = await jobRepo.save(
      jobRepo.create({
        recipeId: 'r1',
        ownerId: 'u1',
        locale: 'en',
        status: 'done',
        posters: [
          posterRepo.create({
            dimension: 'home_closeup',
            templateId: 't1',
            templateSnapshot: {} as any,
            status: 'done',
            imageUrl: 'http://p/1.png',
          }),
        ],
      }),
    );

    const all = await content.listResults(undefined, undefined, 1, 20);
    expect(all.total).toBe(2);
    const recipeItem = all.items.find((i) => i.type === 'recipe');
    const posterItem = all.items.find((i) => i.type === 'poster');
    expect(recipeItem?.title).toBe('Mojito');
    expect(recipeItem?.imageUrl).toBeNull();
    expect(posterItem?.imageUrl).toBe('http://p/1.png');
    expect(posterItem?.id).toBe(job.id);

    const postersOnly = await content.listResults(undefined, 'poster', 1, 20);
    expect(postersOnly.total).toBe(1);
    expect(postersOnly.items[0].type).toBe('poster');
  });
});
