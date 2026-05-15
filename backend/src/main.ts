import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as path from 'path';
import { AppModule } from './app.module';
import { GlobalValidationPipe } from './common/pipes/validation.pipe';
import { parseOrigins } from './common/utils/parse-origins';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  // Serve local uploads when MinIO is not configured
  if (!process.env.MINIO_ENDPOINT) {
    const uploadDir = process.env.LOCAL_UPLOAD_DIR || 'uploads';
    app.useStaticAssets(path.resolve(process.cwd(), uploadDir), {
      prefix: '/uploads',
    });
    logger.log(`Local file storage enabled at /uploads (${uploadDir})`);
  }

  // WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS — parse comma-separated origins into a matcher function
  const allowedOrigins = parseOrigins(process.env.CORS_ORIGIN ?? 'http://localhost:3000');
  app.enableCors({
    origin(origin, callback) {
      // Allow requests with no origin (server-to-server, curl, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  });

  // Security — disable cross-origin policies that break local dev and API calls
  app.use(
    helmet({
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Global pipes
  app.useGlobalPipes(GlobalValidationPipe);

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('艺育皮韵 API')
    .setDescription('Leather Carving Education Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = parseInt(process.env.PORT ?? '5000', 10);
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

void bootstrap();
