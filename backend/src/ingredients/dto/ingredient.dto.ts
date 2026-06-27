import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
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

/**
 * User-contributed ingredient: a single name in the submitter's locale. The
 * entry is enabled + public immediately (community-sourced library).
 */
export class PublicIngredientDto {
  @ApiProperty({ enum: INGREDIENT_CATEGORIES })
  @IsIn(INGREDIENT_CATEGORIES as unknown as string[], { message: '分类非法' })
  category: IngredientCategory;

  @ApiProperty({ description: '材料名称（提交者当前语言）' })
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  name: string;

  @ApiPropertyOptional({ description: '提交语言，决定 name 写入的语言键' })
  @IsOptional()
  @IsString()
  locale?: string;
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

  @ApiProperty({ nullable: true, description: '扁平插画配图 URL（异步生成，初始为空）' })
  imageUrl: string | null;
}
