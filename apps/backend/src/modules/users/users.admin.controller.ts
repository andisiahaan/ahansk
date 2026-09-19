import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { BanService } from './ban.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@ahansk/shared';
import { CreateUserDto, UpdateUserDto, BanUserDto } from './users.dto';

@Roles('ADMIN')
@Controller('admin/users')
export class UsersAdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly banService: BanService,
  ) {}

  @Get()
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.usersService.findAll(Number(page) || 1, Number(limit) || 20);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() admin: AuthUser,
  ) {
    return this.usersService.update(id, dto, admin.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() admin: AuthUser,
  ): Promise<void> {
    await this.usersService.delete(id, admin.id);
  }

  @Post(':id/ban')
  async banUser(
    @Param('id') id: string,
    @Body() dto: BanUserDto,
    @CurrentUser() admin: AuthUser,
  ) {
    return this.banService.banUser(id, admin.id, dto);
  }

  @Post(':id/unban')
  async unbanUser(@Param('id') id: string, @CurrentUser() admin: AuthUser) {
    return this.banService.unbanUser(id, admin.id);
  }

  @Get(':id/sessions')
  async getSessions(@Param('id') id: string) {
    return this.usersService.getActiveSessions(id);
  }

  @Delete(':id/sessions')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeAllSessions(@Param('id') id: string): Promise<void> {
    await this.usersService.revokeAllSessions(id);
  }

  @Delete(':id/sessions/:tokenId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeSession(@Param('id') id: string, @Param('tokenId') tokenId: string): Promise<void> {
    await this.usersService.revokeSession(id, tokenId);
  }

  @Get(':id/activity')
  async getActivity(@Param('id') id: string) {
    return this.usersService.getActivityLog(id);
  }
}
