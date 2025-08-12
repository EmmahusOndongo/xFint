import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();