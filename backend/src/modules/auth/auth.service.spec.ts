import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/user.service';
import { UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

const mockUsersService = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'jan@example.com',
        passwordHash: 'hashedPwd',
        role: UserRole.MECHANIC,
        firstName: 'Jan',
        lastName: 'Kowalski',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser('jan@example.com', 'password');

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('passwordHash');
      expect(result?.email).toBe('jan@example.com');
    });

    it('should return null when user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('unknown@example.com', 'pwd');

      expect(result).toBeNull();
    });

    it('should return null when password does not match', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'jan@example.com',
        passwordHash: 'hashedPwd',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateUser('jan@example.com', 'wrong');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access_token and user data on successful login', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'jan@example.com',
        passwordHash: 'hashedPwd',
        role: UserRole.MECHANIC,
        firstName: 'Jan',
        lastName: 'Kowalski',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockUsersService.update.mockResolvedValue(undefined);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login({
        email: 'jan@example.com',
        password: 'pwd',
      });

      expect(result.access_token).toBe('jwt-token');
      expect(result.user.id).toBe('user-1');
      expect(result.user.email).toBe('jan@example.com');
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'bad@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should update lastLoginAt on successful login', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'jan@example.com',
        passwordHash: 'hashedPwd',
        role: UserRole.MECHANIC,
        firstName: 'Jan',
        lastName: 'Kowalski',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockUsersService.update.mockResolvedValue(undefined);
      mockJwtService.sign.mockReturnValue('jwt-token');

      await service.login({ email: 'jan@example.com', password: 'pwd' });

      expect(mockUsersService.update).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          lastLoginAt: expect.any(Date) as unknown as Date,
        }),
      );
    });
  });

  describe('register', () => {
    it('should create new user and return access_token', async () => {
      const registerDto = {
        firstName: 'Anna',
        lastName: 'Nowak',
        email: 'anna@example.com',
        password: 'Password1!',
        phone: '123456789',
      };
      const mockCreatedUser = {
        id: 'user-2',
        email: 'anna@example.com',
        firstName: 'Anna',
        lastName: 'Nowak',
        role: UserRole.RECEPTION,
      };

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockCreatedUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(result.access_token).toBe('jwt-token');
      expect(result.user.email).toBe('anna@example.com');
    });

    it('should throw BadRequestException when email already registered', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.register({
          firstName: 'Anna',
          lastName: 'Nowak',
          email: 'existing@example.com',
          password: 'Password1!',
          phone: '123456789',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile when user exists', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'jan@example.com',
        firstName: 'Jan',
        lastName: 'Kowalski',
        role: UserRole.MECHANIC,
        phone: '123456789',
      };

      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-1');

      expect(result.user.id).toBe('user-1');
      expect(result.user.email).toBe('jan@example.com');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(service.getProfile('non-existent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should return generic message and resetToken when user exists', async () => {
      const mockUser = { id: 'user-1', email: 'jan@example.com' };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('reset-token-123');

      const result = await service.forgotPassword({ email: 'jan@example.com' });

      expect(result.message).toContain('Jeśli email');
      expect(result.resetToken).toBe('reset-token-123');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { sub: 'user-1', type: 'password-reset' },
        { expiresIn: '15m' },
      );
    });

    it('should return generic message (no resetToken) when user does not exist', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword({
        email: 'nobody@example.com',
      });

      expect(result.message).toContain('Jeśli email');
      expect(result.resetToken).toBeUndefined();
    });
  });

  describe('resetPassword', () => {
    it('should reset password when token is valid', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: 'user-1',
        type: 'password-reset',
      });
      mockedBcrypt.hash.mockResolvedValue('newHashedPwd' as never);
      mockUsersService.update.mockResolvedValue(undefined);

      const result = await service.resetPassword({
        token: 'valid-token',
        newPassword: 'NewPass1!',
      });

      expect(result.message).toContain('zresetowane');
      expect(mockUsersService.update).toHaveBeenCalledWith('user-1', {
        passwordHash: 'newHashedPwd',
      });
    });

    it('should throw UnauthorizedException when token type is wrong', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: 'user-1',
        type: 'wrong-type',
      });

      await expect(
        service.resetPassword({ token: 'bad-token', newPassword: 'NewPass1!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is expired/invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(
        service.resetPassword({
          token: 'expired-token',
          newPassword: 'NewPass1!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
