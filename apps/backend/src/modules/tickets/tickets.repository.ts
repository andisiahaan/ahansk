import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { ListTicketsQueryDto } from './tickets.dto';

const TICKET_INCLUDE = {
  user:     { select: { id: true, name: true, email: true } },
  assignee: { select: { id: true, name: true } },
  replies:  { include: { user: { select: { id: true, name: true, role: true } } }, orderBy: { created_at: 'asc' as const } },
};

@Injectable()
export class TicketsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listAll(q: ListTicketsQueryDto) {
    const skip  = (q.page - 1) * q.limit;
    const where: Record<string, unknown> = {};
    if (q.status)   where['status']   = q.status;
    if (q.priority) where['priority'] = q.priority;
    if (q.category) where['category'] = q.category;
    if (q.search)   where['OR'] = [{ subject: { contains: q.search } }, { description: { contains: q.search } }];

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where, skip, take: q.limit, orderBy: { created_at: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } }, assignee: { select: { id: true, name: true } }, _count: { select: { replies: true } } },
      }),
      this.prisma.ticket.count({ where }),
    ]);
    return { tickets, pagination: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) } };
  }

  listForUser(userId: string, page: number, limit: number) {
    return this.prisma.ticket.findMany({
      where: { user_id: userId },
      skip: (page - 1) * limit, take: limit,
      orderBy: { created_at: 'desc' },
      select: { id: true, ticket_number: true, subject: true, status: true, priority: true, created_at: true, _count: { select: { replies: true } } },
    });
  }

  findById(id: string) {
    return this.prisma.ticket.findUnique({ where: { id }, include: TICKET_INCLUDE });
  }

  create(data: Record<string, unknown>) {
    return this.prisma.ticket.create({ data: data as never, include: TICKET_INCLUDE });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.ticket.update({ where: { id }, data: data as never, include: TICKET_INCLUDE });
  }

  delete(id: string) { return this.prisma.ticket.delete({ where: { id } }); }

  createReply(data: Record<string, unknown>) {
    return this.prisma.ticketReply.create({ data: data as never, include: { user: { select: { id: true, name: true, role: true } } } });
  }
}
