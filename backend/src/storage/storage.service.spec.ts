import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  const tmpDir = join(tmpdir(), `hba-storage-${process.pid}-${Date.now()}`);

  function makeService(publicBase = '/uploads') {
    const config = {
      get: (key: string) =>
        key === 'storage.uploadDir'
          ? tmpDir
          : key === 'storage.publicBaseUrl'
            ? publicBase
            : undefined,
    } as ConfigService;
    return new LocalStorageService(config);
  }

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes the file and returns a readable public URL', async () => {
    const service = makeService();
    const data = Buffer.from('hello-storage');
    const res = await service.upload({
      filename: 'ref.png',
      data,
      mimetype: 'image/png',
    });

    expect(res.url.startsWith('/uploads/')).toBe(true);
    // File exists on disk under the tmp dir and content matches.
    const key = res.key;
    expect(existsSync(join(tmpDir, key))).toBe(true);
    expect(readFileSync(join(tmpDir, key))).toEqual(data);
  });

  it('honours a custom STORAGE_PUBLIC_BASE_URL', async () => {
    const service = makeService('https://cdn.example.com/media');
    const res = await service.upload({
      filename: 'a.jpg',
      data: Buffer.from('x'),
      mimetype: 'image/jpeg',
    });
    expect(res.url.startsWith('https://cdn.example.com/media/')).toBe(true);
  });

  it('replaces (not aliases) on a second upload of the same filename', async () => {
    const service = makeService();
    const a = await service.upload({
      filename: 'same.png',
      data: Buffer.from('first'),
      mimetype: 'image/png',
    });
    const b = await service.upload({
      filename: 'same.png',
      data: Buffer.from('second'),
      mimetype: 'image/png',
    });
    expect(a.key).not.toBe(b.key);
    expect(readFileSync(join(tmpDir, b.key)).toString()).toBe('second');
    expect(readFileSync(join(tmpDir, a.key)).toString()).toBe('first');
  });
});
