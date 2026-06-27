import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { StyleTemplateDto, StyleTemplateViewDto } from './dto/template.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

/** Images only, <=5MB. */
const IMAGE_MIME = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_REF_BYTES = 5 * 1024 * 1024;

@ApiTags('templates')
@Controller()
export class TemplatesController {
  constructor(private readonly service: TemplatesService) {}

  @Public()
  @Get('templates')
  @ApiOperation({ summary: '前台可选风格模板（仅启用），App 据响应头 X-Templates-Version 判断是否需重新拉取' })
  @ApiHeader({ name: 'X-Templates-Version', description: '启用模板集版本号（max version）' })
  @ApiOkResponse({ type: [StyleTemplateViewDto] })
  async listEnabled(@Res({ passthrough: true }) res: any): Promise<StyleTemplateViewDto[]> {
    const [items, version] = await Promise.all([
      this.service.listEnabled(),
      this.service.feedVersion(),
    ]);
    res.set('X-Templates-Version', String(version));
    return items;
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

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('operator', 'admin')
  @Post('admin/templates/:id/reference-image')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_REF_BYTES } }))
  @ApiOperation({ summary: '上传/替换模板参考图（i2i 使用案例），存对象存储' })
  uploadReferenceImage(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ): Promise<{ referenceImageUrl: string }> {
    if (!file) {
      throw new BadRequestException('缺少文件（multipart field "file"）');
    }
    if (!IMAGE_MIME.includes(file.mimetype)) {
      throw new BadRequestException(
        `仅支持图片类型：${IMAGE_MIME.join(', ')}`,
      );
    }
    return this.service.setReferenceImage(id, {
      filename: file.originalname,
      data: file.buffer,
      mimetype: file.mimetype,
    });
  }
}
