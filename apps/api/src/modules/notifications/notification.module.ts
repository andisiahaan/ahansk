import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { NotificationRepository } from './notification.repository';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationAdminController } from './notification.admin.controller';
import { NotificationEmailProcessor } from './channels/notification-email.processor';
import { NotificationPushProcessor } from './channels/notification-push.processor';
import { NotificationBroadcastProcessor } from './channels/notification-broadcast.processor';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue(
      { name: 'notification-email' },
      { name: 'notification-push' },
      { name: 'notification-broadcast' },
    ),
  ],
  providers: [
    NotificationRepository,
    NotificationService,
    NotificationEmailProcessor,
    NotificationPushProcessor,
    NotificationBroadcastProcessor,
  ],
  controllers: [NotificationController, NotificationAdminController],
  exports: [NotificationService],
})
export class NotificationModule {}
