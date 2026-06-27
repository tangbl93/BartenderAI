import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TEMPLATE_DIMENSIONS } from '../../common/constants';

const TEXT_ALIGNS = ['left', 'center', 'right'] as const;
const WATERMARK_POSITIONS = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'center',
] as const;
const TEXT_RENDER_MODES = ['model', 'backend'] as const;

export class LayoutConfigDto {
  @ApiPropertyOptional({ enum: TEXT_ALIGNS, default: 'center' })
  @IsOptional()
  @IsIn(TEXT_ALIGNS as unknown as string[])
  textAlign?: (typeof TEXT_ALIGNS)[number];

  @ApiPropertyOptional({ enum: WATERMARK_POSITIONS, default: 'bottom-right' })
  @IsOptional()
  @IsIn(WATERMARK_POSITIONS as unknown as string[])
  watermarkPosition?: (typeof WATERMARK_POSITIONS)[number];
}

export class StyleTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: TEMPLATE_DIMENSIONS })
  @IsIn(TEMPLATE_DIMENSIONS as unknown as string[])
  dimension: string;

  @ApiProperty()
  @IsString()
  prompt: string;

  @ApiPropertyOptional({ type: LayoutConfigDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LayoutConfigDto)
  layout?: LayoutConfigDto;

  @ApiPropertyOptional({ enum: TEXT_RENDER_MODES, default: 'backend' })
  @IsOptional()
  @IsIn(TEXT_RENDER_MODES as unknown as string[])
  textRenderMode?: (typeof TEXT_RENDER_MODES)[number];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class StyleTemplateViewDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty({ enum: TEMPLATE_DIMENSIONS })
  dimension: string;
  @ApiProperty()
  prompt: string;
  @ApiProperty({ type: LayoutConfigDto })
  layout: LayoutConfigDto;
  @ApiProperty({ enum: TEXT_RENDER_MODES })
  textRenderMode: string;
  @ApiProperty()
  enabled: boolean;
  @ApiProperty()
  version: number;
}
