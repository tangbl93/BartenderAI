import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RecipesService } from './recipes.service';
import { RecipeGenerateDto } from './dto/recipe.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly service: RecipesService) {}

  @ApiBearerAuth()
  @Post('generate')
  @HttpCode(200)
  @ApiOperation({ summary: '盲盒配方生成（仅用所选材料）' })
  generate(@Body() dto: RecipeGenerateDto, @CurrentUser() user: AuthUser) {
    return this.service.generate(dto, user?.id);
  }

  @Public()
  @Get('examples')
  @ApiOperation({ summary: '内置示例案例（精选调酒推荐）' })
  @ApiQuery({ name: 'locale', required: false })
  examples(@Query('locale') locale = 'en') {
    return this.service.examples(locale);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取配方' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('operator', 'admin')
  @Delete('admin/:id')
  @HttpCode(204)
  @ApiOperation({ summary: '删除示例配方（移出精选推荐）' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.remove(id);
  }
}
