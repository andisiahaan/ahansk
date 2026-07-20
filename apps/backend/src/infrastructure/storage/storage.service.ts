import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalDriver } from './drivers/local.driver';
import { S3Driver } from './drivers/s3.driver';
import type { DiskContext } from '../../config/filesystem';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface StorageDriver {
  upload(file: UploadedFile, context: DiskContext): Promise<string>;
  delete(filePath: string): Promise<void>;
}

@Injectable()
export class StorageService {
  private readonly driver: StorageDriver;

  constructor(
    private readonly config: ConfigService,
    private readonly localDriver: LocalDriver,
    private readonly s3Driver: S3Driver,
  ) {
    const disk = this.config.get<string>('app.storage.disk', 'local');
    this.driver = disk === 's3' ? this.s3Driver : this.localDriver;
  }

  async upload(file: UploadedFile, context: DiskContext): Promise<string> {
    return this.driver.upload(file, context);
  }

  async delete(filePath: string): Promise<void> {
    return this.driver.delete(filePath);
  }
}
