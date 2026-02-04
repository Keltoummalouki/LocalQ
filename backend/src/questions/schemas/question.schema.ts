import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Question {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  city: string; // Pour la géolocalisation

  // Relation : Une question appartient à un User
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  author: User;

  @Prop({ default: 0 })
  views: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  upvotes: User[]; // Liste des users qui ont liké
}

export const QuestionSchema = SchemaFactory.createForClass(Question);