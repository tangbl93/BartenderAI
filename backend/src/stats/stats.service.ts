import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import {
  IngredientEntity,
  LabEntryEntity,
  PosterEntity,
  RecipeEntity,
  StyleTemplateEntity,
} from '../database/entities';
import { resolveLocalized } from '../common/constants';

export interface DashboardDto {
  recipeCount: number;
  posterCount: number;
  submissionCount: number;
  approvalRate: number;
  topIngredients: { name: string; count: number }[];
  topStyles: { name: string; count: number }[];
}

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(RecipeEntity)
    private readonly recipes: Repository<RecipeEntity>,
    @InjectRepository(PosterEntity)
    private readonly posters: Repository<PosterEntity>,
    @InjectRepository(LabEntryEntity)
    private readonly entries: Repository<LabEntryEntity>,
    @InjectRepository(IngredientEntity)
    private readonly ingredients: Repository<IngredientEntity>,
    @InjectRepository(StyleTemplateEntity)
    private readonly templates: Repository<StyleTemplateEntity>,
  ) {}

  async dashboard(from?: string, to?: string): Promise<DashboardDto> {
    const range = this.dateRange(from, to);
    const where = range ? { createdAt: range } : {};

    const recipes = await this.recipes.find({ where });
    const posters = await this.posters.find({ where });
    const submissions = await this.entries.find({
      where: range
        ? { createdAt: range }
        : {},
    });

    const recipeCount = recipes.filter((r) => !r.isExample).length;
    const posterCount = posters.length;
    const publicSubs = submissions.filter(
      (s) => s.moderationStatus !== 'private',
    );
    const submissionCount = publicSubs.length;
    const approved = publicSubs.filter(
      (s) => s.moderationStatus === 'approved',
    ).length;
    const reviewed = publicSubs.filter(
      (s) =>
        s.moderationStatus === 'approved' || s.moderationStatus === 'rejected',
    ).length;
    const approvalRate = reviewed > 0 ? approved / reviewed : 0;

    const topIngredients = await this.topIngredients(recipes);
    const topStyles = await this.topStyles(posters);

    return {
      recipeCount,
      posterCount,
      submissionCount,
      approvalRate: Math.round(approvalRate * 100) / 100,
      topIngredients,
      topStyles,
    };
  }

  private dateRange(from?: string, to?: string) {
    if (!from && !to) return undefined;
    const start = from ? new Date(from) : new Date(0);
    const end = to ? new Date(`${to}T23:59:59.999Z`) : new Date();
    return Between(start, end);
  }

  private async topIngredients(
    recipes: RecipeEntity[],
  ): Promise<{ name: string; count: number }[]> {
    const counts = new Map<string, number>();
    for (const r of recipes) {
      for (const id of r.ingredientIds || []) {
        counts.set(id, (counts.get(id) || 0) + 1);
      }
    }
    const ingredients = await this.ingredients.find();
    const nameById = new Map(
      ingredients.map((i) => [i.id, resolveLocalized(i.names, 'en')]),
    );
    return Array.from(counts.entries())
      .map(([id, count]) => ({ name: nameById.get(id) || id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private async topStyles(
    posters: PosterEntity[],
  ): Promise<{ name: string; count: number }[]> {
    const counts = new Map<string, number>();
    for (const p of posters) {
      const name = p.templateSnapshot?.name || p.dimension;
      counts.set(name, (counts.get(name) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}
