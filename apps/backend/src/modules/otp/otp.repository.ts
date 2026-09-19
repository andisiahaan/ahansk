import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CacheService } from '../../infrastructure/cache/cache.service';
import * as crypto from 'crypto';

export interface OtpResult {
  code: string; // Dikembalikan sekali saja ke caller — untuk dikirim ke user
  expiresAt: Date;
  cooldownSeconds: number; // 0 = tidak ada cooldown
}

@Injectable()
export class OtpRepository {
  private readonly MAX_ATTEMPTS = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  private hashCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  private getAttemptCacheKey(userId: string, purpose: string): string {
    return `otp:attempts:${userId}:${purpose}`;
  }

  /** Hapus OTP lama untuk purpose yang sama, lalu buat yang baru */
  async generate(
    userId: string,
    purpose: string,
    identifier?: string,
    ttlMinutes = 10,
  ): Promise<OtpResult> {
    await this.prisma.otp.deleteMany({ where: { user_id: userId, purpose } });
    await this.cacheService.del(this.getAttemptCacheKey(userId, purpose));

    const code      = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);

    await this.prisma.otp.create({
      data: { user_id: userId, purpose, identifier: identifier ?? null, code_hash: this.hashCode(code), expires_at: expiresAt },
    });

    return { code, expiresAt, cooldownSeconds: 0 };
  }

  /** Verify OTP — hapus setelah berhasil (delete-on-use), batasi percobaan gagal maksimal 5 kali */
  async verify(userId: string, purpose: string, code: string, identifier?: string): Promise<boolean> {
    const attemptKey = this.getAttemptCacheKey(userId, purpose);
    const attempts = (await this.cacheService.get<number>(attemptKey)) ?? 0;

    if (attempts >= this.MAX_ATTEMPTS) {
      await this.prisma.otp.deleteMany({ where: { user_id: userId, purpose } });
      await this.cacheService.del(attemptKey);
      return false;
    }

    const hash = this.hashCode(code.trim());
    const otp  = await this.prisma.otp.findFirst({
      where: { user_id: userId, purpose, code_hash: hash, expires_at: { gt: new Date() } },
    });

    if (!otp || (identifier && otp.identifier !== identifier)) {
      await this.cacheService.set(attemptKey, attempts + 1, 600);
      return false;
    }

    await this.prisma.otp.delete({ where: { id: otp.id } });
    await this.cacheService.del(attemptKey);
    return true;
  }

  /** Kembalikan sisa cooldown (detik). 0 = bisa kirim ulang */
  async cooldownSeconds(userId: string, purpose: string, cooldown = 60): Promise<number> {
    const latest = await this.prisma.otp.findFirst({
      where: { user_id: userId, purpose, created_at: { gt: new Date(Date.now() - cooldown * 1000) } },
      orderBy: { created_at: 'desc' },
    });
    if (!latest) return 0;
    const elapsed = Math.floor((Date.now() - latest.created_at.getTime()) / 1000);
    return Math.max(0, cooldown - elapsed);
  }

  async deleteAllForUser(userId: string, purpose: string): Promise<void> {
    await this.prisma.otp.deleteMany({ where: { user_id: userId, purpose } });
    await this.cacheService.del(this.getAttemptCacheKey(userId, purpose));
  }
}
