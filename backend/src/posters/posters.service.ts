import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PosterEntity,
  PosterJobEntity,
  RecipeEntity,
} from '../database/entities';
import { TemplateSnapshot } from '../database/entities/poster.entity';
import { PosterJobStatus } from '../database/entities/poster-job.entity';
import {
  IMAGE_PROVIDER,
  ImageProvider,
} from '../ai/image-provider.interface';
import { RecipesService } from '../recipes/recipes.service';
import { TemplatesService } from '../templates/templates.service';
import { OverlayService } from './overlay.service';
import { PosterJobDto, PosterJobViewDto } from './dto/poster.dto';
import { normalizeLocale } from '../common/constants';

const SIZE_BY_DIMENSION: Record<string, string> = {
  home_closeup: '1024x1024',
  bar_commercial: '1024x1536',
  steps_long: '768x1536',
  custom: '1024x1024',
};

@Injectable()
export class PostersService {
  private readonly logger = new Logger(PostersService.name);

  constructor(
    @InjectRepository(PosterJobEntity)
    private readonly jobs: Repository<PosterJobEntity>,
    @InjectRepository(PosterEntity)
    private readonly posters: Repository<PosterEntity>,
    @Inject(IMAGE_PROVIDER) private readonly imageProvider: ImageProvider,
    private readonly recipesService: RecipesService,
    private readonly templatesService: TemplatesService,
    private readonly overlay: OverlayService,
    private readonly config: ConfigService,
  ) {}

  async createJob(
    dto: PosterJobDto,
    ownerId?: string,
  ): Promise<PosterJobViewDto> {
    const recipe = await this.recipesService.getEntity(dto.recipeId);
    const locale = normalizeLocale(dto.locale || recipe.locale);

    const templates = await this.templatesService.resolveForJob(
      dto.templateIds,
    );
    if (!templates.length) {
      throw new NotFoundException('未找到可用的风格模板');
    }

    // Persist the job with a poster per template, each snapshotting the
    // template config (edits to templates later won't affect these posters).
    const job = this.jobs.create({
      recipeId: recipe.id,
      ownerId: ownerId ?? null,
      locale,
      status: 'pending',
      posters: templates.map((t) => {
        const snapshot: TemplateSnapshot = {
          id: t.id,
          name: t.name,
          dimension: t.dimension,
          prompt: t.prompt,
          layout: t.layout,
          textRenderMode: t.textRenderMode,
          version: t.version,
        };
        return this.posters.create({
          dimension: t.dimension,
          templateId: t.id,
          templateSnapshot: snapshot,
          status: 'pending',
          textSnapshot: this.overlay.buildTextSnapshot(recipe, snapshot) as any,
        });
      }),
    });
    const saved = await this.jobs.save(job);

    // Run generation (awaited so the stub pipeline is deterministic for tests;
    // a real deployment would dispatch to a queue and return immediately).
    // The i2i reference image (base64 data URL from the App) is forwarded to
    // the image provider but NEVER persisted.
    await this.runJob(saved.id, recipe, dto.referenceImage);

    return this.findJob(saved.id);
  }

  private async runJob(
    jobId: string,
    recipe: RecipeEntity,
    referenceImage?: string,
  ): Promise<void> {
    const job = await this.jobs.findOne({ where: { id: jobId } });
    if (!job) return;
    job.status = 'running';
    await this.jobs.save(job);

    await Promise.all(
      job.posters.map((poster) =>
        this.generatePoster(poster, recipe, referenceImage),
      ),
    );

    await this.recomputeJobStatus(jobId);
  }

  private async generatePoster(
    poster: PosterEntity,
    recipe: RecipeEntity,
    referenceImage?: string,
  ): Promise<void> {
    poster.status = 'running';
    poster.error = null;
    await this.posters.save(poster);

    const timeoutMs = this.config.get<number>('posterTimeoutMs') || 30000;
    const snapshot = poster.templateSnapshot;
    const size = SIZE_BY_DIMENSION[poster.dimension] || '1024x1024';

    try {
      const result = await this.withTimeout(
        this.imageProvider.generateImage({
          prompt: this.buildPrompt(snapshot, recipe),
          size,
          seed: `${poster.id}-${snapshot.version}`,
          // Forward i2i reference image to the provider when supplied. The
          // provider is responsible for the actual /images/edits call.
          referenceImage,
        }),
        timeoutMs,
      );
      // Composite backend text/watermark from the recipe snapshot.
      const text = this.overlay.buildTextSnapshot(recipe, snapshot);
      poster.imageUrl = this.overlay.composite(result.imageUrl, text);
      poster.textSnapshot = text as any;
      poster.status = 'done';
    } catch (err: any) {
      poster.status = 'failed';
      poster.error = err?.message || 'generation failed';
      this.logger.warn(`Poster ${poster.id} failed: ${poster.error}`);
    }
    await this.posters.save(poster);
  }

  private buildPrompt(snapshot: TemplateSnapshot, recipe: RecipeEntity): string {
    const ingredients = (recipe.items || []).map((i) => i.name).join(', ');
    return [
      snapshot.prompt,
      `Cocktail: ${recipe.name}.`,
      `Key ingredients: ${ingredients}.`,
      `Tagline: ${recipe.tagline}.`,
    ].join(' ');
  }

  private withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`timeout after ${ms}ms`)),
        ms,
      );
      p.then(
        (v) => {
          clearTimeout(timer);
          resolve(v);
        },
        (e) => {
          clearTimeout(timer);
          reject(e);
        },
      );
    });
  }

  private async recomputeJobStatus(jobId: string): Promise<PosterJobStatus> {
    const job = await this.jobs.findOne({ where: { id: jobId } });
    if (!job) return 'failed';
    const statuses = job.posters.map((p) => p.status);
    const done = statuses.filter((s) => s === 'done').length;
    const failed = statuses.filter((s) => s === 'failed').length;
    const total = statuses.length;

    let status: PosterJobStatus;
    if (done === total) {
      status = 'done';
    } else if (failed === total) {
      status = 'failed';
    } else if (done > 0 && done + failed === total) {
      // Some succeeded, some failed → partial success.
      status = 'partial';
    } else {
      status = 'running';
    }
    job.status = status;
    await this.jobs.save(job);
    return status;
  }

  async findJob(id: string): Promise<PosterJobViewDto> {
    const job = await this.jobs.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException('海报任务不存在');
    }
    return this.toJobView(job);
  }

  /** Retry a single failed poster. */
  async retryPoster(posterId: string): Promise<PosterJobViewDto> {
    const poster = await this.posters.findOne({ where: { id: posterId } });
    if (!poster) {
      throw new NotFoundException('海报不存在');
    }
    const job = await this.jobs.findOne({ where: { id: poster.jobId } });
    if (!job) {
      throw new NotFoundException('海报任务不存在');
    }
    const recipe = await this.recipesService.getEntity(job.recipeId);
    await this.generatePoster(poster, recipe);
    await this.recomputeJobStatus(job.id);
    return this.findJob(job.id);
  }

  private toJobView(job: PosterJobEntity): PosterJobViewDto {
    return {
      id: job.id,
      recipeId: job.recipeId,
      status: job.status,
      posters: (job.posters || [])
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((p) => ({
          id: p.id,
          dimension: p.dimension,
          templateId: p.templateId,
          status: p.status,
          imageUrl: p.imageUrl,
          textSnapshot: p.textSnapshot,
        })),
    };
  }
}
