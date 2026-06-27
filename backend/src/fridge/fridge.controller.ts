import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FridgeService } from './fridge.service';
import { CreateFridgeScanDto } from './dto/fridge.dto';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

@ApiTags('fridge')
@ApiBearerAuth()
@Controller('fridge/scans')
export class FridgeController {
  constructor(private readonly service: FridgeService) {}

  @Post()
  @ApiOperation({ summary: '保存当前库存（扫描/选材结果，仅本人）' })
  save(@Body() dto: CreateFridgeScanDto, @CurrentUser() user: AuthUser) {
    return this.service.save(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '最近扫描列表（时间倒序，仅本人）' })
  listRecent(@CurrentUser() user: AuthUser) {
    return this.service.listRecent(user.id);
  }

  @Get('latest')
  @ApiOperation({ summary: '最近一次保存的库存（无则返回 null）' })
  latest(@CurrentUser() user: AuthUser) {
    return this.service.latest(user.id);
  }
}
