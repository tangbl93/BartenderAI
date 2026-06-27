import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('stats')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('operator', 'admin')
@Controller('admin/stats')
export class StatsController {
  constructor(private readonly service: StatsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: '大数据监控看板' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  dashboard(@Query('from') from?: string, @Query('to') to?: string) {
    return this.service.dashboard(from, to);
  }
}
