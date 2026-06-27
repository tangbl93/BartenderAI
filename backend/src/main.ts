import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Allow larger base64 i2i reference-image payloads on JSON routes.
  app.use(json({ limit: '12mb' }));

  app.setGlobalPrefix('api/v1');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Serve locally-stored uploads under /uploads when the local driver is in
  // use (dev zero-infra). Served OUTSIDE api/v1 so the public URL is /uploads/…
  const driver = config.get<string>('storage.driver') || 'local';
  if (driver === 'local') {
    const uploadDir =
      config.get<string>('storage.uploadDir') || join(process.cwd(), 'uploads');
    mkdirSync(uploadDir, { recursive: true });
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const express = require('express');
    app.use('/uploads', express.static(uploadDir));
  }

  // Swagger UI at /docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Home Bartender AI API')
    .setDescription('全场景 AI 调酒师后端契约')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = config.get<number>('port') || 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}/api/v1 (docs: /docs)`);
}

bootstrap();
