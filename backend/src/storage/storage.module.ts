import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';
import { STORAGE_SERVICE } from './storage.interface';

const logger = new Logger('StorageModule');

// Driver switch: local (default, zero-infra) vs s3-compatible (MinIO/S3).
export const storageProvider = {
  provide: STORAGE_SERVICE,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const driver = config.get<string>('storage.driver') || 'local';
    if (driver === 's3-compatible') {
      logger.log('Using S3StorageService (STORAGE_DRIVER=s3-compatible).');
      return new S3StorageService(config);
    }
    logger.log('Using LocalStorageService (STORAGE_DRIVER=local).');
    return new LocalStorageService(config);
  },
};

@Module({
  providers: [storageProvider, LocalStorageService, S3StorageService],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
