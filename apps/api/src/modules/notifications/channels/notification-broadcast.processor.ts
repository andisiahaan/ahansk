import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { NotificationService } from '../notification.service';
import { NotificationRepository } from '../notification.repository';
import type { NotificationType } from '@ahansk/shared';

export interface BroadcastAllJobData {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface BroadcastUsersJobData extends BroadcastAllJobData {
  userIds: number[];
}

@Processor('notification-broadcast')
export class NotificationBroadcastProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationBroadcastProcessor.name);

  constructor(
    private readonly repo: NotificationRepository,
    private readonly notificationService: NotificationService,
  ) {
    super();
  }

  async process(
    job: Job<BroadcastAllJobData | BroadcastUsersJobData>,
  ): Promise<void> {
    if (job.name === 'broadcast-all') {
      const { type, title, message, data } = job.data;
      const userIds = await this.repo.getAllActiveUserIds();
      this.logger.log(`Processing broadcast-all for ${userIds.length} users`);
      for (const userId of userIds) {
        await this.notificationService.send({
          type,
          userId,
          title,
          message,
          data,
        });
      }
    } else if (job.name === 'broadcast-users') {
      const { type, title, message, userIds, data } =
        job.data as BroadcastUsersJobData;
      this.logger.log(`Processing broadcast-users for ${userIds.length} users`);
      for (const userId of userIds) {
        await this.notificationService.send({
          type,
          userId,
          title,
          message,
          data,
        });
      }
    }
  }
}
