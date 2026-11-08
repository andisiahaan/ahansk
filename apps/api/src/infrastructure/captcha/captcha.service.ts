import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { messages } from '@ahansk/shared';
import type { CaptchaProvider, CaptchaVerifyResponse } from './captcha.interface';

@Injectable()
export class CaptchaService {
  private readonly provider: CaptchaProvider | null;
  private readonly secretKey: string;

  constructor(private readonly config: ConfigService) {
    const rawProvider = this.config.get<string>('app.captcha.provider', '');
    const secret = this.config.get<string>('app.captcha.secretKey', '');

    if ((rawProvider === 'google' || rawProvider === 'turnstile') && secret) {
      this.provider = rawProvider;
      this.secretKey = secret;
    } else {
      this.provider = null;
      this.secretKey = '';
    }
  }

  get isEnabled(): boolean {
    return this.provider !== null && this.secretKey.length > 0;
  }

  get activeProvider(): CaptchaProvider | null {
    return this.provider;
  }

  async verify(token: string | undefined, remoteIp?: string): Promise<void> {
    if (!this.isEnabled) return;

    if (!token || typeof token !== 'string' || token.length === 0 || token.length > 2048) {
      throw new BadRequestException(
        messages.common.captchaInvalid ?? messages.common.recaptchaInvalid,
      );
    }

    if (this.provider === 'turnstile') {
      await this.verifyTurnstile(token, remoteIp);
    } else if (this.provider === 'google') {
      await this.verifyGoogle(token, remoteIp);
    }
  }

  private async verifyTurnstile(token: string, remoteIp?: string): Promise<void> {
    const params = new URLSearchParams({
      secret: this.secretKey,
      response: token,
    });
    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    try {
      const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        signal: AbortSignal.timeout(10_000),
        body: params.toString(),
      });

      const data = (await res.json()) as CaptchaVerifyResponse;
      if (!data.success) {
        throw new BadRequestException(
          messages.common.captchaInvalid ?? messages.common.recaptchaInvalid,
        );
      }
    } catch (err: unknown) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(
        messages.common.captchaInvalid ?? messages.common.recaptchaInvalid,
      );
    }
  }

  private async verifyGoogle(token: string, remoteIp?: string): Promise<void> {
    const params = new URLSearchParams({
      secret: this.secretKey,
      response: token,
    });
    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    try {
      const res = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?${params.toString()}`,
        { method: 'POST' },
      );

      const data = (await res.json()) as CaptchaVerifyResponse;
      if (!data.success) {
        throw new BadRequestException(
          messages.common.captchaInvalid ?? messages.common.recaptchaInvalid,
        );
      }
    } catch (err: unknown) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(
        messages.common.captchaInvalid ?? messages.common.recaptchaInvalid,
      );
    }
  }
}

