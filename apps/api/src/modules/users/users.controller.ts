import {
  Controller, Get, Patch,
  Body, UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StorageUploadInterceptor } from '../../infrastructure/storage/upload.interceptor';
import type { AuthUser } from '@ahansk/shared';
import { UpdateProfileDto, ChangePasswordDto } from './users.dto';
import type { UploadedFile as StorageFile } from '../../infrastructure/storage/storage.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── User self-service ────────────────────────────────────────────────────

  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @StorageUploadInterceptor('avatar')
  async updateMe(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() avatar?: Express.Multer.File & { buffer: Buffer },
  ) {
    const file = avatar ? (avatar as unknown as StorageFile) : undefined;
    return this.usersService.updateProfile(user.id, dto, file);
  }

  @Patch('me/password')
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.id, dto);
  }
}

