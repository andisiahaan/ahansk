export type CaptchaProvider = 'google' | 'turnstile';

export interface CaptchaVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}
