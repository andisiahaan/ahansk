import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpRepository } from './otp.repository';
import { EmailService } from '../../infrastructure/email/email.service';

@Module({
  providers: [OtpService, OtpRepository, EmailService],
  exports:   [OtpService],
})
export class OtpModule {}
