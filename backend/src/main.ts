import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  // Bloque les requêtes si les données sont invalides
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Retire les champs qui ne sont pas dans le DTO
    forbidNonWhitelisted: true, // Renvoie une erreur si on envoie des champs inconnus
  }));

  await app.listen(3000);
}

bootstrap();