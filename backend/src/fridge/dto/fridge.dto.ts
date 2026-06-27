import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFridgeScanDto {
  @ApiProperty({ type: [String], description: '本次扫描/选材的材料 id 列表' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ingredientIds: string[];

  @ApiPropertyOptional({
    description: '材料名拼接概要（由客户端按当前语言生成，如 "Gin, Lime, Tonic"）',
  })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: '可选的扫描参考图 URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class FridgeScanViewDto {
  @ApiProperty()
  id: string;
  @ApiProperty({ type: [String] })
  ingredientIds: string[];
  @ApiProperty({ description: '材料名拼接概要，如 "Gin, Lime, Tonic"' })
  summary: string;
  @ApiProperty({ nullable: true })
  imageUrl: string | null;
  @ApiProperty({ format: 'date-time' })
  createdAt: string;
}
