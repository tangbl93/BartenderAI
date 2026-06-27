import { Injectable } from '@nestjs/common';

/**
 * In-memory JWT blacklist for logout. Suitable for dev/single-instance.
 * For multi-instance prod this would be backed by Redis.
 */
@Injectable()
export class TokenBlacklistService {
  private readonly revoked = new Set<string>();

  revoke(token: string): void {
    this.revoked.add(token);
  }

  isRevoked(token: string): boolean {
    return this.revoked.has(token);
  }
}
