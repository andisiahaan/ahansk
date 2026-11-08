import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvAdapter from '@keyv/redis';
import { LoggerModule } from 'nestjs-pino';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { CacheWrapperModule } from './infrastructure/cache/cache.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { CaptchaModule } from './infrastructure/captcha/captcha.module';
import { RecaptchaModule } from './infrastructure/recaptcha/recaptcha.module';
import { SettingsCacheModule } from './infrastructure/settings/settings-cache.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SettingsModule } from './modules/settings/settings.module';
import { NewsModule } from './modules/news/news.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { OtpModule } from './modules/otp/otp.module';
import { EmailProcessor } from './jobs/email.processor';
import { QUEUE_EMAIL } from '@ahansk/shared';

import { AppController } from './app.controller';
import { AppService } from './app.service';

function resolveRedisUrl(rawUrl: string, dbIndex: number): string {
  try {
    const parsed = new URL(rawUrl);
    parsed.pathname = `/${dbIndex}`;
    return parsed.toString();
  } catch {
    return `${rawUrl.replace(/\/.*$/, '')}/${dbIndex}`;
  }
}

@Module({
  imports: [
    // ─── Config ───────────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),

    // ─── Logger (Pino) ────────────────────────────────────────────────────────
    LoggerModule.forRoot({
      pinoHttp: {
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.body.password',
            'req.body.token',
            'req.body.refreshToken',
          ],
          censor: '[REDACTED]',
        },
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),

    // ─── Rate Limiting ────────────────────────────────────────────────────────
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),

    // ─── Queue (BullMQ + Redis) ───────────────────────────────────────────────
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const rawUrl =
          config.get<string>('app.redis.url') || 'redis://127.0.0.1:6379';
        const queueDb = config.get<number>('app.redis.queueDb') ?? 0;
        return {
          connection: { url: resolveRedisUrl(rawUrl, queueDb) },
        };
      },
    }),
    BullModule.registerQueue({ name: QUEUE_EMAIL }),

    // ─── Cache (Redis, namespace: cache:*) ────────────────────────────────────
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const rawUrl =
          config.get<string>('app.redis.url') || 'redis://localhost:6379';
        const cacheDb = config.get<number>('app.redis.cacheDb') ?? 1;
        return {
          store: new KeyvAdapter(resolveRedisUrl(rawUrl, cacheDb), {
            namespace: 'cache',
          }),
          ttl: 0,
        };
      },
    }),

    // ─── Infrastructure ───────────────────────────────────────────────────────────
    PrismaModule,
    CacheWrapperModule,
    StorageModule,
    CaptchaModule,
    RecaptchaModule,
    SettingsCacheModule,

    // ─── Feature Modules ──────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    SettingsModule,
    NewsModule,
    NotificationModule,
    OtpModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EmailProcessor,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
