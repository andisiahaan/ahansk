import { z } from 'zod';
import { createZodDto } from '../../common/utils/zod.dto';
import { NOTIFICATION_TYPE_REGISTRY, type NotificationType } from '@ahansk/shared';

const notificationTypes = Object.keys(NOTIFICATION_TYPE_REGISTRY) as [NotificationType, ...NotificationType[]];

export const BroadcastNotificationSchema = z.object({
  type:    z.enum(notificationTypes),
  title:   z.string().min(1).max(255),
  message: z.string().min(1).max(1000),
  target:  z.enum(['all', 'admins']).default('all'),
  userIds: z.array(z.string().uuid()).optional(),
});

export class BroadcastNotificationDto extends createZodDto(BroadcastNotificationSchema) {}

export const PushSubscriptionSchema = z.object({
  endpoint:  z.string().url(),
  p256dh:    z.string().min(1),
  auth:      z.string().min(1),
  userAgent: z.string().optional(),
});

export class PushSubscriptionDto extends createZodDto(PushSubscriptionSchema) {}

export const NotificationPreferencesSchema = z.object({
  channels: z.record(z.string(), z.boolean()),
});

export class NotificationPreferencesDto extends createZodDto(NotificationPreferencesSchema) {}

export const PushUnsubscribeSchema = z.object({
  endpoint: z.string().url(),
});

export class PushUnsubscribeDto extends createZodDto(PushUnsubscribeSchema) {}

export const ListNotificationQuerySchema = z.object({
  page:     z.coerce.number().int().min(1).optional(),
  limit:    z.coerce.number().int().min(1).max(100).optional(),
  category: z.string().optional(),
  isRead:   z.preprocess((val) => {
    if (typeof val === 'string') {
      if (val.toLowerCase() === 'true') return true;
      if (val.toLowerCase() === 'false') return false;
    }
    return val;
  }, z.boolean().optional()),
});

export class ListNotificationQueryDto extends createZodDto(ListNotificationQuerySchema) {}
