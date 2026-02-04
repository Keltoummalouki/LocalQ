import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnswersService } from './answers.service';
import { AnswersController } from './answers.controller';
import { Answer, AnswerSchema } from './schemas/answer.schema';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Answer.name, schema: AnswerSchema }]),
    AuthModule,
  ],
  controllers: [AnswersController],
  providers: [AnswersService],
})
export class AnswersModule {}