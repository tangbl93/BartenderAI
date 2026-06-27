import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminContentService } from './admin-content.service';
import { ResultsQuery, SharedContentQuery } from './dto/admin.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('operator', 'admin')
@Controller('admin/content')
export class AdminContentController {
  constructor(private readonly service: AdminContentService) {}

  @Get('shared')
  @ApiOperation({ summary: '全量用户分享内容（全状态，可按用户/状态筛选）' })
  shared(@Query() q: SharedContentQuery) {
    return this.service.listShared(
      q.userId,
      q.status,
      q.page || 1,
      q.size || 20,
    );
  }

  @Get('results')
  @ApiOperation({ summary: '用户生成结果（recipes + poster jobs，海报画廊为主）' })
  results(@Query() q: ResultsQuery) {
    return this.service.listResults(
      q.userId,
      q.type,
      q.page || 1,
      q.size || 24,
    );
  }

  @Post(':id/hide')
  @ApiOperation({ summary: '屏蔽违规内容（二次确认；记录日志）' })
  hide(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.hideContent(id, user.id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: '删除违规内容（二次确认；记录日志）' })
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.service.deleteContent(id, user.id);
  }
}
