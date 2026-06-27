import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabEntryEntity } from '../database/entities';
import { LabController } from './lab.controller';
import { LabService } from './lab.service';

@Module({
  imports: [TypeOrmModule.forFeature([LabEntryEntity])],
  controllers: [LabController],
  providers: [LabService],
  exports: [LabService],
})
export class LabModule {}
