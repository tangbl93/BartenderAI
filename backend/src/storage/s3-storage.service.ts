import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { extname } from 'path';
import { StorageResult, StorageService, StorageUpload } from './storage.interface';

/**
 * S3-compatible object storage driver (MinIO in dev, any S3 in prod).
 *
 * Credentials/endpoint/bucket are read ONLY from env:
 *   STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY, STORAGE_ENDPOINT,
 *   STORAGE_BUCKET, STORAGE_PUBLIC_BASE_URL
 */
@Injectable()
export class S3StorageService implements StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBase: string;

  constructor(config: ConfigService) {
    const endpoint = config.get<string>('storage.endpoint');
    const accessKey = config.get<string>('storage.accessKey');
    const secretKey = config.get<string>('storage.secretKey');
    this.bucket = config.get<string>('storage.bucket') || 'bartender';
    this.publicBase = (
      config.get<string>('storage.publicBaseUrl') || ''
    ).replace(/\/$/, '');

    this.client = new S3Client({
      endpoint,
      region: config.get<string>('storage.region') || 'us-east-1',
      forcePathStyle: true,
      credentials: accessKey
        ? { accessKeyId: accessKey, secretAccessKey: secretKey! }
        : undefined,
    });
  }

  async upload(upload: StorageUpload): Promise<StorageResult> {
    const key = this.buildKey(upload.filename);
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: upload.data,
          ContentType: upload.mimetype,
        }),
      );
    } catch (err) {
      if (err instanceof S3ServiceException) {
        this.logger.error(
          `S3 put failed: ${err.name} ${err.$metadata?.httpStatusCode} ${err.message}`,
        );
      }
      throw err;
    }
    return { url: `${this.publicBase}/${key}`, key };
  }

  private buildKey(filename: string): string {
    const ext = extname(filename).toLowerCase() || '.bin';
    const d = new Date();
    const month = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    const rand = Math.random().toString(36).slice(2, 14);
    return `uploads/${month}/${rand}${ext}`;
  }
}
