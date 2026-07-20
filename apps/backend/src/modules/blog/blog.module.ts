import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { BlogController } from './blog.controller';
import { BlogV1Controller } from './blog.v1.controller';
import { BlogAdminController } from './blog.admin.controller';
import { BlogService } from './blog.service';
import { BlogRepository } from './blog.repository';
import { DISK_CONFIGS } from '../../config/filesystem';

@Module({
  imports: [
    MulterModule.register({
      storage: undefined,
      limits: { fileSize: DISK_CONFIGS.blog_cover.maxSizeBytes },
      fileFilter: (_req, file, cb) => {
        cb(null, (DISK_CONFIGS.blog_cover.allowedMimeTypes as readonly string[]).includes(file.mimetype));
      },
    }),
  ],
  controllers: [BlogController, BlogV1Controller, BlogAdminController],
  providers:   [BlogService, BlogRepository],
})
export class BlogModule {}
