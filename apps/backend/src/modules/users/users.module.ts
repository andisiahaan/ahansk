import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { BanService } from './ban.service';
import { BanRepository } from './ban.repository';
import { DISK_CONFIGS } from '../../config/filesystem';

@Module({
  imports: [
    MulterModule.register({
      storage: undefined, // use memory storage — StorageService handles persistence
      limits: { fileSize: DISK_CONFIGS.avatar.maxSizeBytes },
      fileFilter: (_req, file, cb) => {
        const allowed = DISK_CONFIGS.avatar.allowedMimeTypes as readonly string[];
        cb(null, allowed.includes(file.mimetype));
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, BanService, BanRepository],
  exports: [BanService],
})
export class UsersModule {}
