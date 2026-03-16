import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { UserRole, UserStatus } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { NotFoundException } from '@nestjs/common';

const mockUsersService = {
  create: jest.fn(),
  listPaginated: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create user and return result without passwordHash', async () => {
      const dto = {
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: 'jan@example.com',
        password: 'Pass1!',
        role: UserRole.MECHANIC,
      };
      const created = { id: 'user-1', ...dto, passwordHash: 'hashed' };
      mockUsersService.create.mockResolvedValue(created);

      const result = await controller.create(dto as never);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toHaveProperty('email', 'jan@example.com');
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const expected = { data: [], total: 0, page: 1, limit: 10 };
      mockUsersService.listPaginated.mockResolvedValue(expected);

      const result = await controller.findAll();

      expect(result).toEqual(expected);
      expect(mockUsersService.listPaginated).toHaveBeenCalledWith(1, 10, {});
    });

    it('should pass role filter when valid role provided', async () => {
      mockUsersService.listPaginated.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await controller.findAll(UserRole.MECHANIC);

      expect(mockUsersService.listPaginated).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({ role: UserRole.MECHANIC }),
      );
    });

    it('should ignore invalid role filter', async () => {
      mockUsersService.listPaginated.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await controller.findAll('INVALID_ROLE' as never);

      expect(mockUsersService.listPaginated).toHaveBeenCalledWith(1, 10, {});
    });

    it('should pass status filter when valid status provided', async () => {
      mockUsersService.listPaginated.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await controller.findAll(undefined, UserStatus.ACTIVE);

      expect(mockUsersService.listPaginated).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({ status: UserStatus.ACTIVE }),
      );
    });
  });

  describe('findOne', () => {
    it('should return user when found', async () => {
      const mockUser = { id: 'user-1', email: 'jan@example.com' };
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne('user-1');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(controller.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updated = { id: 'user-1', firstName: 'Janusz' };
      mockUsersService.update.mockResolvedValue(updated);

      const result = await controller.update('user-1', {
        firstName: 'Janusz',
      } as never);

      expect(mockUsersService.update).toHaveBeenCalledWith('user-1', {
        firstName: 'Janusz',
      });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove('user-1');

      expect(mockUsersService.remove).toHaveBeenCalledWith('user-1');
    });
  });
});
