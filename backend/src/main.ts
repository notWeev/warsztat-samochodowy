import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS dla frontendu
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Walidacja DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Konfiguracja Swagger
  const config = new DocumentBuilder()
    .setTitle('Warsztat Samochodowy API')
    .setDescription('REST API dla systemu zarządzania warsztatem samochodowym')
    .setVersion('1.0')
    .addTag('auth', 'Endpointy autentykacji i autoryzacji')
    .addTag('users', 'Zarządzanie użytkownikami')
    .addTag('clients', 'Zarządzanie klientami')
    .addTag('vehicles', 'Zarządzanie pojazdami')
    .addTag('orders', 'Zarządzanie zleceniami napraw')
    .addTag('parts', 'Zarządzanie częściami zamiennymi')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Wprowadź token JWT',
        in: 'header',
      },
      'JWT-auth', // Ten identyfikator będzie używany w dekoratorach @ApiBearerAuth()
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.API_PORT || 3001;
  await app.listen(port);

  console.log(`Backend is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
