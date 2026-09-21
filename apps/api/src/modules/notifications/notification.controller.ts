import {
  Controller, Get, Patch, Delete, Post, Body, Param, Query, HttpCode, HttpStatus, ParseIntPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@ahansk/shared';
import {
  PushSubscriptionDto,
  NotificationPreferencesDto,
  PushUnsubscribeDto,
  ListNotificationQueryDto,
} from './notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly svc: NotificationService) {}

  @Get()
  async list(
    @CurrentUser() user: AuthUser,
    @Query() query: ListNotificationQueryDto,
  ) {
    const filter = {
      page:     query.page  || 1,
      limit:    query.limit || 20,
      category: query.category,
      isRead:   query.isRead,
    };
    return this.svc.getForUser(user.id, filter);
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: AuthUser) {
    return { count: await this.svc.getUnreadCount(user.id) };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markRead(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    await this.svc.markRead(id, user.id);
    return { message: 'Marked as read' };
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllRead(@CurrentUser() user: AuthUser) {
    await this.svc.markAllRead(user.id);
    return { message: 'All marked as read' };
  }

  @Get('preferences')
  async getPreferences(@CurrentUser() user: AuthUser) {
    return this.svc.getPreferences(user.id);
  }

  @Patch('preferences')
  @HttpCode(HttpStatus.OK)
  async savePreferences(
    @CurrentUser() user: AuthUser,
    @Body() dto: NotificationPreferencesDto,
  ) {
    await this.svc.savePreferences(user.id, dto as unknown as import('@ahansk/shared').NotificationPreferences);
    return { message: 'Preferences saved' };
  }

  @Post('push/subscribe')
  @HttpCode(HttpStatus.OK)
  async subscribe(
    @CurrentUser() user: AuthUser,
    @Body() dto: PushSubscriptionDto,
  ) {
    await this.svc.subscribePush(user.id, dto);
    return { message: 'Subscribed' };
  }

  @Get('push/subscriptions')
  async listSubscriptions(@CurrentUser() user: AuthUser) {
    return this.svc.getPushSubscriptions(user.id);
  }

  @Delete('push/subscriptions/:id')
  @HttpCode(HttpStatus.OK)
  async deleteSubscription(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    await this.svc.deletePushSubscriptionById(user.id, id);
    return { message: 'Unsubscribed' };
  }

  @Delete('push/unsubscribe')
  @HttpCode(HttpStatus.OK)
  async unsubscribe(
    @CurrentUser() user: AuthUser,
    @Body() body: PushUnsubscribeDto,
  ) {
    await this.svc.unsubscribePush(user.id, body.endpoint);
    return { message: 'Unsubscribed' };
  }
}
