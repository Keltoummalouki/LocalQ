import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

const mockAuthService = {
  validateUser: jest.fn(),
  login: jest.fn(),
  googleLogin: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('doit être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('doit retourner le résultat de authService.login', async () => {
      const dto = { email: 'test@test.com', password: 'pass' };
      const resultUser = { email: 'test@test.com' };
      const resultToken = { access_token: 'abc', user: resultUser };

      mockAuthService.validateUser.mockResolvedValue(resultUser);
      mockAuthService.login.mockReturnValue(resultToken);

      const result = await controller.login(dto);
      expect(result).toEqual(resultToken);
    });

    it('doit lancer une erreur si les identifiants sont faux', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);
      
      await expect(controller.login({ email: 'bad', password: 'bad' }))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });

  describe('googleAuthRedirect', () => {
    it('doit rediriger vers le frontend avec le token', async () => {
      const req = { user: { email: 'google@test.com' } };
      const res = { redirect: jest.fn() }; // Mock de l'objet Response d'Express
      
      const loginResult = { access_token: 'token123', user: { email: 'google@test.com' } };
      mockAuthService.googleLogin.mockResolvedValue(loginResult);

      await controller.googleAuthRedirect(req, res as any);

      // Vérifie que la redirection contient bien le token
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('token=token123'));
    });

    it('doit rediriger avec une erreur si le login échoue', async () => {
      const req = { user: null };
      const res = { redirect: jest.fn() };
      
      mockAuthService.googleLogin.mockResolvedValue(null);

      await controller.googleAuthRedirect(req, res as any);

      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('error=auth_failed'));
    });
  });
});