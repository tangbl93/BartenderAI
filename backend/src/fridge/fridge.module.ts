import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FridgeScanEntity } from '../database/entities';
import { FridgeController } from './fridge.controller';
import { FridgeService } from './fridge.service';

@Module({
  imports: [TypeOrmModule.forFeature([FridgeScanEntity])],
  controllers: [FridgeController],
  providers: [FridgeService],
  exports: [FridgeService],
})
export class FridgeModule {}
