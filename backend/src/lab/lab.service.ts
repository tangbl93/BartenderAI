import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabEntryEntity } from '../database/entities';
import { LabEntryDto, LabEntryViewDto } from './dto/lab.dto';

@Injectable()
export class LabService {
  constructor(
    @InjectRepository(LabEntryEntity)
    private readonly entries: Repository<LabEntryEntity>,
  ) {}

  async create(dto: LabEntryDto, ownerId: string): Promise<LabEntryViewDto> {
    // Required fields enforced by DTO + explicit guard for clarity (400).
    if (!dto.recipeId || !dto.imageUrl || !dto.result) {
      throw new BadRequestException('缺少必填字段（recipeId/imageUrl/result）');
    }
    const entity = await this.entries.save(
      this.entries.create({
        ownerId,
        recipeId: dto.recipeId,
        imageUrl: dto.imageUrl,
        result: dto.result,
        note: dto.note ?? null,
        isPublic: false,
        moderationStatus: 'private',
      }),
    );
    return this.toView(entity);
  }

  async listMine(ownerId: string): Promise<LabEntryViewDto[]> {
    const rows = await this.entries.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
    return rows.map((r) => this.toView(r));
  }

  async findOwned(id: string, ownerId: string): Promise<LabEntryViewDto> {
    const entity = await this.requireOwned(id, ownerId);
    return this.toView(entity);
  }

  async update(
    id: string,
    ownerId: string,
    dto: LabEntryDto,
  ): Promise<LabEntryViewDto> {
    const entity = await this.requireOwned(id, ownerId);
    entity.recipeId = dto.recipeId;
    entity.imageUrl = dto.imageUrl;
    entity.result = dto.result;
    entity.note = dto.note ?? null;
    await this.entries.save(entity);
    return this.toView(entity);
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const entity = await this.requireOwned(id, ownerId);
    await this.entries.remove(entity);
  }

  /** Submit to the wall → moderationStatus=public, isPublic=true. */
  async submit(id: string, ownerId: string): Promise<LabEntryViewDto> {
    const entity = await this.requireOwned(id, ownerId);
    entity.isPublic = true;
    entity.moderationStatus = 'public';
    await this.entries.save(entity);
    return this.toView(entity);
  }

  private async requireOwned(
    id: string,
    ownerId: string,
  ): Promise<LabEntryEntity> {
    const entity = await this.entries.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException('作品不存在');
    }
    if (entity.ownerId !== ownerId) {
      throw new ForbiddenException('无权限');
    }
    return entity;
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
