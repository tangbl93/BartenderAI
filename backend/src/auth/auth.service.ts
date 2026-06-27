import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { UserEntity } from '../database/entities';
import { Role } from '../common/constants';
import { AuthResultDto, RegisterDto, UserDto } from './dto/auth.dto';
import { TokenBlacklistService } from './token-blacklist.service';

const BCRYPT_ROUNDS = 10;
/** Identical message for missing-account vs wrong-password (anti-enumeration). */
const INVALID_CREDENTIALS = '账号或密码错误';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly blacklist: TokenBlacklistService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResultDto> {
    const existing = await this.users.findOne({
      where: { account: dto.account },
    });
    if (existing) {
      throw new ConflictException('账号已存在');
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.users.save(
      this.users.create({
        account: dto.account,
        passwordHash,
        displayName: dto.displayName ?? null,
        role: 'user',
      }),
    );
    return this.issueTokens(user);
  }

  async login(dto: { account: string; password: string }): Promise<AuthResultDto> {
    return this.authenticate(dto, ['user', 'operator', 'admin']);
  }

  /** Admin/operator login — front-end users are rejected with the SAME error. */
  async adminLogin(dto: {
    account: string;
    password: string;
  }): Promise<AuthResultDto> {
    return this.authenticate(dto, ['operator', 'admin']);
  }

  private async authenticate(
    dto: { account: string; password: string },
    allowedRoles: Role[],
  ): Promise<AuthResultDto> {
    const user = await this.users.findOne({ where: { account: dto.account } });
    // Always run a bcrypt comparison to keep timing consistent and avoid
    // leaking whether the account exists.
    const hash =
      user?.passwordHash ||
      '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva';
    const passwordOk = await bcrypt.compare(dto.password, hash);
    if (!user || !passwordOk || !allowedRoles.includes(user.role)) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }
    return this.issueTokens(user);
  }

  logout(token: string | undefined): void {
    if (token) {
      this.blacklist.revoke(token);
    }
  }

  async getProfile(userId: string): Promise<UserDto> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('未登录');
    }
    return this.toUserDto(user);
  }

  private issueTokens(user: UserEntity): AuthResultDto {
    const payload = { sub: user.id, account: user.account, role: user.role };
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('jwt.secret'),
      expiresIn: this.config.get<string>('jwt.expiresIn'),
    });
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('jwt.secret'),
      expiresIn: this.config.get<string>('jwt.refreshExpiresIn'),
    });
    return { accessToken, refreshToken, user: this.toUserDto(user) };
  }

  private toUserDto(user: UserEntity): UserDto {
    return {
      id: user.id,
      account: user.account,
      displayName: user.displayName,
      role: user.role,
    };
  }
}
