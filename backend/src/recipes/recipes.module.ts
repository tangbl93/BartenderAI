import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientEntity, RecipeEntity } from '../database/entities';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';

@Module({
  imports: [TypeOrmModule.forFeature([RecipeEntity, IngredientEntity])],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}
