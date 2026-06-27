import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminUserDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  account: string;
  @ApiProperty({ nullable: true })
  deviceId: string | null;
  @ApiProperty()
  isDevice: boolean;
  @ApiProperty({ nullable: true })
  displayName: string | null;
  @ApiProperty()
  role: string;
  @ApiProperty({ format: 'date-time' })
  createdAt: string;
}

export class UserPageDto {
  @ApiProperty({ type: [AdminUserDto] })
  items: AdminUserDto[];
  @ApiProperty()
  total: number;
  @ApiProperty()
  page: number;
  @ApiProperty()
  size: number;
}

export class AdminUserDetailDto {
  @ApiProperty({ type: AdminUserDto })
  user: AdminUserDto;
  @ApiProperty()
  counts: { labEntries: number; recipes: number; posters: number };
}

export class ResultItemDto {
  @ApiProperty({ enum: ['recipe', 'poster'] })
  type: 'recipe' | 'poster';
  @ApiProperty()
  id: string;
  @ApiProperty({ nullable: true })
  ownerId: string | null;
  @ApiProperty({ format: 'date-time' })
  createdAt: string;
  @ApiProperty()
  title: string;
  @ApiProperty({ nullable: true })
  imageUrl: string | null;
}

export class ResultsPageDto {
  @ApiProperty({ type: [ResultItemDto] })
  items: ResultItemDto[];
  @ApiProperty()
  total: number;
  @ApiProperty()
  page: number;
  @ApiProperty()
  size: number;
}

/** Shared pagination query for admin list endpoints. */
export class PageQuery {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size?: number = 20;
}

export class UserListQuery extends PageQuery {
  @ApiPropertyOptional({ description: '按 deviceId/account 片段搜索' })
  @IsOptional()
  @IsString()
  q?: string;
}

export class SharedContentQuery extends PageQuery {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class ResultsQuery extends PageQuery {
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ enum: ['recipe', 'poster'] })
  @IsOptional()
  @IsString()
  type?: 'recipe' | 'poster';
}
