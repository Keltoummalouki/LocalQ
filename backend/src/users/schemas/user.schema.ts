import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Définition du type User pour TypeScript
export type UserDocument = User & Document;

@Schema({ timestamps: true }) // Ajoute automatiquement createdAt et updatedAt
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true }) 
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop([String]) 
  favoriteQuestions: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);