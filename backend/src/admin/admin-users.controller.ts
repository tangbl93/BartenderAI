import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminUsersService } from './admin-users.service';
import { UserListQuery } from './dto/admin.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('operator', 'admin')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: '用户目录（匿名 deviceId 追溯，分页+搜索）' })
  list(@Query() q: UserListQuery) {
    return this.service.listUsers(q.q, q.page || 1, q.size || 20);
  }

  @Get(':id')
  @ApiOperation({ summary: '用户详情 + 活动计数' })
  detail(@Param('id') id: string) {
    return this.service.getUser(id);
  }
}
