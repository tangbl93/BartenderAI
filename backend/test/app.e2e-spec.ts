import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { seed } from '../src/database/seed';

/**
 * Happy-path e2e: register -> login -> list ingredients -> generate recipe ->
 * create poster job -> poll job. Providers default to the stubs (no env keys),
 * DB is in-memory SQLite (NODE_ENV=test).
 */
describe('Home Bartender AI (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'e2e-secret';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const ds = app.get<DataSource>(getDataSourceToken());
    await seed(ds);
  });

  afterAll(async () => {
    await app.close();
  });

  const api = () => request(app.getHttpServer());

  it('GET /health is public and ok', async () => {
    const res = await api().get('/api/v1/health').expect(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /meta/locales returns the 5 supported locales', async () => {
    const res = await api().get('/api/v1/meta/locales').expect(200);
    expect(res.body).toEqual(['en', 'zh-CN', 'zh-TW', 'ja', 'ko']);
  });

  it('runs the full happy path', async () => {
    // 1. Register
    const account = `e2e-${Date.now()}@example.com`;
    const reg = await api()
      .post('/api/v1/auth/register')
      .send({ account, password: 'password1234', displayName: 'E2E' })
      .expect(201);
    expect(reg.body.accessToken).toBeTruthy();

    // 2. Login
    const login = await api()
      .post('/api/v1/auth/login')
      .send({ account, password: 'password1234' })
      .expect(200);
    const token = login.body.accessToken as string;
    expect(token).toBeTruthy();

    // me
    const me = await api()
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(me.body.account).toBe(account);

    // 3. List ingredients (public)
    const ingredients = await api()
      .get('/api/v1/ingredients?locale=en')
      .expect(200);
    expect(Array.isArray(ingredients.body)).toBe(true);
    expect(ingredients.body.length).toBeGreaterThanOrEqual(2);
    const ids = ingredients.body.slice(0, 2).map((i: any) => i.id);

    // 4. Generate recipe (auth required, only-selected, >=2)
    const recipeRes = await api()
      .post('/api/v1/recipes/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ ingredientIds: ids, locale: 'en' })
      .expect(200);
    expect(recipeRes.body.id).toBeTruthy();
    expect(recipeRes.body.items.length).toBe(2);
    expect(recipeRes.body.safetyNotes.join(' ')).toContain('minors');
    const recipeId = recipeRes.body.id;

    // 422 guidance for <2 ingredients
    await api()
      .post('/api/v1/recipes/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ ingredientIds: [ids[0]], locale: 'en' })
      .expect(422);

    // 5. Create poster job (defaults to 3 templates)
    const jobRes = await api()
      .post('/api/v1/posters/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId, locale: 'en' })
      .expect(202);
    expect(jobRes.body.id).toBeTruthy();
    expect(jobRes.body.posters.length).toBeGreaterThanOrEqual(3);
    const jobId = jobRes.body.id;

    // 6. Poll job
    const poll = await api()
      .get(`/api/v1/posters/jobs/${jobId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(['done', 'partial', 'running']).toContain(poll.body.status);
    // With the stub provider all posters succeed.
    expect(poll.body.status).toBe('done');
    expect(poll.body.posters.every((p: any) => p.imageUrl)).toBe(true);
  });

  it('GET /recipes/examples returns seeded examples', async () => {
    const res = await api().get('/api/v1/recipes/examples?locale=en').expect(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0].isExample).toBe(true);
  });

  it('rejects protected routes without a token (401)', async () => {
    await api().get('/api/v1/lab/entries').expect(401);
  });

  it('rejects admin route for a normal user (403)', async () => {
    const account = `e2e-user-${Date.now()}@example.com`;
    await api()
      .post('/api/v1/auth/register')
      .send({ account, password: 'password1234' })
      .expect(201);
    const login = await api()
      .post('/api/v1/auth/login')
      .send({ account, password: 'password1234' })
      .expect(200);
    await api()
      .get('/api/v1/admin/ingredients')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(403);
  });
});
