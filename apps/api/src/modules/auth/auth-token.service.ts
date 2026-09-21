import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import * as crypto from 'crypto';
import { AuthRepository } from './auth.repository';
import { NotificationService } from '../notifications/notification.service';
import { BanService } from '../users/ban.service';
import { messages } from '@ahansk/shared';

const COOKIE_DEFAULTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationService,
    private readonly banService: BanService,
  ) {}

  signAccessToken(userId: number | bigint): string {
    return this.jwt.sign(
      { sub: Number(userId), type: 'access' },
      {
        expiresIn: this.config.get('app.jwt.accessExpires', '15m'),
        secret: this.config.get('app.jwt.accessSecret'),
      },
    );
  }

  setAuthCookies(res: Response, accessToken: string, refreshToken: string, refreshExpiresAt: Date): void {
    res.cookie('access_token', accessToken, { ...COOKIE_DEFAULTS, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, {
      ...COOKIE_DEFAULTS,
      maxAge: refreshExpiresAt.getTime() - Date.now(),
      path: '/auth/refresh',
    });
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie('access_token', { ...COOKIE_DEFAULTS });
    res.clearCookie('refresh_token', { ...COOKIE_DEFAULTS, path: '/auth/refresh' });
  }

  async issueTokens(userId: number | bigint, res: Response, ip?: string, ua?: string): Promise<{ message: string }> {
    const accessToken = this.signAccessToken(userId);
    const raw = crypto.randomBytes(40).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
    const days = this.config.get<number>('app.jwt.refreshExpiresDays', 7);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await this.repo.createRefreshToken({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      ip_address: ip,
      user_agent: ua,
    });

    this.setAuthCookies(res, accessToken, raw, expiresAt);

    void this.notifications.send({
      type: 'account.login_alert',
      userId: Number(userId),
      title: 'New Login Detected',
      message: `Your account was accessed from${ip ? ` IP ${ip}` : ' a new device'}.`,
      data: { ip, userAgent: ua },
    });

    return { message: messages.auth.loginSuccess };
  }

  async refresh(rawToken: string, res: Response, ip?: string, ua?: string): Promise<{ message: string }> {
    if (!rawToken) throw new UnauthorizedException(messages.auth.refreshTokenInvalid);

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const record = await this.repo.findRefreshToken(tokenHash);

    if (!record || record.revoked_at || record.expires_at < new Date()) {
      if (record?.replaced_by) await this.repo.revokeAllUserRefreshTokens(record.user_id);
      this.clearAuthCookies(res);
      throw new UnauthorizedException(messages.auth.refreshTokenInvalid);
    }

    const isBanned = await this.banService.isUserBanned(Number(record.user_id));
    if (isBanned) {
      this.clearAuthCookies(res);
      throw new UnauthorizedException('Your account has been banned. Please contact support.');
    }

    const newRaw = crypto.randomBytes(40).toString('hex');
    const newHash = crypto.createHash('sha256').update(newRaw).digest('hex');
    const days = this.config.get<number>('app.jwt.refreshExpiresDays', 7);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await this.repo.rotateRefreshToken(tokenHash, newHash, expiresAt);

    const accessToken = this.signAccessToken(record.user_id);
    this.setAuthCookies(res, accessToken, newRaw, expiresAt);
    return { message: 'Token refreshed' };
  }

  async logout(res: Response): Promise<void> {
    const rawToken = res.req?.cookies?.refresh_token as string | undefined;
    if (rawToken) {
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      await this.repo.revokeRefreshToken(tokenHash);
    }
    this.clearAuthCookies(res);
  }
}
