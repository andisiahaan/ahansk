import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalDriver } from './drivers/local.driver';
import { S3Driver } from './drivers/s3.driver';
import { UPLOAD_CONFIGS, DEFAULT_DISK } from '../../config/filesystem';
import type { UploadContext } from '../../config/filesystem';
import type { DiskDriver } from '../../config/filesystem';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface UploadOptions {
  disk?: DiskDriver;
}

export interface StorageDriver {
  upload(file: UploadedFile, context: UploadContext): Promise<string>;
  delete(filePath: string): Promise<void>;
}

@Injectable()
export class StorageService {
  constructor(
    private readonly config: ConfigService,
    private readonly localDriver: LocalDriver,
    private readonly s3Driver: S3Driver,
  ) {}

  get defaultDisk(): DiskDriver {
    return DEFAULT_DISK;
  }

  /**
   * Resolusi pilihan disk berdasarkan prioritas:
   * 1. diskOverride dari pemanggil fungsi
   * 2. UPLOAD_CONFIGS[context].disk jika diset (override per-context)
   * 3. DEFAULT_DISK dari .env (global default)
   */
  resolveDisk(context: UploadContext, diskOverride?: DiskDriver): DiskDriver {
    if (diskOverride) return diskOverride;
    const contextDisk = (UPLOAD_CONFIGS[context] as { disk?: DiskDriver }).disk;
    if (contextDisk) return contextDisk;
    return DEFAULT_DISK;
  }

  private resolveDriver(context: UploadContext, diskOverride?: DiskDriver): StorageDriver {
    const disk = this.resolveDisk(context, diskOverride);
    return disk === 's3' ? this.s3Driver : this.localDriver;
  }

  /**
   * Upload file ke storage (local atau s3) secara terpusat.
   * Mengembalikan path relatif untuk disimpan ke DB (misal: "avatars/abc12345.webp").
   */
  async upload(file: UploadedFile, context: UploadContext, options?: UploadOptions): Promise<string> {
    return this.resolveDriver(context, options?.disk).upload(file, context);
  }

  /**
   * Menghasilkan Public URL lengkap untuk file yang diunggah.
   * Jika filePath sudah berupa absolute URL (e.g. Google avatar), dikembalikan apa adanya.
   */
  getUrl(filePath: string, diskOverride?: DiskDriver): string {
    if (!filePath) return '';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    const disk = diskOverride ?? DEFAULT_DISK;
    const cleanPath = filePath.replace(/^\/+/, '');

    if (disk === 's3') {
      const s3PublicUrl = this.config.get<string>('app.storage.s3.publicUrl');
      if (s3PublicUrl) {
        return `${s3PublicUrl.replace(/\/+$/, '')}/${cleanPath}`;
      }
      const endpoint = this.config.get<string>('app.storage.s3.endpoint', '');
      const bucket = this.config.get<string>('app.storage.s3.bucket', '');
      return `${endpoint.replace(/\/+$/, '')}/${bucket}/${cleanPath}`;
    }

    const localPublicUrl = this.config.get<string>(
      'app.storage.local.publicUrl',
      'http://ahansk.test/storage',
    );
    return `${localPublicUrl.replace(/\/+$/, '')}/${cleanPath}`;
  }

  /**
   * Hapus file dari storage.
   */
  async delete(filePath: string, diskOverride?: DiskDriver): Promise<void> {
    if (diskOverride === 's3') {
      await this.s3Driver.delete(filePath);
      return;
    }
    if (diskOverride === 'local') {
      await this.localDriver.delete(filePath);
      return;
    }
    // Jika tidak spesifik, hapus di local lalu fallback s3
    await this.localDriver.delete(filePath).catch(() => this.s3Driver.delete(filePath));
  }
}
