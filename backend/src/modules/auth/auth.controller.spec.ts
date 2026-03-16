import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  getProfile: jest.fn(),
  changePassword: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
};

const mockRequest = (
  userId = 'user-1',
  email = 'jan@example.com',
  role = 'MECHANIC',
) => ({
  user: { userId, email, role },
});

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return result', async () => {
      const registerDto = {
        firstName: 'Anna',
        lastName: 'Nowak',
        email: 'anna@example.com',
        password: 'Pass1!',
        phone: '123456789',
      };
      const expected = { access_token: 'jwt-token', user: { id: 'user-1' } };
      mockAuthService.register.mockResolvedValue(expected);

      const result = await controller.register(registerDto as never);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('should call authService.login with credentials', async () => {
      const loginDto = { email: 'jan@example.com', password: 'pwd' };
      const expected = { access_token: 'jwt-token', user: { id: 'user-1' } };
      mockAuthService.login.mockResolvedValue(expected);

      const result = await controller.login(loginDto as never);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expected);
    });
  });

  describe('getProfile', () => {
    it('should return profile for authenticated user', async () => {
      const expected = { user: { id: 'user-1', email: 'jan@example.com' } };
      mockAuthService.getProfile.mockResolvedValue(expected);

      const result = await controller.getProfile(mockRequest() as never);

      expect(mockAuthService.getProfile).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expected);
    });
  });

  describe('changePassword', () => {
    it('should call authService.changePassword with userId from request', async () => {
      const changeDto = { oldPassword: 'old', newPassword: 'New1!' };
      const expected = { message: 'Hasło zostało pomyślnie zmienione' };
      mockAuthService.changePassword.mockResolvedValue(expected);

      const result = await controller.changePassword(
        mockRequest() as never,
        changeDto as never,
      );

      expect(mockAuthService.changePassword).toHaveBeenCalledWith(
        'user-1',
        changeDto,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword', async () => {
      const expected = { message: 'Jeśli email istnieje...' };
      mockAuthService.forgotPassword.mockResolvedValue(expected);

      const result = await controller.forgotPassword({
        email: 'jan@example.com',
      });

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith({
        email: 'jan@example.com',
      });
      expect(result).toEqual(expected);
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword', async () => {
      const dto = { token: 'valid-token', newPassword: 'New1!' };
      const expected = { message: 'Hasło zostało pomyślnie zresetowane' };
      mockAuthService.resetPassword.mockResolvedValue(expected);

      const result = await controller.resetPassword(dto as never);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('healthCheck', () => {
    it('should return health status', () => {
      const result = controller.healthCheck();

      expect(result.status).toBe('ok');
      expect(result).toHaveProperty('timestamp');
    });
  });
});
