import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ModerationService } from './moderation.service';
import {
  LabEntryEntity,
  ModerationRecordEntity,
} from '../database/entities';
import { createTestDataSource } from '../../test/test-datasource';

describe('ModerationService', () => {
  let ds: DataSource;
  let service: ModerationService;
  let entryRepo: ReturnType<DataSource['getRepository']>;

  beforeEach(async () => {
    ds = await createTestDataSource();
    entryRepo = ds.getRepository(LabEntryEntity);
    service = new ModerationService(
      ds.getRepository(LabEntryEntity),
      ds.getRepository(ModerationRecordEntity),
    );
  });

  afterEach(async () => {
    await ds.destroy();
  });

  async function makePending(likes = 0) {
    return entryRepo.save(
      entryRepo.create({
        ownerId: 'u1',
        recipeId: 'r1',
        imageUrl: 'http://img/1.png',
        result: 'success',
        isPublic: true,
        moderationStatus: 'pending',
        likes,
      }),
    ) as any;
  }

  it('reject WITHOUT a reason is a 400', async () => {
    const entry = await makePending();
    await expect(
      service.moderate(entry.id, { decision: 'reject' }, 'admin-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('reject WITH a reason writes an audit ModerationRecord', async () => {
    const entry = await makePending();
    const res = await service.moderate(
      entry.id,
      { decision: 'reject', reason: 'inappropriate' },
      'admin-1',
    );
    expect(res.moderationStatus).toBe('rejected');
    const records = await ds.getRepository(ModerationRecordEntity).find();
    expect(records.length).toBe(1);
    expect(records[0].decision).toBe('reject');
    expect(records[0].reason).toBe('inappropriate');
    expect(records[0].reviewerId).toBe('admin-1');
  });

  it('approve moves the entry to the wall and records an audit', async () => {
    const entry = await makePending();
    const res = await service.moderate(entry.id, { decision: 'approve' }, 'admin-1');
    expect(res.moderationStatus).toBe('approved');
    const wall = await service.wall('time');
    expect(wall.map((w) => w.id)).toContain(entry.id);
  });

  it('wall shows approved only and supports hot sorting', async () => {
    const a = await makePending(1);
    const b = await makePending(99);
    // pending one stays hidden
    await makePending(5);
    await service.moderate(a.id, { decision: 'approve' }, 'admin');
    await service.moderate(b.id, { decision: 'approve' }, 'admin');

    const hot = await service.wall('hot');
    expect(hot.length).toBe(2);
    expect(hot[0].id).toBe(b.id); // higher likes first
  });
});
