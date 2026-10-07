import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StorageService, UploadedFile } from './storage.service';
import { LocalDriver } from './drivers/local.driver';
import { S3Driver } from './drivers/s3.driver';

describe('StorageService', () => {
  let service: StorageService;
  let mockLocalDriver: { upload: jest.Mock; delete: jest.Mock };
  let mockS3Driver: { upload: jest.Mock; delete: jest.Mock };
  let mockConfigService: { get: jest.Mock };

  const dummyFile: UploadedFile = {
    fieldname: 'avatar',
    originalname: 'test.png',
    mimetype: 'image/png',
    buffer: Buffer.from('test'),
    size: 4,
  };

  beforeEach(async () => {
    mockLocalDriver = {
      upload: jest.fn().mockResolvedValue('avatars/local-file.png'),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    mockS3Driver = {
      upload: jest.fn().mockResolvedValue('avatars/s3-file.png'),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    mockConfigService = {
      get: jest.fn((key: string, defaultVal?: unknown) => {
        if (key === 'app.storage.local.publicUrl') return 'http://ahansk.test/storage';
        if (key === 'app.storage.s3.publicUrl') return 'https://s3.mycdn.com';
        if (key === 'app.storage.s3.endpoint') return 'https://s3.endpoint.com';
        if (key === 'app.storage.s3.bucket') return 'my-bucket';
        return defaultVal;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: LocalDriver, useValue: mockLocalDriver },
        { provide: S3Driver, useValue: mockS3Driver },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload', () => {
    it('should use default disk (local) when no override is given', async () => {
      const result = await service.upload(dummyFile, 'avatar');
      expect(result).toBe('avatars/local-file.png');
      expect(mockLocalDriver.upload).toHaveBeenCalledWith(dummyFile, 'avatar');
      expect(mockS3Driver.upload).not.toHaveBeenCalled();
    });

    it('should use s3 driver when disk override is s3', async () => {
      const result = await service.upload(dummyFile, 'avatar', { disk: 's3' });
      expect(result).toBe('avatars/s3-file.png');
      expect(mockS3Driver.upload).toHaveBeenCalledWith(dummyFile, 'avatar');
      expect(mockLocalDriver.upload).not.toHaveBeenCalled();
    });
  });

  describe('getUrl', () => {
    it('should return full URL for local file', () => {
      const url = service.getUrl('avatars/avatar.png', 'local');
      expect(url).toBe('http://ahansk.test/storage/avatars/avatar.png');
    });

    it('should return full URL for s3 file using publicUrl', () => {
      const url = service.getUrl('avatars/avatar.png', 's3');
      expect(url).toBe('https://s3.mycdn.com/avatars/avatar.png');
    });

    it('should return unchanged external URLs', () => {
      const googleAvatar = 'https://lh3.googleusercontent.com/a/test';
      expect(service.getUrl(googleAvatar)).toBe(googleAvatar);
    });

    it('should return empty string for empty input', () => {
      expect(service.getUrl('')).toBe('');
    });
  });

  describe('delete', () => {
    it('should delete from specific disk when override is provided', async () => {
      await service.delete('avatars/test.png', 's3');
      expect(mockS3Driver.delete).toHaveBeenCalledWith('avatars/test.png');
      expect(mockLocalDriver.delete).not.toHaveBeenCalled();
    });
  });
});
