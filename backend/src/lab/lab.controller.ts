import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LabService } from './lab.service';
import { LabEntryDto } from './dto/lab.dto';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

@ApiTags('lab')
@ApiBearerAuth()
@Controller('lab/entries')
export class LabController {
  constructor(private readonly service: LabService) {}

  @Get()
  @ApiOperation({ summary: '我的实验室列表（时间倒序，仅本人）' })
  listMine(@CurrentUser() user: AuthUser) {
    return this.service.listMine(user.id);
  }

  @Post()
  @ApiOperation({ summary: '作品打卡' })
  create(@Body() dto: LabEntryDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '作品详情（私有仅本人）' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.findOwned(id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑作品（仅作者）' })
  update(
    @Param('id') id: string,
    @Body() dto: LabEntryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: '删除作品（仅作者）' })
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.service.remove(id, user.id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: '公开投稿至海报墙（置为待审核）' })
  submit(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.submit(id, user.id);
  }
}
