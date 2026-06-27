import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  LabEntryEntity,
  PosterJobEntity,
  RecipeEntity,
  UserEntity,
} from '../database/entities';
import { ModerationModule } from '../moderation/moderation.module';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminContentController } from './admin-content.controller';
import { AdminContentService } from './admin-content.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      LabEntryEntity,
      RecipeEntity,
      PosterJobEntity,
    ]),
    ModerationModule,
  ],
  controllers: [AdminUsersController, AdminContentController],
  providers: [AdminUsersService, AdminContentService],
})
export class AdminModule {}
