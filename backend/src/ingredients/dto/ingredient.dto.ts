import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  IngredientCategory,
  INGREDIENT_CATEGORIES,
} from '../../common/constants';

export class IngredientDto {
  @ApiProperty({ enum: INGREDIENT_CATEGORIES })
  @IsIn(INGREDIENT_CATEGORIES as unknown as string[], {
    message: '分类非法',
  })
  category: IngredientCategory;

  @ApiProperty({
    description: '多语言名称 { en, zh-CN, zh-TW, ja, ko }',
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  @IsObject()
  names: Record<string, string>;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class IngredientViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: INGREDIENT_CATEGORIES })
  category: IngredientCategory;

  @ApiProperty({ description: '按请求 locale 解析后的显示名' })
  name: string;

  @ApiProperty()
  enabled: boolean;
}
