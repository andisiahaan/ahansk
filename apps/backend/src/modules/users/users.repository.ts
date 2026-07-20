import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { User, Prisma } from '@prisma/client';

type UserSelect = Omit<User, 'password' | 'totp_secret'>;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number, limit: number): Promise<{ data: UserSelect[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ skip, take: limit, omit: { password: true, totp_secret: true }, orderBy: { created_at: 'desc' } }),
      this.prisma.user.count(),
    ]);
    return { data, total };
  }

  async findById(id: string): Promise<UserSelect | null> {
    return this.prisma.user.findUnique({ 
      where: { id }, 
      omit: { password: true, totp_secret: true },
      include: { bans: { orderBy: { created_at: 'desc' } } } 
    });
  }

  async findByEmail(email: string): Promise<UserSelect | null> {
    return this.prisma.user.findUnique({ where: { email }, omit: { password: true, totp_secret: true } });
  }

  async createUser(data: { email: string; password?: string; name: string; role?: 'ADMIN' | 'USER' }): Promise<UserSelect> {
    return this.prisma.user.create({ data, omit: { password: true, totp_secret: true } });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<UserSelect> {
    return this.prisma.user.update({ where: { id }, data, omit: { password: true, totp_secret: true } });
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
