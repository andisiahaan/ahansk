import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import type { StorageDriver, UploadedFile } from '../storage.service';
import type { DiskContext } from '../../../config/filesystem';
import { DISK_CONFIGS } from '../../../config/filesystem';

@Injectable()
export class LocalDriver implements StorageDriver {
  constructor(private readonly config: ConfigService) {}

  private get basePath(): string {
    return this.config.get<string>('app.storage.localPath', './uploads');
  }

  async upload(file: UploadedFile, context: DiskContext): Promise<string> {
    const diskConfig = DISK_CONFIGS[context];
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${crypto.randomUUID()}${ext}`;
    const dir = path.join(this.basePath, diskConfig.prefix);

    await fs.mkdir(dir, { recursive: true });
    const fullPath = path.join(dir, filename);
    await fs.writeFile(fullPath, file.buffer);

    return `${diskConfig.prefix}/${filename}`;
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.basePath, filePath);
    await fs.rm(fullPath, { force: true });
  }
}
