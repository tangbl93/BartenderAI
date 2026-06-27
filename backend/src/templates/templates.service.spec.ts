import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { TemplatesService } from './templates.service';
import { StyleTemplateEntity } from '../database/entities/style-template.entity';
import { createTestDataSource } from '../../test/test-datasource';
import { StubImageProvider } from '../ai/stub-image.provider';
import {
  STORAGE_SERVICE,
  StorageService,
  StorageUpload,
} from '../storage/storage.interface';

/** In-memory storage stub: records uploads and returns a deterministic URL. */
class InMemStorage implements StorageService {
  uploads: StorageUpload[] = [];
  async upload(u: StorageUpload) {
    this.uploads.push(u);
    const key = `stub/${this.uploads.length}/${u.filename}`;
    return { url: `https://storage.local/${key}`, key };
  }
}

describe('TemplatesService (reference image + feed version)', () => {
  let ds: DataSource;
  let service: TemplatesService;
  let storage: InMemStorage;

  beforeEach(async () => {
    ds = await createTestDataSource();
    storage = new InMemStorage();
    service = new TemplatesService(
      ds.getRepository(StyleTemplateEntity),
      new StubImageProvider(),
      storage,
    );
  });

  afterEach(async () => {
    await ds.destroy();
  });

  async function makeTemplate(enabled = true, version = 1) {
    const repo = ds.getRepository(StyleTemplateEntity);
    return repo.save(
      repo.create({
        name: 'T',
        dimension: 'home_closeup',
        prompt: 'p',
        layout: { textAlign: 'center', watermarkPosition: 'bottom-right' },
        textRenderMode: 'backend',
        enabled,
        version,
      }),
    );
  }

  it('uploads and stores a reference image URL on the template', async () => {
    const t = await makeTemplate();
    const res = await service.setReferenceImage(t.id, {
      filename: 'ref.png',
      data: Buffer.from('png-bytes'),
      mimetype: 'image/png',
    });
    expect(res.referenceImageUrl).toMatch(/^https:\/\/storage\.local\//);
    const after = await service.getEntity(t.id);
    expect(after.referenceImageUrl).toBe(res.referenceImageUrl);
    expect(storage.uploads.length).toBe(1);
  });

  it('replacing the reference image stores a new object and updates the URL', async () => {
    const t = await makeTemplate();
    const first = await service.setReferenceImage(t.id, {
      filename: 'a.png',
      data: Buffer.from('a'),
      mimetype: 'image/png',
    });
    const second = await service.setReferenceImage(t.id, {
      filename: 'b.png',
      data: Buffer.from('b'),
      mimetype: 'image/png',
    });
    expect(second.referenceImageUrl).not.toBe(first.referenceImageUrl);
    const after = await service.getEntity(t.id);
    expect(after.referenceImageUrl).toBe(second.referenceImageUrl);
    expect(storage.uploads.length).toBe(2);
  });

  it('listEnabled includes referenceImageUrl on each template', async () => {
    const t = await makeTemplate();
    await service.setReferenceImage(t.id, {
      filename: 'r.png',
      data: Buffer.from('r'),
      mimetype: 'image/png',
    });
    const list = await service.listEnabled();
    expect(list[0].referenceImageUrl).toBeTruthy();
  });

  it('feedVersion = max(version) of enabled templates', async () => {
    await makeTemplate(true, 3);
    await makeTemplate(true, 7);
    await makeTemplate(false, 99); // disabled ignored
    expect(await service.feedVersion()).toBe(7);
  });

  it('feedVersion is 0 when no enabled templates', async () => {
    await makeTemplate(false, 5);
    expect(await service.feedVersion()).toBe(0);
  });
});
