import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Question } from '../../questions/schemas/question.schema';

export type AnswerDocument = Answer & Document;

@Schema({ timestamps: true })
export class Answer {
  @Prop({ required: true })
  content: string;

  // Lien vers la Question
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Question', required: true })
  question: Question;

  // Lien vers l'Auteur
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  author: User;

  @Prop({ default: 0 })
  votes: number; 
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);