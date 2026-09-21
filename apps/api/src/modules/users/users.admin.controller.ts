import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, HttpCode, HttpStatus, ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { BanService } from './ban.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '@ahansk/shared';
import { CreateUserDto, UpdateUserDto, BanUserDto, UserQueryDto } from './users.dto';

@Roles('ADMIN')
@Controller('admin/users')
export class UsersAdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly banService: BanService,
  ) {}

  @Get()
  async findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @CurrentUser() admin: AuthUser,
  ) {
    return this.usersService.update(id, dto, admin.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() admin: AuthUser,
  ): Promise<void> {
    await this.usersService.delete(id, admin.id);
  }

  @Post(':id/ban')
  async banUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BanUserDto,
    @CurrentUser() admin: AuthUser,
  ) {
    return this.banService.banUser(id, admin.id, dto);
  }

  @Post(':id/unban')
  async unbanUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() admin: AuthUser,
  ) {
    return this.banService.unbanUser(id, admin.id);
  }

  @Get(':id/sessions')
  async getSessions(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getActiveSessions(id);
  }

  @Delete(':id/sessions')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeAllSessions(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usersService.revokeAllSessions(id);
  }

  @Delete(':id/sessions/:tokenId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeSession(
    @Param('id', ParseIntPipe) id: number,
    @Param('tokenId', ParseIntPipe) tokenId: number,
  ): Promise<void> {
    await this.usersService.revokeSession(id, tokenId);
  }

  @Get(':id/activity')
  async getActivity(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getActivityLog(id);
  }
}
