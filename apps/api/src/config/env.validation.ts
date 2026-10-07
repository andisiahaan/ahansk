import { z } from 'zod';

const emptyToUndefined = (val: unknown) => (typeof val === 'string' && val.trim() === '' ? undefined : val);
const optionalUrl = () => z.preprocess(emptyToUndefined, z.string().url().optional());
const optionalString = () => z.preprocess(emptyToUndefined, z.string().optional());
const optionalEmail = () => z.preprocess(emptyToUndefined, z.string().email().optional());

export const envSchema = z.object({
  // ─── App ──────────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),

  // ─── Database ─────────────────────────────────────────────────────────────
  DATABASE_URL: z.string().url(),

  // ─── JWT ──────────────────────────────────────────────────────────────────
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().default(7),

  // ─── Redis ────────────────────────────────────────────────────────────────
  REDIS_URL: z.string().url(),

  // ─── Google (opsional — kosong = Google Login tidak tersedia) ──────────────
  GOOGLE_CLIENT_ID: z.string().default(''),

  // ─── reCAPTCHA (opsional — kosong = captcha dinonaktifkan) ───────────────
  RECAPTCHA_SECRET_KEY: z.string().default(''),

  // ─── CORS ─────────────────────────────────────────────────────────────────
  FRONTEND_URL: z.string().url(),
  ADMIN_URL: z.string().url(),

  // ─── Email (SMTP) ─────────────────────────────────────────────────────────
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  SMTP_FROM_NAME: z.string().min(1),
  SMTP_FROM_ADDRESS: z.string().email(),

  // ─── Web Push (VAPID) ────────────────────────────────────────────────────────
  VAPID_PUBLIC_KEY:    optionalString(),
  VAPID_PRIVATE_KEY:   optionalString(),
  VAPID_CONTACT_EMAIL: optionalEmail(),

  // ─── Storage ──────────────────────────────────────────────────────────────
  DISK: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_PATH: z.string().default('storage'),
  STORAGE_PUBLIC_URL: optionalUrl(),
  S3_ENDPOINT: optionalUrl(),
  S3_BUCKET: optionalString(),
  S3_REGION: optionalString(),
  S3_KEY: optionalString(),
  S3_SECRET: optionalString(),
  S3_ACCESS_KEY_ID: optionalString(),
  S3_SECRET_ACCESS_KEY: optionalString(),
  S3_PUBLIC_URL: optionalUrl(),
});

export type Env = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const formatted = result.error.format();
    throw new Error(`Environment validation failed:\n${JSON.stringify(formatted, null, 2)}`);
  }

  const env = result.data;
  if (env.DISK === 's3') {
    const key = env.S3_KEY || env.S3_ACCESS_KEY_ID;
    const secret = env.S3_SECRET || env.S3_SECRET_ACCESS_KEY;
    if (!env.S3_ENDPOINT || !env.S3_BUCKET || !env.S3_REGION || !key || !secret) {
      throw new Error('S3 configuration is incomplete. S3_ENDPOINT, S3_BUCKET, S3_REGION, and access key/secret are required when DISK=s3');
    }
  }

  return env;
}
