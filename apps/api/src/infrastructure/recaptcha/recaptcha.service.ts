import { Injectable } from '@nestjs/common';
import { CaptchaService } from '../captcha/captcha.service';

/**
 * @deprecated Use `CaptchaService` directly instead.
 */
@Injectable()
export class RecaptchaService {
  constructor(private readonly captchaService: CaptchaService) {}

  get isEnabled(): boolean {
    return this.captchaService.isEnabled;
  }

  async verify(token: string | undefined): Promise<void> {
    return this.captchaService.verify(token);
  }
}
