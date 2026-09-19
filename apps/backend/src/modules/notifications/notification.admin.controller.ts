import {
  Controller, Get, Post, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { NotificationService } from './notification.service';
import { BroadcastNotificationDto } from './notification.dto';

@Roles('ADMIN')
@Controller('admin/notifications')
export class NotificationAdminController {
  constructor(private readonly svc: NotificationService) {}

  @Get()
  async list(
    @Query('page')  page?:  string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.getAllAdmin(Number(page) || 1, Number(limit) || 20);
  }

  @Post('broadcast')
  @HttpCode(HttpStatus.OK)
  async broadcast(@Body() dto: BroadcastNotificationDto) {
    if (dto.target === 'admins') {
      await this.svc.sendToAdmins(dto.type, dto.title, dto.message);
    } else if (dto.userIds?.length) {
      await this.svc.sendBroadcast(dto.type, dto.title, dto.message, dto.userIds);
    } else {
      await this.svc.sendToAllUsers(dto.type, dto.title, dto.message);
    }
    return { message: 'Broadcast queued' };
  }
}
