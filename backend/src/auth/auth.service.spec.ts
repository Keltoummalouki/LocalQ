import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// On crée un "Faux" UsersService
const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

// On crée un "Faux" JwtService
const mockJwtService = {
  sign: jest.fn(() => 'fake_token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('doit retourner les infos user si le mot de passe est bon', async () => {
      // On simule un mot de passe haché
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const mockUser = {
        _id: '1',
        email: 'test@test.com',
        password: hashedPassword,
        toObject: jest.fn().mockReturnValue({ email: 'test@test.com', _id: '1' }), // Simulation de Mongoose
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@test.com', password);
      expect(result).toEqual({ email: 'test@test.com', _id: '1' });
    });

    it('doit retourner null si le user n\'existe pas', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const result = await service.validateUser('inconnu@test.com', 'pass');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('doit retourner un token d\'accès', async () => {
      const user = { email: 'test@test.com', _id: '1' };
      const result = await service.login(user);

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toEqual('fake_token');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });
  });

  describe('googleLogin', () => {
    it('doit créer un utilisateur s\'il n\'existe pas', async () => {
      const req = {
        user: { email: 'google@test.com', firstName: 'Google', lastName: 'User' },
      };

      mockUsersService.findByEmail.mockResolvedValue(null); // Il n'existe pas encore
      mockUsersService.create.mockResolvedValue({ ...req.user, _id: 'new_id' }); // On simule la création

      await service.googleLogin(req);

      expect(mockUsersService.create).toHaveBeenCalledWith(expect.objectContaining({
        email: 'google@test.com',
      }));
    });
  });
});