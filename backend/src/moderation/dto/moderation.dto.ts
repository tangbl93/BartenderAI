import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

const DECISIONS = ['approve', 'reject'] as const;

export class ModerationDto {
  @ApiProperty({ enum: DECISIONS })
  @IsIn(DECISIONS as unknown as string[])
  decision: (typeof DECISIONS)[number];

  @ApiPropertyOptional({ description: 'reject 时必填' })
  @IsOptional()
  @IsString()
  reason?: string;
}
