import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class RecipeGenerateDto {
  // NOTE: minItems is documented but NOT enforced here — the service returns a
  // 422 with guidance (per the OpenAPI contract) rather than a 400 validation
  // error when fewer than 2 ingredients are selected.
  @ApiProperty({ type: [String], minItems: 2 })
  @IsArray()
  @IsString({ each: true })
  ingredientIds: string[];

  @ApiPropertyOptional({ default: 'en' })
  @IsOptional()
  @IsString()
  locale?: string;
}

export class RecipeItemDto {
  @ApiProperty()
  ingredientId: string;
  @ApiProperty()
  name: string;
  @ApiProperty({ example: '45 ml' })
  amount: string;
  @ApiProperty({ default: false })
  optional: boolean;
}

export class ToolSubstitutionDto {
  @ApiProperty()
  tool: string;
  @ApiProperty()
  homeAlternative: string;
}

export class RecipeDto {
  @ApiProperty()
  id: string;
  @ApiProperty({ description: '创意酒名' })
  name: string;
  @ApiProperty({ description: '微醺文案' })
  tagline: string;
  @ApiProperty()
  locale: string;
  @ApiProperty({ type: [RecipeItemDto] })
  items: RecipeItemDto[];
  @ApiProperty({ type: [String], description: '极简分步骤' })
  steps: string[];
  @ApiProperty({ type: [ToolSubstitutionDto] })
  toolSubstitutions: ToolSubstitutionDto[];
  @ApiProperty({ example: '8-12% ABV' })
  alcoholRange: string;
  @ApiProperty({ type: [String], description: '含适量饮用/未成年人禁饮提示' })
  safetyNotes: string[];
  @ApiProperty({ default: false })
  isExample: boolean;
  @ApiProperty({
    nullable: true,
    description: '扁平插画配图 URL（异步生成，初始为空）',
  })
  imageUrl: string | null;
  @ApiProperty({
    nullable: true,
    description: '精选配方预渲染步骤图 URL（中文，全语种共享）',
  })
  featuredImageUrl: string | null;
}
