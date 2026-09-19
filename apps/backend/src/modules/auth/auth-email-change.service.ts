import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthRepository } from './auth.repository';
import { NotificationService } from '../notifications/notification.service';
import { OtpService } from '../otp/otp.service';
import type { RequestEmailChangeDto, VerifyEmailChangeOtpDto } from '@ahansk/shared';

@Injectable()
export class AuthEmailChangeService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly otp: OtpService,
    private readonly notifications: NotificationService,
  ) {}

  async requestEmailChange(userId: string, dto: RequestEmailChangeDto): Promise<{ message: string }> {
    const user = await this.repo.findUserById(userId);
    if (!user || !user.password) throw new BadRequestException('User not found or no password set.');

    const valid = await argon2.verify(user.password, dto.password);
    if (!valid) throw new BadRequestException('Invalid password.');

    const exists = await this.repo.findUserByEmail(dto.new_email);
    if (exists) throw new ConflictException('Email already in use.');

    const result = await this.otp.sendOtp({
      userId,
      purpose: 'email_change',
      toEmail: dto.new_email,
      toName: user.name,
      ttlMinutes: 15,
    });

    if (!result.sent) {
      throw new BadRequestException(`Please wait ${result.cooldownSeconds} seconds before requesting a new OTP.`);
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.repo.createPendingEmailChange(userId, dto.new_email, expiresAt);

    return { message: 'OTP sent to your new email.' };
  }

  async verifyEmailChange(userId: string, dto: VerifyEmailChangeOtpDto): Promise<{ message: string }> {
    const user = await this.repo.findUserById(userId);
    if (!user || !user.password) throw new BadRequestException('User not found or no password set.');

    const validPwd = await argon2.verify(user.password, dto.password);
    if (!validPwd) throw new BadRequestException('Invalid password.');

    const validOtp = await this.otp.verifyOtp({ userId, purpose: 'email_change', code: dto.otp });
    if (!validOtp) throw new BadRequestException('Invalid or expired OTP.');

    const pending = await this.repo.findPendingEmailChangeByUserId(userId);
    if (!pending || pending.new_email !== dto.new_email) {
      throw new BadRequestException('Invalid email change request.');
    }

    // Re-check uniqueness to prevent race condition
    const exists = await this.repo.findUserByEmail(pending.new_email);
    if (exists && exists.id !== userId) {
      throw new ConflictException('Email already in use.');
    }

    await this.repo.completeEmailChange(userId, pending.id, pending.new_email);

    void this.notifications.send({
      type: 'account.email_changed',
      userId: userId,
      title: 'Email Address Changed',
      message: `Your account email address was changed to ${pending.new_email}.`,
    });

    return { message: 'Email successfully changed.' };
  }
}
