import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { QuestionsModule } from './questions/questions.module';

@Module({
  imports: [
    // Charger les variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true, 
    }),

    // Connexion MongoDB asynchrone
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'), 
      }),
      inject: [ConfigService],
    }),

    UsersModule,

    AuthModule,
    
    // Limite à 10 requêtes par 60 secondes pour une même IP
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    
    QuestionsModule,
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}