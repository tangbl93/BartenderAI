import { BadRequestException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FridgeService } from './fridge.service';
import { FridgeScanEntity } from '../database/entities';
import { createTestDataSource } from '../../test/test-datasource';

describe('FridgeService', () => {
  let ds: DataSource;
  let repo: Repository<FridgeScanEntity>;
  let service: FridgeService;
  const OWNER = 'owner-1';
  const OTHER = 'other-2';

  beforeEach(async () => {
    ds = await createTestDataSource();
    repo = ds.getRepository(FridgeScanEntity);
    service = new FridgeService(repo);
  });

  afterEach(async () => {
    await ds.destroy();
  });

  /**
   * Save via the service, then stamp a distinct createdAt so DESC ordering is
   * deterministic in tests (CreateDateColumn ties on rapid same-tick inserts;
   * real saves are seconds apart).
   */
  async function saveAt(
    ids: string[],
    summary: string,
    owner: string,
    epochMs: number,
  ): Promise<void> {
    const view = await service.save({ ingredientIds: ids, summary }, owner);
    await repo.update(view.id, { createdAt: new Date(epochMs) });
  }

  it('saves a scan owned by the user with the provided summary', async () => {
    const view = await service.save(
      { ingredientIds: ['gin', 'lime'], summary: 'Gin, Lime' },
      OWNER,
    );
    expect(view.id).toBeTruthy();
    expect(view.ingredientIds).toEqual(['gin', 'lime']);
    expect(view.summary).toBe('Gin, Lime');
  });

  it('falls back to joining ids when no summary is provided', async () => {
    const view = await service.save({ ingredientIds: ['gin', 'tonic'] }, OWNER);
    expect(view.summary).toBe('gin, tonic');
  });

  it('rejects an empty ingredient list', async () => {
    await expect(
      service.save({ ingredientIds: [] }, OWNER),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lists only the owner scans, newest first', async () => {
    await saveAt(['a'], 'first', OWNER, 1_000);
    await saveAt(['b'], 'second', OWNER, 2_000);
    await saveAt(['x'], 'theirs', OTHER, 3_000);
    const recent = await service.listRecent(OWNER);
    expect(recent.length).toBe(2);
    expect(recent[0].summary).toBe('second');
    expect(recent[1].summary).toBe('first');
  });

  it('caps recent scans at RECENT_LIMIT', async () => {
    for (let i = 0; i < FridgeService.RECENT_LIMIT + 5; i++) {
      await saveAt([`i${i}`], `s${i}`, OWNER, 1_000 + i);
    }
    const recent = await service.listRecent(OWNER);
    expect(recent.length).toBe(FridgeService.RECENT_LIMIT);
  });

  it('latest returns the most recent scan, or null when none', async () => {
    expect(await service.latest(OWNER)).toBeNull();
    await saveAt(['a'], 'first', OWNER, 1_000);
    await saveAt(['b'], 'second', OWNER, 2_000);
    const latest = await service.latest(OWNER);
    expect(latest?.summary).toBe('second');
  });
});
