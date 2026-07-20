// ─── Logo & Favicon ──────────────────────────────────────────────────────────
export const LOGO_PATH = '/logo.png';
export const FAVICON_PATH = '/favicon.png';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCK_DURATION_MINUTES = 15;
export const TOTP_RECOVERY_CODE_COUNT = 10;
export const ACCESS_TOKEN_EXPIRES = '15m';
export const REFRESH_TOKEN_EXPIRES_DAYS = 7;

// ─── Cache ────────────────────────────────────────────────────────────────────
export const CACHE_KEY_SETTINGS = (key: string) => `settings:${key}`;

// ─── Queue ────────────────────────────────────────────────────────────────────
export const QUEUE_EMAIL = 'email';

// ─── Upload ───────────────────────────────────────────────────────────────────
export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
