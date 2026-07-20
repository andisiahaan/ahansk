import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class PatRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUser(userId: string) {
    return this.prisma.personalAccessToken.findMany({
      where: { user_id: userId, revoked_at: null },
      orderBy: { created_at: 'desc' },
      select: {
        id: true, name: true, token_prefix: true,
        last_used_at: true, expires_at: true, created_at: true,
      },
    });
  }

  findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return Promise.all([
      this.prisma.personalAccessToken.findMany({
        skip, take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true, name: true, token_prefix: true, revoked_at: true,
          last_used_at: true, expires_at: true, created_at: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.personalAccessToken.count(),
    ]);
  }

  findByHash(tokenHash: string) {
    return this.prisma.personalAccessToken.findUnique({ where: { token_hash: tokenHash } });
  }

  create(data: { user_id: string; name: string; token_hash: string; token_prefix: string; expires_at?: Date | null }) {
    return this.prisma.personalAccessToken.create({ data });
  }

  revoke(id: string) {
    return this.prisma.personalAccessToken.update({
      where: { id },
      data: { revoked_at: new Date() },
    });
  }

  touchLastUsed(id: string) {
    return this.prisma.personalAccessToken.update({
      where: { id },
      data: { last_used_at: new Date() },
    }).catch(() => {});
  }
}
