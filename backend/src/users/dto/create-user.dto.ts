import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: "L'email doit être valide" })
  email: string;

  @IsString()
  @IsOptional() // Optionnel pour Google Auth
  @MinLength(6, { message: 'Le mot de passe doit faire au moins 6 caractères' })
  password?: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}