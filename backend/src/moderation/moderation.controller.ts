import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ModerationService } from './moderation.service';
import { ModerationDto } from './dto/moderation.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

@ApiTags('wall')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('operator', 'admin')
@Controller('admin/moderation')
export class ModerationController {
  constructor(private readonly service: ModerationService) {}

  @Get('queue')
  @ApiOperation({ summary: '待审核队列' })
  queue() {
    return this.service.queue();
  }

  @Post(':id')
  @ApiOperation({ summary: '审核（通过/拒绝，拒绝须填理由）' })
  moderate(
    @Param('id') id: string,
    @Body() dto: ModerationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.moderate(id, dto, user.id);
  }
}
