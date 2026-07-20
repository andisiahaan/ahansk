import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { HelpService } from './help.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  CreateHelpCategorySchema, UpdateHelpCategorySchema,
  CreateHelpArticleSchema, UpdateHelpArticleSchema,
} from '@ahansk/shared';
import type {
  CreateHelpCategoryDto, UpdateHelpCategoryDto,
  CreateHelpArticleDto, UpdateHelpArticleDto,
} from '@ahansk/shared';

@Roles('ADMIN')
@Controller('admin/help')
export class HelpAdminController {
  constructor(private readonly service: HelpService) {}

  // ─── Categories ────────────────────────────────────────────────────────────

  @Get('categories')
  async listCategories() {
    return this.service.adminListCategories();
  }

  @Post('categories')
  async createCategory(@Body(new ZodValidationPipe(CreateHelpCategorySchema)) dto: CreateHelpCategoryDto) {
    return this.service.createCategory(dto);
  }

  @Patch('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateHelpCategorySchema)) dto: UpdateHelpCategoryDto,
  ) {
    return this.service.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Param('id') id: string): Promise<void> {
    await this.service.deleteCategory(id);
  }

  // ─── Articles ──────────────────────────────────────────────────────────────

  @Get('articles')
  async listArticles(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('category_id') categoryId?: string,
  ) {
    return this.service.adminListArticles(Number(page), Number(limit), categoryId);
  }

  @Get('articles/:id')
  async getArticle(@Param('id') id: string) {
    return this.service.adminGetArticle(id);
  }

  @Post('articles')
  async createArticle(@Body(new ZodValidationPipe(CreateHelpArticleSchema)) dto: CreateHelpArticleDto) {
    return this.service.createArticle(dto);
  }

  @Patch('articles/:id')
  async updateArticle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateHelpArticleSchema)) dto: UpdateHelpArticleDto,
  ) {
    return this.service.updateArticle(id, dto);
  }

  @Delete('articles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteArticle(@Param('id') id: string): Promise<void> {
    await this.service.deleteArticle(id);
  }
}
