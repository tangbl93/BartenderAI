import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FridgeScanEntity } from '../database/entities';
import { CreateFridgeScanDto, FridgeScanViewDto } from './dto/fridge.dto';

@Injectable()
export class FridgeService {
  /** Max records returned by the "recent scans" list. */
  static readonly RECENT_LIMIT = 10;

  constructor(
    @InjectRepository(FridgeScanEntity)
    private readonly scans: Repository<FridgeScanEntity>,
  ) {}

  /** Save the current inventory as a scan record owned by the user. */
  async save(
    dto: CreateFridgeScanDto,
    ownerId: string,
  ): Promise<FridgeScanViewDto> {
    const ids = dto.ingredientIds ?? [];
    if (ids.length === 0) {
      throw new BadRequestException('缺少材料（ingredientIds 不能为空）');
    }
    const entity = await this.scans.save(
      this.scans.create({
        ownerId,
        ingredientIds: ids,
        summary: dto.summary?.trim() || ids.join(', '),
        imageUrl: dto.imageUrl ?? null,
      }),
    );
    return this.toView(entity);
  }

  /** Recent scans for the user, newest first, capped at RECENT_LIMIT. */
  async listRecent(ownerId: string): Promise<FridgeScanViewDto[]> {
    const rows = await this.scans.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
      take: FridgeService.RECENT_LIMIT,
    });
    return rows.map((r) => this.toView(r));
  }

  /** The most recently saved inventory, or null when the user has none. */
  async latest(ownerId: string): Promise<FridgeScanViewDto | null> {
    const row = await this.scans.findOne({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
    return row ? this.toView(row) : null;
  }

  private toView(e: FridgeScanEntity): FridgeScanViewDto {
    return {
      id: e.id,
      ingredientIds: e.ingredientIds,
      summary: e.summary,
      imageUrl: e.imageUrl,
      createdAt: e.createdAt.toISOString(),
    };
  }
}
