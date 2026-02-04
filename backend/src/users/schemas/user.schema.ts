import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  // L'index unique accélère la recherche par email
  @Prop({ required: true, unique: true, index: true }) 
  email: string;

  @Prop({ required: false }) // Password optionnel car Google Auth n'en a pas besoin
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  // Gestion des rôles avec valeur par défaut
  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop([String])
  favoriteQuestions: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);