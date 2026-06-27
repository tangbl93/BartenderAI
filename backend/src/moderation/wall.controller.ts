import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ModerationService } from './moderation.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('wall')
@Controller('wall')
export class WallController {
  constructor(private readonly service: ModerationService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '海报墙（仅展示已通过，支持排序）' })
  @ApiQuery({ name: 'sort', required: false, enum: ['hot', 'time'] })
  @ApiQuery({ name: 'page', required: false })
  wall(
    @Query('sort') sort: 'hot' | 'time' = 'time',
    @Query('page') page = '1',
  ) {
    return this.service.wall(sort === 'hot' ? 'hot' : 'time', parseInt(`${page}`, 10) || 1);
  }
}
