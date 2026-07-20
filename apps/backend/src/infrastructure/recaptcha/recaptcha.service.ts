import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { messages } from '@ahansk/shared';

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

@Injectable()
export class RecaptchaService {
  constructor(private readonly config: ConfigService) {}

  async verify(token: string): Promise<void> {
    const secretKey = this.config.get<string>('app.recaptcha.secretKey', '');
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    const res = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?${params}`,
      { method: 'POST' },
    );
    const data = (await res.json()) as RecaptchaResponse;

    if (!data.success) {
      throw new BadRequestException(messages.common.recaptchaInvalid);
    }
  }
}
