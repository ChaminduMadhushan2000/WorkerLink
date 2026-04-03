import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;

  // Global prefix — all routes start with /api/v1
  app.setGlobalPrefix('api/v1', {
    exclude: ['api/health'], // health check has no version prefix
  });

  // Global validation pipe — guidebook requirement
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip fields not in DTO
      forbidNonWhitelisted: true, // throw error if unknown fields sent
      transform: true, // auto-transform types (string to number etc)
    }),
  );

  // CORS — allow frontend to talk to backend during development
  app.enableCors({
    origin: 'http://localhost:5173', // Vite's default port
    credentials: true,
  });

  await app.listen(port);
  logger.log(`Application running on port ${port}`);
  logger.log(`Environment: ${configService.get<string>('NODE_ENV')}`);
}

bootstrap();
