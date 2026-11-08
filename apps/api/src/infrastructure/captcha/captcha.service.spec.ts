import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CaptchaService } from './captcha.service';

describe('CaptchaService', () => {
  let service: CaptchaService;
  let mockConfig: { get: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('when disabled', () => {
    beforeEach(() => {
      mockConfig = {
        get: jest.fn((key: string, defaultVal: unknown) => {
          if (key === 'app.captcha.provider') return '';
          if (key === 'app.captcha.secretKey') return '';
          return defaultVal;
        }),
      };
      service = new CaptchaService(mockConfig as unknown as ConfigService);
    });

    it('should have isEnabled = false', () => {
      expect(service.isEnabled).toBe(false);
      expect(service.activeProvider).toBeNull();
    });

    it('should bypass verification without calling fetch or throwing', async () => {
      await expect(service.verify(undefined)).resolves.toBeUndefined();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('when Turnstile is configured', () => {
    beforeEach(() => {
      mockConfig = {
        get: jest.fn((key: string, defaultVal: unknown) => {
          if (key === 'app.captcha.provider') return 'turnstile';
          if (key === 'app.captcha.secretKey') return 'turnstile-secret';
          return defaultVal;
        }),
      };
      service = new CaptchaService(mockConfig as unknown as ConfigService);
    });

    it('should have isEnabled = true and provider = turnstile', () => {
      expect(service.isEnabled).toBe(true);
      expect(service.activeProvider).toBe('turnstile');
    });

    it('should throw BadRequestException if token is missing', async () => {
      await expect(service.verify(undefined)).rejects.toThrow(BadRequestException);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should call Cloudflare Turnstile endpoint and pass when successful', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: true }),
      });

      await expect(service.verify('sample-token', '127.0.0.1')).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    it('should throw BadRequestException when Turnstile verification fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] }),
      });

      await expect(service.verify('invalid-token')).rejects.toThrow(BadRequestException);
    });
  });

  describe('when Google reCAPTCHA is configured', () => {
    beforeEach(() => {
      mockConfig = {
        get: jest.fn((key: string, defaultVal: unknown) => {
          if (key === 'app.captcha.provider') return 'google';
          if (key === 'app.captcha.secretKey') return 'google-secret';
          return defaultVal;
        }),
      };
      service = new CaptchaService(mockConfig as unknown as ConfigService);
    });

    it('should have isEnabled = true and provider = google', () => {
      expect(service.isEnabled).toBe(true);
      expect(service.activeProvider).toBe('google');
    });

    it('should call Google reCAPTCHA endpoint and pass when successful', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: true }),
      });

      await expect(service.verify('sample-token')).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://www.google.com/recaptcha/api/siteverify'),
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('should throw BadRequestException when Google verification fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: false }),
      });

      await expect(service.verify('invalid-token')).rejects.toThrow(BadRequestException);
    });
  });
});

