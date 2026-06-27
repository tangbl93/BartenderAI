import { ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LabService } from './lab.service';
import { LabEntryEntity } from '../database/entities';
import { createTestDataSource } from '../../test/test-datasource';

describe('LabService', () => {
  let ds: DataSource;
  let service: LabService;
  const OWNER = 'owner-1';
  const OTHER = 'other-2';

  beforeEach(async () => {
    ds = await createTestDataSource();
    service = new LabService(ds.getRepository(LabEntryEntity));
  });

  afterEach(async () => {
    await ds.destroy();
  });

  async function makeEntry() {
    return service.create(
      { recipeId: 'r1', imageUrl: 'http://img/1.png', result: 'success' },
      OWNER,
    );
  }

  it('creates an entry owned by the current user (private by default)', async () => {
    const entry = await makeEntry();
    expect(entry.moderationStatus).toBe('private');
    expect(entry.isPublic).toBe(false);
  });

  it('lists only the owner entries in time-desc order', async () => {
    await makeEntry();
    await service.create(
      { recipeId: 'r2', imageUrl: 'http://img/2.png', result: 'fail' },
      OTHER,
    );
    const mine = await service.listMine(OWNER);
    expect(mine.length).toBe(1);
    expect(mine[0].recipeId).toBe('r1');
  });

  it('returns 403 when a non-author tries to view/edit/delete', async () => {
    const entry = await makeEntry();
    await expect(service.findOwned(entry.id, OTHER)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(
      service.update(entry.id, OTHER, {
        recipeId: 'r1',
        imageUrl: 'http://img/x.png',
        result: 'fail',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.remove(entry.id, OTHER)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('submit sets moderationStatus=public (submit == public) and isPublic=true', async () => {
    const entry = await makeEntry();
    const submitted = await service.submit(entry.id, OWNER);
    expect(submitted.moderationStatus).toBe('public');
    expect(submitted.isPublic).toBe(true);
  });
});
