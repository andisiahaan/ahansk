import type { CustomTagsSettings } from './schemas';

// ─── App General Settings (DB key: "app") ─────────────────────────────────────

export interface AppGeneralSettings {
  name: string;
  tagline: string;
  description: string;
  meta_description: string;
  meta_keywords: string;
}

// ─── Auth Settings (DB key: "auth") ──────────────────────────────────────────

export interface AuthSettings {
  is_registration_enabled: boolean;
  is_email_verification_required: boolean;
  is_google_auth_enabled: boolean;
  is_google_auth_only: boolean;
  is_2fa_enabled: boolean;
  is_email_change_allowed: boolean;
  password_min_length: number;
  session_lifetime_days: number;
  max_login_attempts: number;
  lockout_duration_minutes: number;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_APP_SETTINGS: AppGeneralSettings = {
  name: 'My App',
  tagline: 'A production-ready starter kit',
  description: 'Built with NestJS + Next.js monorepo',
  meta_description: 'A production-ready full-stack starter kit',
  meta_keywords: 'nestjs, nextjs, monorepo',
};

export const DEFAULT_AUTH_SETTINGS: AuthSettings = {
  is_registration_enabled: true,
  is_email_verification_required: true,
  is_google_auth_enabled: true,
  is_google_auth_only: false,
  is_2fa_enabled: false,
  is_email_change_allowed: false,
  password_min_length: 8,
  session_lifetime_days: 7,
  max_login_attempts: 5,
  lockout_duration_minutes: 15,
};

export const DEFAULT_CUSTOM_TAGS_SETTINGS: CustomTagsSettings = {
  headTop: '',
  headBottom: '',
  bodyTop: '',
  bodyBottom: '',
};

// ─── Key Map ──────────────────────────────────────────────────────────────────

export const SETTING_KEYS = {
  APP: 'app',
  AUTH: 'auth',
  CUSTOM_TAGS: 'custom_tags',
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export type SettingValueMap = {
  app: AppGeneralSettings;
  auth: AuthSettings;
  custom_tags: CustomTagsSettings;
};
