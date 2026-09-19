import { Injectable, NotFoundException, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { UsersRepository } from './users.repository';
import { AuthRepository } from '../auth/auth.repository';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { messages } from '@ahansk/shared';
import type { CreateUserDto, UpdateUserDto, UpdateProfileDto, ChangePasswordDto } from '@ahansk/shared';
import { buildPaginationMeta } from '@ahansk/shared';
import type { UploadedFile } from '../../infrastructure/storage/storage.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly repo:     UsersRepository,
    private readonly authRepo: AuthRepository,
    private readonly storage:  StorageService,
  ) {}

  async findAll(page = 1, limit = 20) {
    const result = await this.repo.findAll(page, limit);
    return { items: result.data, meta: buildPaginationMeta(result.total, page, limit) };
  }

  async findById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException(messages.users.notFound);
    return user;
  }

  async create(dto: CreateUserDto) {
    const exists = await this.repo.findByEmail(dto.email);
    if (exists) throw new ConflictException(messages.auth.emailAlreadyExists);
    const password = dto.password ? await argon2.hash(dto.password) : undefined;
    return this.repo.createUser({ ...dto, password });
  }

  async update(id: string, dto: UpdateUserDto, currentAdminId?: string) {
    const user = await this.findById(id);
    if (dto.role && dto.role !== 'ADMIN' && user.role === 'ADMIN') {
      const adminCount = await this.repo.countAdmins();
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot demote the last remaining administrator.');
      }
    }
    const data: import('@prisma/client').Prisma.UserUpdateInput = { ...dto };
    if (data.password && typeof data.password === 'string') {
      data.password = await argon2.hash(data.password);
    }
    return this.repo.updateUser(id, data);
  }

  async delete(id: string, currentAdminId?: string): Promise<void> {
    if (currentAdminId && id === currentAdminId) {
      throw new BadRequestException('You cannot delete your own administrator account.');
    }
    const user = await this.findById(id);
    if (user.role === 'ADMIN') {
      const adminCount = await this.repo.countAdmins();
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot delete the last remaining administrator.');
      }
    }
    await this.repo.deleteById(id);
  }

  async updateProfile(id: string, dto: UpdateProfileDto, avatarFile?: UploadedFile) {
    await this.findById(id);
    let avatarPath: string | undefined;
    if (avatarFile) {
      avatarPath = await this.storage.upload(avatarFile, 'avatar');
    }
    return this.repo.updateUser(id, { ...dto, ...(avatarPath ? { avatar: avatarPath } : {}) });
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.authRepo.findUserById(id);
    if (!user) throw new NotFoundException(messages.users.notFound);
    if (!user.password) throw new BadRequestException('No password set. Use social login.');

    const valid = await argon2.verify(user.password, dto.currentPassword);
    if (!valid) throw new UnauthorizedException(messages.auth.invalidPassword);

    const newHash = await argon2.hash(dto.newPassword);
    await this.authRepo.updateUser(id, { password: newHash });
    return { message: 'Password updated successfully.' };
  }

  async getActiveSessions(userId: string) {
    await this.findById(userId);
    return this.repo.findActiveSessions(userId);
  }

  async revokeSession(userId: string, tokenId: string): Promise<void> {
    await this.findById(userId);
    await this.repo.revokeSession(tokenId);
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await this.findById(userId);
    await this.repo.revokeAllSessions(userId);
  }

  async getActivityLog(userId: string) {
    await this.findById(userId);
    return this.repo.findActivityByUser(userId);
  }
}
