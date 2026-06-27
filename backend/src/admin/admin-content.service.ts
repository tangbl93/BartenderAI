import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LabEntryEntity,
  PosterJobEntity,
  RecipeEntity,
} from '../database/entities';
import { ModerationService } from '../moderation/moderation.service';
import { ResultItemDto, ResultsPageDto } from './dto/admin.dto';

@Injectable()
export class AdminContentService {
  private readonly logger = new Logger(AdminContentService.name);

  constructor(
    @InjectRepository(RecipeEntity)
    private readonly recipes: Repository<RecipeEntity>,
    @InjectRepository(PosterJobEntity)
    private readonly jobs: Repository<PosterJobEntity>,
    @InjectRepository(LabEntryEntity)
    private readonly lab: Repository<LabEntryEntity>,
    private readonly moderation: ModerationService,
  ) {}

  /** Shared content (lab entries, all statuses). Delegates to ModerationService. */
  async listShared(
    userId?: string,
    status?: string,
    page = 1,
    size = 20,
  ) {
    return this.moderation.listShared(userId, status, page, size);
  }

  /**
   * User-generated results: recipes + poster jobs merged into a gallery.
   * Poster items use the first poster image; recipe items use the recipe name.
   */
  async listResults(
    userId?: string,
    type?: 'recipe' | 'poster',
    page = 1,
    size = 24,
  ): Promise<ResultsPageDto> {
    const take = Math.min(Math.max(size, 1), 100);
    const skip = Math.max(0, (page - 1) * take);

    const wantRecipes = !type || type === 'recipe';
    const wantPosters = !type || type === 'poster';

    // For a correct merged total we count each side in the DB, then fetch a
    // window big enough to merge+slice deterministically by createdAt DESC.
    const [recipeRows, recipeTotal, jobRows, jobTotal] = await Promise.all([
      wantRecipes ? this.fetchRecipes(userId) : Promise.resolve([]),
      wantRecipes ? this.countRecipes(userId) : Promise.resolve(0),
      wantPosters ? this.fetchJobs(userId) : Promise.resolve([]),
      wantPosters ? this.countJobs(userId) : Promise.resolve(0),
    ]);

    const recipeItems: ResultItemDto[] = recipeRows.map((r) => ({
      type: 'recipe' as const,
      id: r.id,
      ownerId: r.ownerId,
      createdAt: r.createdAt.toISOString(),
      title: r.name,
      imageUrl: null,
    }));
    const jobItems: ResultItemDto[] = await Promise.all(
      jobRows.map(async (j) => {
        const firstPoster = (j.posters || [])
          .slice()
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
          .find((p) => p.imageUrl);
        return {
          type: 'poster' as const,
          id: j.id,
          ownerId: j.ownerId,
          createdAt: j.createdAt.toISOString(),
          title: j.locale,
          imageUrl: firstPoster?.imageUrl ?? null,
        };
      }),
    );

    const merged = [...recipeItems, ...jobItems]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(skip, skip + take);

    return { items: merged, total: recipeTotal + jobTotal, page, size: take };
  }

  private recipeQb(userId: string | undefined) {
    const qb = this.recipes.createQueryBuilder('r');
    if (userId) qb.andWhere('r.ownerId = :userId', { userId });
    return qb;
  }

  private jobQb(userId: string | undefined) {
    const qb = this.jobs
      .createQueryBuilder('j')
      .leftJoinAndSelect('j.posters', 'p');
    if (userId) qb.andWhere('j.ownerId = :userId', { userId });
    return qb;
  }

  private fetchRecipes(userId: string | undefined) {
    return this.recipeQb(userId).orderBy('r.createdAt', 'DESC').getMany();
  }

  private countRecipes(userId: string | undefined) {
    return this.recipeQb(userId).getCount();
  }

  private fetchJobs(userId: string | undefined) {
    return this.jobQb(userId).orderBy('j.createdAt', 'DESC').getMany();
  }

  private countJobs(userId: string | undefined) {
    return this.jobQb(userId).getCount();
  }

  /** Hide a violation. Tries lab entry first; poster jobs have no hidden flag
   *  so we just log (gallery hide is out of scope for the lab-only model). */
  async hideContent(id: string, operatorId: string): Promise<{ id: string; hidden: boolean }> {
    const lab = await this.lab.findOne({ where: { id } });
    if (lab) {
      await this.moderation.hideEntry(id);
      this.audit('hide', id, operatorId);
      return { id, hidden: true };
    }
    // Poster job: no hidden state — treat as a no-op hide (still logged).
    const job = await this.jobs.findOne({ where: { id } });
    if (job) {
      this.audit('hide', id, operatorId);
      return { id, hidden: false };
    }
    throw new NotFoundException('内容不存在');
  }

  /** Delete a violation (lab entry or poster job). */
  async deleteContent(id: string, operatorId: string): Promise<{ id: string; deleted: boolean }> {
    const lab = await this.lab.findOne({ where: { id } });
    if (lab) {
      await this.moderation.deleteEntry(id);
      this.audit('delete', id, operatorId);
      return { id, deleted: true };
    }
    const job = await this.jobs.findOne({ where: { id } });
    if (job) {
      await this.jobs.remove(job); // cascades to posters
      this.audit('delete', id, operatorId);
      return { id, deleted: true };
    }
    const recipe = await this.recipes.findOne({ where: { id } });
    if (recipe) {
      await this.recipes.remove(recipe);
      this.audit('delete', id, operatorId);
      return { id, deleted: true };
    }
    throw new NotFoundException('内容不存在');
  }

  private audit(action: string, id: string, operatorId: string) {
    // Structured single-line audit log.
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        event: 'admin.content.action',
        action,
        id,
        operatorId,
        at: new Date().toISOString(),
      }),
    );
  }
}
