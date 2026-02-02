import { Controller, Post, Body, UnauthorizedException, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    return this.authService.login(user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // le Guard redirige automatiquement vers Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const data = await this.authService.googleLogin(req);

    if (!data || typeof data === 'string') {
      return res.redirect('http://localhost:3001/login?error=auth_failed');
    }

    // encode les données pour les passer dans l'URL
    const userString = encodeURIComponent(JSON.stringify(data.user));
    return res.redirect(`http://localhost:3001/login?token=${data.access_token}&user=${userString}`);
  }
}