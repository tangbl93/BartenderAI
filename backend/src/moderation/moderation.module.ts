import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  LabEntryEntity,
  ModerationRecordEntity,
} from '../database/entities';
import { ModerationService } from './moderation.service';
import { ModerationController } from './moderation.controller';
import { WallController } from './wall.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([LabEntryEntity, ModerationRecordEntity]),
  ],
  controllers: [WallController, ModerationController],
  providers: [ModerationService],
  exports: [ModerationService],
})
export class ModerationModule {}
