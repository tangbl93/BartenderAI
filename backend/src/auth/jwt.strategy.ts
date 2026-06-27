import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenBlacklistService } from './token-blacklist.service';

export interface JwtPayload {
  sub: string;
  account: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly blacklist: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.secret') || 'change-me-in-development',
      passReqToCallback: true,
    });
  }

  validate(req: any, payload: JwtPayload) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token && this.blacklist.isRevoked(token)) {
      throw new UnauthorizedException('Token revoked');
    }
    return { id: payload.sub, account: payload.account, role: payload.role };
  }
}
