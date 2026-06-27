import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LabEntryEntity,
  ModerationRecordEntity,
} from '../database/entities';
import { LabEntryViewDto } from '../lab/dto/lab.dto';
import { ModerationDto } from './dto/moderation.dto';

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(LabEntryEntity)
    private readonly entries: Repository<LabEntryEntity>,
    @InjectRepository(ModerationRecordEntity)
    private readonly records: Repository<ModerationRecordEntity>,
  ) {}

  /**
   * Public wall: entries that are shared (public) AND not hidden. Sort by hot
   * (likes) or time (newest). Approved entries are still shown for back-compat
   * with entries moderated before the public/hidden simplification.
   */
  async wall(sort: 'hot' | 'time' = 'time', page = 1): Promise<LabEntryViewDto[]> {
    const take = 20;
    const skip = Math.max(0, (page - 1) * take);
    const order: any =
      sort === 'hot'
        ? { likes: 'DESC', createdAt: 'DESC' }
        : { createdAt: 'DESC' };
    const rows = await this.entries.find({
      where: [
        { moderationStatus: 'public', isPublic: true },
        { moderationStatus: 'approved', isPublic: true },
      ],
      order,
      take,
      skip,
    });
    return rows
      .filter((r) => r.moderationStatus !== 'hidden')
      .map((r) => this.toView(r));
  }

  /** Set a lab entry to hidden (violation hide). Used by admin content. */
  async hideEntry(id: string): Promise<void> {
    const entry = await this.entries.findOne({ where: { id } });
    if (!entry) {
      throw new NotFoundException('作品不存在');
    }
    entry.moderationStatus = 'hidden';
    entry.isPublic = false;
    await this.entries.save(entry);
  }

  /** Permanently delete a lab entry (violation). */
  async deleteEntry(id: string): Promise<void> {
    const entry = await this.entries.findOne({ where: { id } });
    if (!entry) {
      throw new NotFoundException('作品不存在');
    }
    await this.entries.remove(entry);
  }

  /** List shared content (all statuses), optionally filtered by user/status. */
  async listShared(
    userId?: string,
    status?: string,
    page = 1,
    size = 20,
  ): Promise<{ items: LabEntryViewDto[]; total: number; page: number; size: number }> {
    const take = Math.min(Math.max(size, 1), 100);
    const skip = Math.max(0, (page - 1) * take);
    const qb = this.entries
      .createQueryBuilder('e')
      .orderBy('e.createdAt', 'DESC')
      .skip(skip)
      .take(take);
    if (userId) qb.andWhere('e.ownerId = :userId', { userId });
    if (status) qb.andWhere('e.moderationStatus = :status', { status });
    const [rows, total] = await qb.getManyAndCount();
    return {
      items: rows.map((r) => this.toView(r)),
      total,
      page,
      size: take,
    };
  }

  async queue(): Promise<LabEntryViewDto[]> {
    const rows = await this.entries.find({
      where: { moderationStatus: 'pending' },
      order: { createdAt: 'ASC' },
    });
    return rows.map((r) => this.toView(r));
  }

  async moderate(
    id: string,
    dto: ModerationDto,
    reviewerId: string,
  ): Promise<LabEntryViewDto> {
    if (dto.decision === 'reject' && !dto.reason?.trim()) {
      throw new BadRequestException('拒绝须填写理由');
    }
    const entry = await this.entries.findOne({ where: { id } });
    if (!entry) {
      throw new NotFoundException('作品不存在');
    }

    entry.moderationStatus = dto.decision === 'approve' ? 'approved' : 'rejected';
    if (dto.decision === 'reject') {
      entry.isPublic = false;
    }
    await this.entries.save(entry);

    // Audit record: reviewer, time, result, reason.
    await this.records.save(
      this.records.create({
        targetId: id,
        reviewerId,
        decision: dto.decision,
        reason: dto.reason ?? null,
      }),
    );

    return this.toView(entry);
  }

  private toView(e: LabEntryEntity): LabEntryViewDto {
    return {
      id: e.id,
      recipeId: e.recipeId,
      imageUrl: e.imageUrl,
      result: e.result,
      note: e.note,
      isPublic: e.isPublic,
      moderationStatus: e.moderationStatus,
      createdAt: e.createdAt.toISOString(),
    };
  }
}
