import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  LayoutConfig,
  StyleTemplateEntity,
  TextRenderMode,
} from '../database/entities/style-template.entity';
import { StyleTemplateDto, StyleTemplateViewDto } from './dto/template.dto';
import {
  IMAGE_PROVIDER,
  ImageProvider,
} from '../ai/image-provider.interface';
import {
  STORAGE_SERVICE,
  StorageService,
} from '../storage/storage.interface';

const DEFAULT_LAYOUT: LayoutConfig = {
  textAlign: 'center',
  watermarkPosition: 'bottom-right',
};

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(StyleTemplateEntity)
    private readonly templates: Repository<StyleTemplateEntity>,
    @Inject(IMAGE_PROVIDER) private readonly imageProvider: ImageProvider,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  async listEnabled(): Promise<StyleTemplateViewDto[]> {
    const rows = await this.templates.find({
      where: { enabled: true },
      order: { createdAt: 'ASC' },
    });
    return rows.map((r) => this.toView(r));
  }

  async listAll(): Promise<StyleTemplateViewDto[]> {
    const rows = await this.templates.find({ order: { createdAt: 'ASC' } });
    return rows.map((r) => this.toView(r));
  }

  async create(dto: StyleTemplateDto): Promise<StyleTemplateViewDto> {
    const entity = await this.templates.save(
      this.templates.create({
        name: dto.name,
        dimension: dto.dimension,
        prompt: dto.prompt,
        layout: { ...DEFAULT_LAYOUT, ...(dto.layout || {}) },
        textRenderMode: (dto.textRenderMode || 'backend') as TextRenderMode,
        enabled: dto.enabled ?? true,
        version: 1,
      }),
    );
    return this.toView(entity);
  }

  /**
   * Edits bump the version. Because posters snapshot the template at job time,
   * edits only affect NEW posters — historical posters keep their snapshot.
   */
  async update(
    id: string,
    dto: StyleTemplateDto,
  ): Promise<StyleTemplateViewDto> {
    const entity = await this.templates.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException('模板不存在');
    }
    entity.name = dto.name;
    entity.dimension = dto.dimension;
    entity.prompt = dto.prompt;
    entity.layout = { ...DEFAULT_LAYOUT, ...entity.layout, ...(dto.layout || {}) };
    if (dto.textRenderMode) {
      entity.textRenderMode = dto.textRenderMode as TextRenderMode;
    }
    if (dto.enabled !== undefined) {
      entity.enabled = dto.enabled;
    }
    entity.version += 1;
    await this.templates.save(entity);
    return this.toView(entity);
  }

  /** Soft-disable to keep historical poster references valid. */
  async remove(id: string): Promise<void> {
    const entity = await this.templates.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException('模板不存在');
    }
    entity.enabled = false;
    await this.templates.save(entity);
  }

  async preview(id: string): Promise<{ previewUrl: string }> {
    const entity = await this.templates.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException('模板不存在');
    }
    const { imageUrl } = await this.imageProvider.generateImage({
      prompt: `[PREVIEW] ${entity.prompt}`,
      seed: `preview-${entity.id}-v${entity.version}`,
    });
    return { previewUrl: imageUrl };
  }

  /** Resolve default templates (the 3 default dimensions) when none supplied. */
  async resolveForJob(
    templateIds?: string[],
  ): Promise<StyleTemplateEntity[]> {
    if (templateIds && templateIds.length) {
      const rows = await this.templates.find({
        where: { id: In(templateIds), enabled: true },
      });
      if (rows.length) {
        return rows;
      }
    }
    // Default: all enabled templates whose dimension is one of the 3 defaults.
    const defaults = await this.templates.find({
      where: [
        { enabled: true, dimension: 'home_closeup' },
        { enabled: true, dimension: 'bar_commercial' },
        { enabled: true, dimension: 'steps_long' },
      ],
      order: { createdAt: 'ASC' },
    });
    return defaults;
  }

  async getEntity(id: string): Promise<StyleTemplateEntity> {
    const entity = await this.templates.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException('模板不存在');
    }
    return entity;
  }

  /** Feed version: max(version) of enabled templates (0 if none). */
  async feedVersion(): Promise<number> {
    const row = (await this.templates
      .createQueryBuilder('t')
      .select('MAX(t.version)', 'v')
      .where('t.enabled = :enabled', { enabled: true })
      .getRawOne()) as { v: number | null } | undefined;
    return row?.v ? Number(row.v) : 0;
  }

  /** Upload/replace a template's i2i reference image via object storage. */
  async setReferenceImage(
    id: string,
    file: { filename: string; data: Buffer; mimetype: string },
  ): Promise<{ referenceImageUrl: string }> {
    const entity = await this.getEntity(id);
    const { url } = await this.storage.upload({
      filename: file.filename,
      data: file.data,
      mimetype: file.mimetype,
    });
    entity.referenceImageUrl = url;
    await this.templates.save(entity);
    return { referenceImageUrl: url };
  }

  private toView(e: StyleTemplateEntity): StyleTemplateViewDto {
    return {
      id: e.id,
      name: e.name,
      dimension: e.dimension,
      prompt: e.prompt,
      layout: e.layout,
      textRenderMode: e.textRenderMode,
      enabled: e.enabled,
      version: e.version,
      referenceImageUrl: e.referenceImageUrl,
    };
  }
}
