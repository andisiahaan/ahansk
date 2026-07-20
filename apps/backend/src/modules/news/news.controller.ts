import { Controller, Get, Param, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { Public } from '../../common/decorators/public.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ListNewsQuerySchema } from './news.dto';
import type { ListNewsQueryDto } from './news.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly svc: NewsService) {}

  @Get()
  @Public()
  list(@Query(new ZodValidationPipe(ListNewsQuerySchema)) q: ListNewsQueryDto) {
    return this.svc.listPublished(q);
  }

  @Get(':slug')
  @Public()
  getBySlug(@Param('slug') slug: string) {
    return this.svc.getBySlug(slug);
  }
}
