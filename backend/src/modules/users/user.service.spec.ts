import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './user.service';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

const createMockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  })),
});

type MockRepository = ReturnType<typeof createMockRepository>;

describe('UsersService', () => {
  let service: UsersService;
  let repository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<MockRepository>(getRepositoryToken(User));

    // Wyczyść wszystkie mocki przed każdym testem
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const createUserDto = {
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: 'jan.kowalski@example.com',
        password: 'Test123!',
        role: UserRole.MECHANIC,
      };

      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...createUserDto,
        email: createUserDto.email.toLowerCase(),
        passwordHash: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Konfiguruj mocki dla tego testu
      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith({
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email.toLowerCase(),
        phone: undefined,
        passwordHash: 'hashedPassword',
        role: createUserDto.role,
      });
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('Test123!', 12);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email without password', async () => {
      const email = 'test@example.com';
      const mockUser = { id: '123', email, firstName: 'Test' };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
      };

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findByEmail(email);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('u');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('u.email = :email', {
        email: email.toLowerCase(),
      });
      expect(mockQueryBuilder.addSelect).not.toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should find user by email with password when requested', async () => {
      const email = 'test@example.com';
      const mockUser = { id: '123', email, passwordHash: 'hash' };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
      };

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findByEmail(email, true);

      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('u.passwordHash');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { id: userId, email: 'test@example.com' };

      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(userId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(mockUser);
    });
  });
});
