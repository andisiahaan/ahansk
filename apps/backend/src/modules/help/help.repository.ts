import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { Prisma } from '@prisma/client';

export interface HelpFilter {
  page?:        number;
  limit?:       number;
  isPublished?: boolean;
  categoryId?:  string;
  search?:      string;
}

@Injectable()
export class HelpRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Categories ────────────────────────────────────────────────────────────

  async findAllCategories(publishedOnly = false) {
    return this.prisma.helpCategory.findMany({
      where:   publishedOnly ? { is_published: true } : undefined,
      include: { articles: { where: { is_published: true }, select: { id: true } } },
      orderBy: { sort_order: 'asc' },
    });
  }

  async findCategoryBySlug(slug: string) {
    return this.prisma.helpCategory.findUnique({
      where:   { slug },
      include: { articles: { where: { is_published: true }, orderBy: { sort_order: 'asc' } } },
    });
  }

  async createCategory(data: Prisma.HelpCategoryCreateInput) {
    return this.prisma.helpCategory.create({ data });
  }

  async updateCategory(id: string, data: Prisma.HelpCategoryUpdateInput) {
    return this.prisma.helpCategory.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    return this.prisma.helpCategory.delete({ where: { id } });
  }

  // ─── Articles ──────────────────────────────────────────────────────────────

  async findAllArticles(filter: HelpFilter) {
    const page  = filter.page  ?? 1;
    const limit = filter.limit ?? 20;
    const skip  = (page - 1) * limit;
    const where: Prisma.HelpArticleWhereInput = {
      ...(filter.isPublished !== undefined && { is_published: filter.isPublished }),
      ...(filter.categoryId && { category_id: filter.categoryId }),
      ...(filter.search && { OR: [
        { title:   { contains: filter.search } },
        { content: { contains: filter.search } },
      ]}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.helpArticle.findMany({ where, skip, take: limit, orderBy: { sort_order: 'asc' }, include: { category: { select: { id: true, title: true, slug: true } } } }),
      this.prisma.helpArticle.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findArticleBySlug(slug: string) {
    return this.prisma.helpArticle.findUnique({ where: { slug }, include: { category: true } });
  }

  async findArticleById(id: string) {
    return this.prisma.helpArticle.findUnique({ where: { id }, include: { category: { select: { id: true, title: true, slug: true } } } });
  }

  async createArticle(data: Prisma.HelpArticleCreateInput) {
    return this.prisma.helpArticle.create({ data, include: { category: { select: { id: true, title: true } } } });
  }

  async updateArticle(id: string, data: Prisma.HelpArticleUpdateInput) {
    return this.prisma.helpArticle.update({ where: { id }, data, include: { category: { select: { id: true, title: true } } } });
  }

  async deleteArticle(id: string) {
    return this.prisma.helpArticle.delete({ where: { id } });
  }

  async voteHelpful(id: string, helpful: boolean) {
    return this.prisma.helpArticle.update({
      where: { id },
      data:  helpful ? { helpful_yes: { increment: 1 } } : { helpful_no: { increment: 1 } },
    });
  }
}
