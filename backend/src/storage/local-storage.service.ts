import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import { extname } from 'path';
import { StorageResult, StorageService, StorageUpload } from './storage.interface';

/**
 * Local filesystem storage driver (dev default, zero-infra).
 *
 * Writes files under backend/uploads/ and returns a URL rooted at
 * STORAGE_PUBLIC_BASE_URL (default '/uploads'). A static route serves that
 * directory — see StorageModule.
 */
@Injectable()
export class LocalStorageService implements StorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadDir: string;
  private readonly publicBase: string;

  constructor(private readonly config: ConfigService) {
    this.uploadDir =
      this.config.get<string>('storage.uploadDir') ||
      // Absolute path resolved lazily so tests/CI don't need a specific cwd.
      `${process.cwd()}/uploads`;
    this.publicBase = (
      this.config.get<string>('storage.publicBaseUrl') || '/uploads'
    ).replace(/\/$/, '');
  }

  async upload(upload: StorageUpload): Promise<StorageResult> {
    // Dynamic import keeps fs out of unit-test cold paths and avoids a hard
    // runtime dep at module load time.
    const fs = await import('fs/promises');
    const path = await import('path');
    const key = this.buildKey(upload.filename);
    const fullPath = `${this.uploadDir}/${key}`;
    // Create the full directory tree (including the month subfolder).
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, upload.data);
    this.logger.log(`Stored ${upload.filename} -> ${fullPath}`);
    return { url: `${this.publicBase}/${key}`, key };
  }

  private buildKey(filename: string): string {
    const ext = extname(filename).toLowerCase() || '.bin';
    const hash = createHash('sha1')
      .update(`${randomUUID()}-${filename}-${Date.now()}`)
      .digest('hex')
      .slice(0, 16);
    // Year-month subdirs keep the uploads dir from growing flat.
    const d = new Date();
    const month = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    return `${month}/${hash}${ext}`;
  }
}
