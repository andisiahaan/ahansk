import { Injectable, NotFoundException } from '@nestjs/common';
import { NewsRepository } from './news.repository';
import type { CreateNewsDto, UpdateNewsDto, ListNewsQueryDto } from './news.dto';

@Injectable()
export class NewsService {
  constructor(private readonly repo: NewsRepository) {}

  listPublished(q: ListNewsQueryDto)   { return this.repo.list(q, false); }
  listAll(q: ListNewsQueryDto)         { return this.repo.list(q, true); }

  async getBySlug(slug: string, admin = false) {
    const item = await this.repo.findBySlug(slug, !admin);
    if (!item) throw new NotFoundException('News item not found');
    return item;
  }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('News item not found');
    return item;
  }

  create(dto: CreateNewsDto, authorId: string) {
    return this.repo.create({ ...dto, author_id: authorId });
  }

  update(id: string, dto: UpdateNewsDto) {
    return this.repo.update(id, dto as Record<string, unknown>);
  }

  async delete(id: string) {
    await this.getById(id);
    return this.repo.delete(id);
  }
}
