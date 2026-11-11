import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { AuthRepository } from './auth.repository';
import { NotificationService } from '../notifications/notification.service';
import { OtpService } from '../otp/otp.service';
import { CacheService } from '../../infrastructure/cache/cache.service';
import type {
  RequestCurrentEmailOtpDto,
  VerifyCurrentEmailOtpDto,
  RequestNewEmailOtpDto,
  ConfirmEmailChangeDto,
  RequestEmailChangeDto,
  VerifyEmailChangeOtpDto,
} from '@ahansk/shared';

interface EmailChangeTicketData {
  userId: number;
  oldEmail: string;
  newEmail?: string;
}

@Injectable()
export class AuthEmailChangeService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly otp: OtpService,
    private readonly notifications: NotificationService,
    private readonly cache: CacheService,
  ) {}

  private ticketKey(ticket: string): string {
    return `email_change_ticket:${ticket}`;
  }

  // ─── Step 1: Request OTP to Current Email ───────────────────────────────────
  async requestCurrentEmailOtp(
    userId: number,
    dto: RequestCurrentEmailOtpDto,
  ): Promise<{ message: string }> {
    const user = await this.repo.findUserById(userId);
    if (!user || !user.password) {
      throw new BadRequestException('User not found or no password set.');
    }

    const valid = await argon2.verify(user.password, dto.password);
    if (!valid) {
      throw new BadRequestException('Invalid current password.');
    }

    const result = await this.otp.sendOtp({
      userId,
      purpose: 'email_change_current',
      toEmail: user.email,
      toName: user.name,
      ttlMinutes: 15,
      cooldownSeconds: 60,
    });

    if (!result.sent) {
      throw new BadRequestException(
        `Please wait ${result.cooldownSeconds} seconds before requesting a new code.`,
      );
    }

    return {
      message: 'Verification code sent to your current email address.',
    };
  }

  // ─── Step 2: Verify OTP from Current Email -> Issue Ticket ──────────────────
  async verifyCurrentEmailOtp(
    userId: number,
    dto: VerifyCurrentEmailOtpDto,
  ): Promise<{ message: string; ticket: string }> {
    const user = await this.repo.findUserById(userId);
    if (!user) throw new NotFoundException('User not found.');

    const validOtp = await this.otp.verifyOtp({
      userId,
      purpose: 'email_change_current',
      code: dto.otp,
    });

    if (!validOtp) {
      throw new BadRequestException('Invalid or expired verification code.');
    }

    // Generate random 32-byte hex ticket, valid for 15 minutes (900 seconds)
    const ticket = crypto.randomBytes(32).toString('hex');
    const data: EmailChangeTicketData = {
      userId,
      oldEmail: user.email,
    };
    await this.cache.set(this.ticketKey(ticket), data, 900);

    return {
      message: 'Current email successfully verified.',
      ticket,
    };
  }

  // ─── Step 3: Request OTP to New Email (requires valid ticket) ───────────────
  async requestNewEmailOtp(
    userId: number,
    dto: RequestNewEmailOtpDto,
  ): Promise<{ message: string }> {
    const ticketData = await this.cache.get<EmailChangeTicketData>(
      this.ticketKey(dto.ticket),
    );

    if (!ticketData || ticketData.userId !== userId) {
      throw new BadRequestException('Invalid or expired verification session.');
    }

    const newEmail = dto.new_email.trim().toLowerCase();
    if (newEmail === ticketData.oldEmail.toLowerCase()) {
      throw new BadRequestException(
        'New email address must be different from current email.',
      );
    }

    const existingUser = await this.repo.findUserByEmail(newEmail);
    if (existingUser && Number(existingUser.id) !== userId) {
      throw new ConflictException('Email address is already in use.');
    }

    const user = await this.repo.findUserById(userId);
    if (!user) throw new NotFoundException('User not found.');

    const result = await this.otp.sendOtp({
      userId,
      purpose: 'email_change_new',
      toEmail: newEmail,
      toName: user.name,
      identifier: newEmail,
      ttlMinutes: 15,
      cooldownSeconds: 60,
    });

    if (!result.sent) {
      throw new BadRequestException(
        `Please wait ${result.cooldownSeconds} seconds before requesting a new code.`,
      );
    }

    // Update ticket with targeted new email and refresh 15m TTL
    ticketData.newEmail = newEmail;
    await this.cache.set(this.ticketKey(dto.ticket), ticketData, 900);

    return {
      message: 'Verification code sent to your new email address.',
    };
  }

  // ─── Step 4: Confirm New Email with OTP & Finalize ──────────────────────────
  async confirmEmailChange(
    userId: number,
    dto: ConfirmEmailChangeDto,
  ): Promise<{ message: string; email: string }> {
    const ticketData = await this.cache.get<EmailChangeTicketData>(
      this.ticketKey(dto.ticket),
    );

    if (!ticketData || ticketData.userId !== userId) {
      throw new BadRequestException('Invalid or expired verification session.');
    }

    const newEmail = dto.new_email.trim().toLowerCase();
    if (ticketData.newEmail && ticketData.newEmail.toLowerCase() !== newEmail) {
      throw new BadRequestException(
        'Email address does not match requested address.',
      );
    }

    const validOtp = await this.otp.verifyOtp({
      userId,
      purpose: 'email_change_new',
      code: dto.otp,
      identifier: newEmail,
    });

    if (!validOtp) {
      throw new BadRequestException('Invalid or expired verification code.');
    }

    // Re-verify uniqueness before applying changes
    const existing = await this.repo.findUserByEmail(newEmail);
    if (existing && Number(existing.id) !== userId) {
      throw new ConflictException('Email address is already in use.');
    }

    // Update email in DB
    await this.repo.updateUserEmail(userId, newEmail);

    // Invalidate ticket from cache
    await this.cache.del(this.ticketKey(dto.ticket));

    // Send notifications to user
    void this.notifications.send({
      type: 'account.email_changed',
      userId,
      title: 'Email Address Changed',
      message: `Your account email address was changed to ${newEmail}.`,
    });

    return {
      message: 'Email address updated successfully.',
      email: newEmail,
    };
  }

  // ─── Legacy compatibility methods ─────────────────────────────────────────
  async requestEmailChange(
    userId: number,
    dto: RequestEmailChangeDto,
  ): Promise<{ message: string }> {
    return this.requestCurrentEmailOtp(userId, { password: dto.password });
  }

  async verifyEmailChange(
    userId: number,
    dto: VerifyEmailChangeOtpDto,
  ): Promise<{ message: string }> {
    return this.verifyCurrentEmailOtp(userId, { otp: dto.otp });
  }
}
