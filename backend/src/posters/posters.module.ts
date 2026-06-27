import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PosterEntity,
  PosterJobEntity,
  RecipeEntity,
} from '../database/entities';
import { PostersController } from './posters.controller';
import { PostersService } from './posters.service';
import { OverlayService } from './overlay.service';
import { RecipesModule } from '../recipes/recipes.module';
import { TemplatesModule } from '../templates/templates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PosterJobEntity, PosterEntity, RecipeEntity]),
    RecipesModule,
    TemplatesModule,
  ],
  controllers: [PostersController],
  providers: [PostersService, OverlayService],
  exports: [PostersService],
})
export class PostersModule {}
