import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    // verification de password
    if (user && (await bcrypt.compare(pass, user.password))) {
      
      const { password, ...result } = (user as UserDocument).toObject(); 
      
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }

    // vérifie si l'utilisateur existe déjà
    let user = await this.usersService.findByEmail(req.user.email);

    // S'il n'existe pas, crée (sans mot de passe)
    if (!user) {
      user = await this.usersService.create({
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        password: '', // Pas de mdp pour Google
      });
    }

    // génère le token JWT comme d'habitude
    return this.login(user);
  }
}