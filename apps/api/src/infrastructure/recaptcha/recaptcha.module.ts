import { Global, Module } from '@nestjs/common';
import { RecaptchaService } from './recaptcha.service';
import { CaptchaModule } from '../captcha/captcha.module';

@Global()
@Module({
  imports: [CaptchaModule],
  providers: [RecaptchaService],
  exports: [RecaptchaService],
})
export class RecaptchaModule {}
