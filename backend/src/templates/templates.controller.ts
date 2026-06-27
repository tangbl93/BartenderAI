import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { StyleTemplateDto } from './dto/template.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('templates')
@Controller()
export class TemplatesController {
  constructor(private readonly service: TemplatesService) {}

  @Public()
  @Get('templates')
  @ApiOperation({ summary: '前台可选风格模板（仅启用）' })
  listEnabled() {
    return this.service.listEnabled();
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('operator', 'admin')
  @Get('admin/templates')
  @ApiOperation({ summary: '管理端模板列表（含停用）' })
  listAll() {
    return this.service.listAll();
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('operator', 'admin')
  @Post('admin/templates')
  @ApiOperation({ summary: '新建风格预设' })
  create(@Body() dto: StyleTemplateDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('operator', 'admin')
  @Put('admin/templates/:id')
  @ApiOperation({ summary: '编辑模板（仅对新海报生效）' })
  update(@Param('id') id: string, @Body() dto: StyleTemplateDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('operator', 'admin')
  @Delete('admin/templates/:id')
  @HttpCode(204)
  @ApiOperation({ summary: '删除/停用模板' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.remove(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('operator', 'admin')
  @Post('admin/templates/:id/preview')
  @ApiOperation({ summary: '预览模板效果' })
  preview(@Param('id') id: string) {
    return this.service.preview(id);
  }
}
