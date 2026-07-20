import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { NewsService } from './news.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateNewsSchema, UpdateNewsSchema, ListNewsQuerySchema } from './news.dto';
import type { CreateNewsDto, UpdateNewsDto, ListNewsQueryDto } from './news.dto';
import type { AuthUser } from '@ahansk/shared';

@Controller('admin/news')
@Roles('ADMIN')
export class NewsAdminController {
  constructor(private readonly svc: NewsService) {}

  @Get()
  list(@Query(new ZodValidationPipe(ListNewsQuerySchema)) q: ListNewsQueryDto) {
    return this.svc.listAll(q);
  }

  @Get(':id')
  getById(@Param('id') id: string) { return this.svc.getById(id); }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateNewsSchema)) dto: CreateNewsDto,
  ) {
    return this.svc.create(dto, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateNewsSchema)) dto: UpdateNewsDto,
  ) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.svc.delete(id);
  }
}
