import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../database/entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { TokenBlacklistService } from './token-blacklist.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: { expiresIn: config.get<string>('jwt.expiresIn') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TokenBlacklistService],
  exports: [AuthService, TokenBlacklistService],
})
export class AuthModule {}
