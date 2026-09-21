import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { User, Prisma } from '@prisma/client';

type UserSelect = Omit<User, 'password' | 'totp_secret'>;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: import('./users.dto').UserQueryDto): Promise<{ data: UserSelect[]; total: number }> {
    const { page, limit, search, role, isActiveStr, sortBy, order } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { username: { contains: search } },
      ];
    }
    if (role) where.role = role;
    if (isActiveStr !== undefined) {
      where.is_active = isActiveStr === 'true';
    }

    const orderBy: Prisma.UserOrderByWithRelationInput = { [sortBy]: order };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ skip, take: limit, where, omit: { password: true, totp_secret: true }, orderBy }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total };
  }

  async countAdmins(): Promise<number> {
    return this.prisma.user.count({ where: { role: 'ADMIN', is_active: true } });
  }

  async findById(id: number | bigint): Promise<UserSelect | null> {
    return this.prisma.user.findUnique({ 
      where: { id: BigInt(id) }, 
      omit: { password: true, totp_secret: true },
      include: { bans: { orderBy: { created_at: 'desc' } } } 
    });
  }

  async findActiveById(id: number | bigint): Promise<(UserSelect & { bans: { id: bigint; expires_at: Date | null; unbanned_at: Date | null }[] }) | null> {
    return this.prisma.user.findUnique({
      where: { id: BigInt(id), is_active: true },
      omit: { password: true, totp_secret: true },
      include: {
        bans: {
          where: {
            unbanned_at: null,
            OR: [
              { expires_at: null },
              { expires_at: { gt: new Date() } },
            ],
          },
        },
      },
    });
  }

  async findByEmail(email: string): Promise<UserSelect | null> {
    return this.prisma.user.findUnique({ where: { email }, omit: { password: true, totp_secret: true } });
  }

  async createUser(data: { email: string; password?: string; name: string; role?: 'ADMIN' | 'USER' }): Promise<UserSelect> {
    return this.prisma.user.create({ data, omit: { password: true, totp_secret: true } });
  }

  async updateUser(id: number | bigint, data: Prisma.UserUpdateInput): Promise<UserSelect> {
    return this.prisma.user.update({ where: { id: BigInt(id) }, data, omit: { password: true, totp_secret: true } });
  }

  async deleteById(id: number | bigint): Promise<void> {
    await this.prisma.user.delete({ where: { id: BigInt(id) } });
  }

  findActiveSessions(userId: number | bigint) {
    return this.prisma.refreshToken.findMany({
      where: { user_id: BigInt(userId), revoked_at: null },
      orderBy: { created_at: 'desc' },
      select: { id: true, user_agent: true, ip_address: true, created_at: true, expires_at: true },
    });
  }

  async revokeSession(tokenId: number | bigint): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id: BigInt(tokenId) },
      data: { revoked_at: new Date() },
    });
  }

  async revokeAllSessions(userId: number | bigint): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { user_id: BigInt(userId), revoked_at: null },
      data: { revoked_at: new Date() },
    });
  }

  findActivityByUser(userId: number | bigint, limit = 20) {
    return this.prisma.userActivity.findMany({
      where: { user_id: BigInt(userId) },
      orderBy: { created_at: 'desc' },
      take: limit,
      select: { id: true, type: true, ip_address: true, user_agent: true, created_at: true, success: true },
    });
  }
}
