import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RecipesService } from './recipes.service';
import { RecipeGenerateDto } from './dto/recipe.dto';
import { Public } from '../common/decorators/public.decorator';
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
  @ApiOperation({ summary: '内置示例案例' })
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
}
