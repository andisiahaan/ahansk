import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvAdapter from '@keyv/redis';
import { LoggerModule } from 'nestjs-pino';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { StorageModule } from './infrastructure/storage/storage.module';
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
          paths: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password', 'req.body.token', 'req.body.refreshToken'],
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
      useFactory: () => ({
        connection: { url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' },
      }),
    }),
    BullModule.registerQueue({ name: QUEUE_EMAIL }),

    // ─── Cache (Redis, namespace: cache:*) ────────────────────────────────────
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        let redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        try {
          const urlObj = new URL(redisUrl);
          urlObj.pathname = '/1';
          redisUrl = urlObj.toString();
        } catch (e) {
          redisUrl = redisUrl.replace(/\/$/, '') + '/1';
        }
        return {
          store: new KeyvAdapter(redisUrl, { namespace: 'cache' }),
          ttl: 0,
        };
      },
    }),


    // ─── Infrastructure ───────────────────────────────────────────────────────────
    PrismaModule,
    StorageModule,
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
