import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IngredientsService } from './ingredients.service';
import { IngredientDto, PublicIngredientDto } from './dto/ingredient.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

@ApiTags('ingredients')
@Controller()
export class IngredientsController {
  constructor(private readonly service: IngredientsService) {}

  @Public()
  @Get('ingredients')
  @ApiOperation({ summary: '前台"冰箱"材料（仅启用，按语言返回名称）' })
  @ApiQuery({ name: 'locale', required: false })
  @ApiQuery({ name: 'category', required: false })
  listPublic(
    @Query('locale') locale = 'en',
    @Query('category') category?: string,
  ) {
    return this.service.listPublic(locale, category);
  }

  @ApiBearerAuth()
  @Post('ingredients')
  @ApiOperation({
    summary: '用户新增材料（即时生效、直接公开，配图后台生成）',
  })
  createPublic(
    @Body() dto: PublicIngredientDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.createPublic(dto, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('operator', 'admin')
  @Get('admin/ingredients')
  @ApiOperation({ summary: '管理端材料列表（含停用）' })
  @ApiQuery({ name: 'locale', required: false })
  listAll(@Query('locale') locale = 'en') {
    return this.service.listAll(locale);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('operator', 'admin')
  @Post('admin/ingredients')
  @ApiOperation({ summary: '新增材料' })
  create(@Body() dto: IngredientDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('operator', 'admin')
  @Put('admin/ingredients/:id')
  @ApiOperation({ summary: '编辑材料' })
  update(@Param('id') id: string, @Body() dto: IngredientDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('operator', 'admin')
  @Delete('admin/ingredients/:id')
  @HttpCode(204)
  @ApiOperation({ summary: '删除/停用材料（被引用时停用替代硬删）' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.remove(id);
  }
}
