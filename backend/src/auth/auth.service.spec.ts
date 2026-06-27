import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { UserEntity } from '../database/entities';
import { createTestDataSource } from '../../test/test-datasource';

describe('AuthService', () => {
  let ds: DataSource;
  let service: AuthService;

  beforeEach(async () => {
    ds = await createTestDataSource();
    const config = new ConfigService({
      jwt: { secret: 'test-secret', expiresIn: '2h', refreshExpiresIn: '7d' },
    });
    const jwt = new JwtService({ secret: 'test-secret' });
    service = new AuthService(
      ds.getRepository(UserEntity),
      jwt,
      config,
      new TokenBlacklistService(),
    );
  });

  afterEach(async () => {
    await ds.destroy();
  });

  it('hashes the password (never stores plaintext) and returns tokens', async () => {
    const result = await service.register({
      account: 'alice@example.com',
      password: 'supersecret1',
      displayName: 'Alice',
    });
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.user.account).toBe('alice@example.com');
    expect(result.user.role).toBe('user');

    const stored = await ds
      .getRepository(UserEntity)
      .findOne({ where: { account: 'alice@example.com' } });
    expect(stored!.passwordHash).not.toBe('supersecret1');
    expect(await bcrypt.compare('supersecret1', stored!.passwordHash)).toBe(true);
  });

  it('rejects duplicate account registration (409)', async () => {
    await service.register({ account: 'dup@example.com', password: 'password123' });
    await expect(
      service.register({ account: 'dup@example.com', password: 'password123' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns IDENTICAL error for wrong account vs wrong password (anti-enumeration)', async () => {
    await service.register({ account: 'bob@example.com', password: 'correctpass1' });

    let missingMsg = '';
    let wrongPwMsg = '';
    try {
      await service.login({ account: 'nobody@example.com', password: 'whatever1' });
    } catch (e) {
      expect(e).toBeInstanceOf(UnauthorizedException);
      missingMsg = (e as UnauthorizedException).message;
    }
    try {
      await service.login({ account: 'bob@example.com', password: 'wrongpass1' });
    } catch (e) {
      expect(e).toBeInstanceOf(UnauthorizedException);
      wrongPwMsg = (e as UnauthorizedException).message;
    }
    expect(missingMsg).toBe(wrongPwMsg);
    expect(missingMsg).toBeTruthy();
  });

  it('successful login returns a token', async () => {
    await service.register({ account: 'carol@example.com', password: 'mypassword1' });
    const res = await service.login({
      account: 'carol@example.com',
      password: 'mypassword1',
    });
    expect(res.accessToken).toBeTruthy();
  });

  it('admin login rejects front-end users with the same credential error', async () => {
    await service.register({ account: 'user@example.com', password: 'userpass123' });
    await expect(
      service.adminLogin({ account: 'user@example.com', password: 'userpass123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
