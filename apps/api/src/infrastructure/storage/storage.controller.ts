import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../common/decorators/public.decorator';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { LocalDriver } from './drivers/local.driver';
import { S3Driver } from './drivers/s3.driver';

@Controller('storage')
export class StorageController {
  constructor(
    private readonly config: ConfigService,
    private readonly localDriver: LocalDriver,
    private readonly s3Driver: S3Driver,
  ) {}

  @Get(':context/:filename')
  @Public()
  async serveFile(
    @Param('context') context: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    // Sanitize parameters to prevent path traversal
    const safeContext = path.basename(context);
    const safeFilename = path.basename(filename);
    const disk = this.config.get<string>('app.storage.disk', 'local');

    if (disk === 's3') {
      try {
        const file = await this.s3Driver.getObject(`${safeContext}/${safeFilename}`);
        if (file.contentType) res.setHeader('Content-Type', file.contentType);
        if (file.contentLength) res.setHeader('Content-Length', file.contentLength);
        file.stream.pipe(res);
        return;
      } catch {
        throw new NotFoundException('File not found');
      }
    }

    const filePath = path.join(this.localDriver.basePath, safeContext, safeFilename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    res.sendFile(filePath);
  }
}
