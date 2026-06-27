import { DataSource } from 'typeorm';
import { AdminUsersService } from './admin-users.service';
import {
  LabEntryEntity,
  PosterJobEntity,
  RecipeEntity,
  UserEntity,
} from '../database/entities';
import { createTestDataSource } from '../../test/test-datasource';

describe('AdminUsersService', () => {
  let ds: DataSource;
  let service: AdminUsersService;
  let userRepo: ReturnType<DataSource['getRepository']>;

  beforeEach(async () => {
    ds = await createTestDataSource();
    userRepo = ds.getRepository(UserEntity);
    service = new AdminUsersService(
      ds.getRepository(UserEntity),
      ds.getRepository(LabEntryEntity),
      ds.getRepository(RecipeEntity),
      ds.getRepository(PosterJobEntity),
    );
  });

  afterEach(async () => {
    await ds.destroy();
  });

  async function makeUser(opts: Partial<UserEntity> = {}) {
    return userRepo.save(userRepo.create(opts)) as Promise<UserEntity>;
  }

  it('paginates users newest-first and returns total/page/size', async () => {
    await makeUser({ account: 'a@x', role: 'user', passwordHash: 'x' });
    await makeUser({ account: 'b@x', role: 'user', passwordHash: 'x' });
    const page = await service.listUsers(undefined, 1, 10);
    expect(page.items.length).toBe(2);
    expect(page.total).toBe(2);
    expect(page.page).toBe(1);
    expect(page.size).toBe(10);
  });

  it('searches by deviceId fragment', async () => {
    await makeUser({
      account: 'device:abc123def',
      role: 'user',
      passwordHash: 'x',
      deviceId: 'abc123def',
      isDevice: true,
    });
    await makeUser({ account: 'other', role: 'user', passwordHash: 'x' });
    const res = await service.listUsers('abc123', 1, 10);
    expect(res.items.length).toBe(1);
    expect(res.items[0].deviceId).toBe('abc123def');
    expect(res.items[0].isDevice).toBe(true);
  });

  it('searches by account fragment', async () => {
    await makeUser({ account: 'alice@x', role: 'user', passwordHash: 'x' });
    await makeUser({ account: 'bob@x', role: 'user', passwordHash: 'x' });
    const res = await service.listUsers('alice', 1, 10);
    expect(res.items.length).toBe(1);
    expect(res.items[0].account).toBe('alice@x');
  });

  it('getUser returns counts of lab entries / recipes / posters', async () => {
    const u = await makeUser({ account: 'c@x', role: 'user', passwordHash: 'x' });
    const lab = ds.getRepository(LabEntryEntity);
    await lab.save(
      lab.create({
        ownerId: u.id,
        recipeId: 'r1',
        imageUrl: 'i',
        result: 'success',
      }),
    );
    await lab.save(
      lab.create({
        ownerId: u.id,
        recipeId: 'r2',
        imageUrl: 'i',
        result: 'success',
      }),
    );
    const recipeRepo = ds.getRepository(RecipeEntity);
    await recipeRepo.save(
      recipeRepo.create({
        name: 'R',
        tagline: 't',
        locale: 'en',
        items: [],
        steps: [],
        toolSubstitutions: [],
        alcoholRange: '0%',
        safetyNotes: [],
        ingredientIds: [],
        ownerId: u.id,
      }),
    );
    const detail = await service.getUser(u.id);
    expect(detail.counts.labEntries).toBe(2);
    expect(detail.counts.recipes).toBe(1);
    expect(detail.counts.posters).toBe(0);
    expect(detail.user.id).toBe(u.id);
  });

  it('getUser throws NotFound for unknown id', async () => {
    await expect(service.getUser('nope')).rejects.toBeDefined();
  });
});
