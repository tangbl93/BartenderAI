import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

const RESULTS = ['success', 'fail'] as const;

export class LabEntryDto {
  @ApiProperty()
  @IsString()
  recipeId: string;

  @ApiProperty()
  @IsString()
  imageUrl: string;

  @ApiProperty({ enum: RESULTS })
  @IsIn(RESULTS as unknown as string[])
  result: (typeof RESULTS)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class LabEntryViewDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  recipeId: string;
  @ApiProperty()
  imageUrl: string;
  @ApiProperty({ enum: RESULTS })
  result: string;
  @ApiProperty({ nullable: true })
  note: string | null;
  @ApiProperty()
  isPublic: boolean;
  @ApiProperty({ enum: ['private', 'pending', 'approved', 'rejected'] })
  moderationStatus: string;
  @ApiProperty({ format: 'date-time' })
  createdAt: string;
}
