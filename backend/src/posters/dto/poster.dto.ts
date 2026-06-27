import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
} from 'class-validator';

export class PosterJobDto {
  @ApiProperty()
  @IsString()
  recipeId: string;

  @ApiPropertyOptional({
    type: [String],
    description: '留空则用三种默认预设',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  templateIds?: string[];

  @ApiPropertyOptional({ default: 'en' })
  @IsOptional()
  @IsString()
  locale?: string;
}

export class PosterViewDto {
  @ApiProperty()
  id: string;
  @ApiProperty({ enum: ['home_closeup', 'bar_commercial', 'steps_long'] })
  dimension: string;
  @ApiProperty()
  templateId: string;
  @ApiProperty({ enum: ['pending', 'running', 'done', 'failed'] })
  status: string;
  @ApiProperty({ nullable: true })
  imageUrl: string | null;
  @ApiProperty({ description: '海报文字快照（与配方一致）', nullable: true })
  textSnapshot: Record<string, any> | null;
}

export class PosterJobViewDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  recipeId: string;
  @ApiProperty({ enum: ['pending', 'running', 'partial', 'done', 'failed'] })
  status: string;
  @ApiProperty({ type: [PosterViewDto] })
  posters: PosterViewDto[];
}
