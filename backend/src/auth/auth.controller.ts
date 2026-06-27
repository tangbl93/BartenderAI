import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ExtractJwt } from 'passport-jwt';
import { AuthService } from './auth.service';
import { AuthResultDto, DeviceLoginDto, LoginDto, RegisterDto, UserDto } from './dto/auth.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: '前台用户注册' })
  @ApiOkResponse({ type: AuthResultDto })
  register(@Body() dto: RegisterDto): Promise<AuthResultDto> {
    return this.auth.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: '前台用户登录' })
  @ApiOkResponse({ type: AuthResultDto })
  login(@Body() dto: LoginDto): Promise<AuthResultDto> {
    return this.auth.login(dto);
  }

  @Public()
  @Post('admin/login')
  @HttpCode(200)
  @ApiOperation({ summary: '后台管理员/运营登录' })
  @ApiOkResponse({ type: AuthResultDto })
  adminLogin(@Body() dto: LoginDto): Promise<AuthResultDto> {
    return this.auth.adminLogin(dto);
  }

  @Public()
  @Post('device')
  @HttpCode(200)
  @ApiOperation({ summary: '设备自动登录（Android 以 GAID 作为 UID）' })
  @ApiOkResponse({ type: AuthResultDto })
  deviceLogin(@Body() dto: DeviceLoginDto): Promise<AuthResultDto> {
    return this.auth.deviceLogin(dto);
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: '注销（令牌失效）' })
  logout(@Req() req: any): void {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    this.auth.logout(token ?? undefined);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: '当前用户信息' })
  @ApiOkResponse({ type: UserDto })
  me(@CurrentUser() user: AuthUser): Promise<UserDto> {
    return this.auth.getProfile(user.id);
  }
}
