import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import * as crypto from 'crypto';
import { AuthRepository } from './auth.repository';
import { NotificationService } from '../notifications/notification.service';
import { BanService } from '../users/ban.service';
import { messages } from '@ahansk/shared';
import type { AuthUser } from '@ahansk/shared';
import {
  setAuthCookies,
  setAccessTokenCookie,
  clearAuthCookies,
} from './auth-cookie.helper';

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

  async issueTokens(
    userId: number | bigint,
    res: Response,
    ip?: string,
    ua?: string,
  ): Promise<{ message: string }> {
    const accessToken = this.signAccessToken(userId);
    const raw = crypto.randomBytes(40).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
    const days = this.config.get<number>('app.jwt.refreshExpiresDays', 7);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const accessExpires = this.config.get<string>('app.jwt.accessExpires', '15m');

    await this.repo.createRefreshToken({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      ip_address: ip,
      user_agent: ua,
    });

    setAuthCookies(res.req, res, accessToken, raw, expiresAt, accessExpires);

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
    await this.processTokenRefresh(rawToken, res.req, res, false);
    return { message: 'Token refreshed' };
  }

  async refreshSilently(rawToken: string, req: any, res: Response): Promise<AuthUser | null> {
    try {
      return await this.processTokenRefresh(rawToken, req, res, true);
    } catch {
      return null;
    }
  }

  private async processTokenRefresh(
    rawToken: string,
    req: any,
    res: Response,
    isSilent = false,
  ): Promise<AuthUser | null> {
    if (!rawToken) {
      if (!isSilent) throw new UnauthorizedException(messages.auth.refreshTokenInvalid);
      return null;
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const record = await this.repo.findRefreshToken(tokenHash);

    if (!record || record.expires_at < new Date()) {
      clearAuthCookies(req, res);
      if (!isSilent) throw new UnauthorizedException(messages.auth.refreshTokenInvalid);
      return null;
    }

    const userId = Number(record.user_id);
    const isBanned = await this.banService.isUserBanned(userId);
    if (isBanned) {
      clearAuthCookies(req, res);
      if (!isSilent) throw new UnauthorizedException('Your account has been banned. Please contact support.');
      return null;
    }

    const user = await this.repo.findUserById(userId);
    if (!user || !user.is_active) {
      clearAuthCookies(req, res);
      if (!isSilent) throw new UnauthorizedException(messages.auth.refreshTokenInvalid);
      return null;
    }

    const accessExpires = this.config.get<string>('app.jwt.accessExpires', '15m');
    const authUser: AuthUser = {
      id: Number(user.id),
      email: user.email,
      name: user.name,
      role: user.role,
      twoFactorEnabled: user.totp_enabled,
      avatar: user.avatar,
    };

    // Grace period for token rotation race conditions (within 60s)
    if (record.revoked_at) {
      if (record.replaced_by) {
        const revokedAgo = Date.now() - record.revoked_at.getTime();
        if (revokedAgo < 60_000) {
          const accessToken = this.signAccessToken(userId);
          setAccessTokenCookie(req, res, accessToken, accessExpires);
          return authUser;
        }
        await this.repo.revokeAllUserRefreshTokens(record.user_id);
      }
      clearAuthCookies(req, res);
      if (!isSilent) throw new UnauthorizedException(messages.auth.refreshTokenInvalid);
      return null;
    }

    const newRaw = crypto.randomBytes(40).toString('hex');
    const newHash = crypto.createHash('sha256').update(newRaw).digest('hex');
    const days = this.config.get<number>('app.jwt.refreshExpiresDays', 7);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await this.repo.rotateRefreshToken(tokenHash, newHash, expiresAt);

    const accessToken = this.signAccessToken(userId);
    setAuthCookies(req, res, accessToken, newRaw, expiresAt, accessExpires);
    return authUser;
  }

  async logout(res: Response): Promise<void> {
    const rawToken = res.req?.cookies?.refresh_token as string | undefined;
    if (rawToken) {
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      await this.repo.revokeRefreshToken(tokenHash);
    }
    clearAuthCookies(res.req, res);
  }
}
