import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import cookieParser = require('cookie-parser');
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // ─── Logger ─────────────────────────────────────────────────────────────────
  const logger = app.get(Logger);
  app.useLogger(logger);

  // ─── Cookie Parser ──────────────────────────────────────────────────────────
  app.use(cookieParser());

  // ─── CORS ───────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL ?? 'http://localhost:10312',
      process.env.ADMIN_URL ?? 'http://localhost:10313',
    ],
    credentials: true,
  });

  // ─── Global Guards ──────────────────────────────────────────────────────────
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  // ─── Global Filters ─────────────────────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ─── Global Interceptors ────────────────────────────────────────────────────
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ─── Start ──────────────────────────────────────────────────────────────────
  const port = parseInt(process.env.PORT ?? '10311', 10);
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Backend running on http://0.0.0.0:${port}`, 'Bootstrap');
}

bootstrap();

