import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '../../common/constants';

export class RegisterDto {
  @ApiProperty({ description: '邮箱或手机号' })
  @IsString()
  account: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayName?: string;
}

export class LoginDto {
  @ApiProperty()
  @IsString()
  account: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class DeviceLoginDto {
  @ApiProperty({ description: 'Android=GAID；其它平台=安装级设备标识' })
  @IsString()
  deviceId: string;

  @ApiPropertyOptional({ enum: ['android', 'ios', 'web'], default: 'android' })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({ default: 'en' })
  @IsOptional()
  @IsString()
  locale?: string;
}

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  account: string;

  @ApiProperty({ nullable: true })
  displayName: string | null;

  @ApiProperty({ enum: ['user', 'operator', 'admin'] })
  role: Role;

  @ApiProperty({ default: false })
  isDevice: boolean;
}

export class AuthResultDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}
