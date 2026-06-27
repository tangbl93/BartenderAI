import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientEntity, RecipeEntity } from '../database/entities';
import { IngredientsController } from './ingredients.controller';
import { IngredientsService } from './ingredients.service';

@Module({
  imports: [TypeOrmModule.forFeature([IngredientEntity, RecipeEntity])],
  controllers: [IngredientsController],
  providers: [IngredientsService],
  exports: [IngredientsService],
})
export class IngredientsModule {}
