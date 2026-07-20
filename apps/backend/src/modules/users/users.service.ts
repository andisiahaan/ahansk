import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { UsersRepository } from './users.repository';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { messages } from '@ahansk/shared';
import type { CreateUserDto, UpdateUserDto, UpdateProfileDto } from '@ahansk/shared';
import type { UploadedFile } from '../../infrastructure/storage/storage.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly repo: UsersRepository,
    private readonly storage: StorageService,
  ) {}

  async findAll(page = 1, limit = 20) {
    return this.repo.findAll(page, limit);
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

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id);
    return this.repo.updateUser(id, dto);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
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
}
