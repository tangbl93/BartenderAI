import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  IngredientEntity,
  LabEntryEntity,
  PosterEntity,
  RecipeEntity,
  StyleTemplateEntity,
} from '../database/entities';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecipeEntity,
      PosterEntity,
      LabEntryEntity,
      IngredientEntity,
      StyleTemplateEntity,
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
