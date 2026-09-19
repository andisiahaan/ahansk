import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as path from 'path';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import type { StorageDriver, UploadedFile } from '../storage.service';
import type { UploadContext } from '../../../config/filesystem';
import { UPLOAD_CONFIGS } from '../../../config/filesystem';

@Injectable()
export class S3Driver implements StorageDriver {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('app.storage.s3.bucket', '');
    this.client = new S3Client({
      endpoint:  this.config.get<string>('app.storage.s3.endpoint'),
      region:    this.config.get<string>('app.storage.s3.region', 'auto'),
      credentials: {
        accessKeyId:     this.config.get<string>('app.storage.s3.key', ''),
        secretAccessKey: this.config.get<string>('app.storage.s3.secret', ''),
      },
      forcePathStyle: true,
    });
  }

  async upload(file: UploadedFile, context: UploadContext): Promise<string> {
    const { prefix } = UPLOAD_CONFIGS[context];
    const ext        = path.extname(file.originalname).toLowerCase();
    const key        = `${prefix}/${crypto.randomBytes(16).toString('hex')}${ext}`;

    await this.client.send(new PutObjectCommand({
      Bucket:      this.bucket,
      Key:         key,
      Body:        file.buffer,
      ContentType: file.mimetype,
    }));

    return key;
  }

  async delete(filePath: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: filePath }));
  }

  async getObject(key: string): Promise<{ stream: Readable; contentType?: string; contentLength?: number }> {
    const response = await this.client.send(new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
    return {
      stream: response.Body as unknown as Readable,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
    };
  }
}
