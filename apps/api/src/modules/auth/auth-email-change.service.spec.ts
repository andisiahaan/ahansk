import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthEmailChangeService } from './auth-email-change.service';
import { AuthRepository } from './auth.repository';
import { OtpService } from '../otp/otp.service';
import { NotificationService } from '../notifications/notification.service';
import { CacheService } from '../../infrastructure/cache/cache.service';

describe('AuthEmailChangeService', () => {
  let service: AuthEmailChangeService;

  const mockRepo = {
    findUserById: jest.fn(),
    findUserByEmail: jest.fn(),
    updateUserEmail: jest.fn(),
  };

  const mockOtp = {
    sendOtp: jest.fn(),
    verifyOtp: jest.fn(),
  };

  const mockNotifications = {
    send: jest.fn(),
  };

  const mockCacheStore = new Map<string, unknown>();
  const mockCache = {
    get: jest.fn((key: string) => Promise.resolve(mockCacheStore.get(key))),
    set: jest.fn((key: string, val: unknown) => {
      mockCacheStore.set(key, val);
      return Promise.resolve();
    }),
    del: jest.fn((key: string) => {
      mockCacheStore.delete(key);
      return Promise.resolve();
    }),
  };

  beforeEach(async () => {
    mockCacheStore.clear();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthEmailChangeService,
        { provide: AuthRepository, useValue: mockRepo },
        { provide: OtpService, useValue: mockOtp },
        { provide: NotificationService, useValue: mockNotifications },
        { provide: CacheService, useValue: mockCache },
      ],
    }).compile();

    service = module.get<AuthEmailChangeService>(AuthEmailChangeService);
  });

  describe('Step 1: requestCurrentEmailOtp', () => {
    it('should send OTP to current email when password is valid', async () => {
      const hashed = await argon2.hash('Secret123!');
      mockRepo.findUserById.mockResolvedValueOnce({
        id: BigInt(1),
        name: 'John Doe',
        email: 'john@example.com',
        password: hashed,
      });
      mockOtp.sendOtp.mockResolvedValueOnce({ sent: true, cooldownSeconds: 0 });

      const res = await service.requestCurrentEmailOtp(1, {
        password: 'Secret123!',
      });

      expect(res.message).toContain('current email');
      expect(mockOtp.sendOtp).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          toEmail: 'john@example.com',
          purpose: 'email_change_current',
        }),
      );
    });

    it('should throw BadRequestException when password is invalid', async () => {
      const hashed = await argon2.hash('Secret123!');
      mockRepo.findUserById.mockResolvedValueOnce({
        id: BigInt(1),
        name: 'John Doe',
        email: 'john@example.com',
        password: hashed,
      });

      await expect(
        service.requestCurrentEmailOtp(1, { password: 'WrongPassword' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Step 2: verifyCurrentEmailOtp', () => {
    it('should return session ticket when OTP is valid', async () => {
      mockRepo.findUserById.mockResolvedValueOnce({
        id: BigInt(1),
        email: 'john@example.com',
      });
      mockOtp.verifyOtp.mockResolvedValueOnce(true);

      const res = await service.verifyCurrentEmailOtp(1, { otp: '123456' });

      expect(res.ticket).toBeDefined();
      expect(typeof res.ticket).toBe('string');
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('should throw BadRequestException when OTP is invalid', async () => {
      mockRepo.findUserById.mockResolvedValueOnce({
        id: BigInt(1),
        email: 'john@example.com',
      });
      mockOtp.verifyOtp.mockResolvedValueOnce(false);

      await expect(
        service.verifyCurrentEmailOtp(1, { otp: '000000' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Step 3: requestNewEmailOtp', () => {
    it('should send OTP to new email when ticket is valid and email is free', async () => {
      const ticket = 'valid-ticket-123';
      mockCacheStore.set(`email_change_ticket:${ticket}`, {
        userId: 1,
        oldEmail: 'john@example.com',
      });
      mockRepo.findUserByEmail.mockResolvedValueOnce(null);
      mockRepo.findUserById.mockResolvedValueOnce({
        id: BigInt(1),
        name: 'John Doe',
      });
      mockOtp.sendOtp.mockResolvedValueOnce({ sent: true, cooldownSeconds: 0 });

      const res = await service.requestNewEmailOtp(1, {
        ticket,
        new_email: 'newjohn@example.com',
      });

      expect(res.message).toContain('new email');
      expect(mockOtp.sendOtp).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          toEmail: 'newjohn@example.com',
          purpose: 'email_change_new',
        }),
      );
    });

    it('should throw BadRequestException if new email equals old email', async () => {
      const ticket = 'valid-ticket-123';
      mockCacheStore.set(`email_change_ticket:${ticket}`, {
        userId: 1,
        oldEmail: 'john@example.com',
      });

      await expect(
        service.requestNewEmailOtp(1, {
          ticket,
          new_email: 'john@example.com',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if new email is taken by another user', async () => {
      const ticket = 'valid-ticket-123';
      mockCacheStore.set(`email_change_ticket:${ticket}`, {
        userId: 1,
        oldEmail: 'john@example.com',
      });
      mockRepo.findUserByEmail.mockResolvedValueOnce({
        id: BigInt(2),
        email: 'taken@example.com',
      });

      await expect(
        service.requestNewEmailOtp(1, {
          ticket,
          new_email: 'taken@example.com',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('Step 4: confirmEmailChange', () => {
    it('should update email in DB and invalidate ticket when OTP is valid', async () => {
      const ticket = 'valid-ticket-123';
      mockCacheStore.set(`email_change_ticket:${ticket}`, {
        userId: 1,
        oldEmail: 'john@example.com',
        newEmail: 'newjohn@example.com',
      });
      mockOtp.verifyOtp.mockResolvedValueOnce(true);
      mockRepo.findUserByEmail.mockResolvedValueOnce(null);
      mockRepo.updateUserEmail.mockResolvedValueOnce(undefined);

      const res = await service.confirmEmailChange(1, {
        ticket,
        new_email: 'newjohn@example.com',
        otp: '654321',
      });

      expect(res.email).toBe('newjohn@example.com');
      expect(mockRepo.updateUserEmail).toHaveBeenCalledWith(
        1,
        'newjohn@example.com',
      );
      expect(mockCache.del).toHaveBeenCalledWith(
        `email_change_ticket:${ticket}`,
      );
      expect(mockNotifications.send).toHaveBeenCalled();
    });
  });
});
