import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer, CustomerType } from './entities/customer.entity';

const createMockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
});

type MockRepository = ReturnType<typeof createMockRepository>;

const createMockQueryBuilder = (data: Customer[] = [], total = 0) => ({
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([data, total]),
});

describe('CustomersService', () => {
  let service: CustomersService;
  let repository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customer),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    repository = module.get<MockRepository>(getRepositoryToken(Customer));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an individual customer successfully', async () => {
      const dto = {
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: 'jan@example.com',
        phone: '123456789',
        type: CustomerType.INDIVIDUAL,
      };
      const mockCustomer = { id: 'cust-1', ...dto };

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockCustomer);
      repository.save.mockResolvedValue(mockCustomer);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(mockCustomer);
      expect(result).toEqual(mockCustomer);
    });

    it('should throw BadRequestException when BUSINESS customer has no NIP', async () => {
      const dto = {
        firstName: 'Firma',
        lastName: 'Sp. z o.o.',
        email: 'firma@example.com',
        phone: '123456789',
        type: CustomerType.BUSINESS,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when PESEL is duplicated', async () => {
      const dto = {
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: 'jan@example.com',
        phone: '123456789',
        type: CustomerType.INDIVIDUAL,
        pesel: '12345678901',
      };

      repository.findOne.mockResolvedValue({
        id: 'existing',
        pesel: dto.pesel,
      });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when NIP is duplicated', async () => {
      const dto = {
        firstName: 'Firma',
        lastName: 'Sp. z o.o.',
        email: 'firma@example.com',
        phone: '123456789',
        type: CustomerType.BUSINESS,
        nip: '1234567890',
      };

      repository.findOne.mockResolvedValueOnce({
        id: 'existing',
        nip: dto.nip,
      });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated customers', async () => {
      const mockCustomers = [
        { id: 'cust-1', firstName: 'Jan', lastName: 'Kowalski' } as Customer,
      ];
      const mockQB = createMockQueryBuilder(mockCustomers, 1);
      repository.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.findAll(1, 10);

      expect(result.data).toEqual(mockCustomers);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should apply ILIKE search filter', async () => {
      const mockQB = createMockQueryBuilder([], 0);
      repository.createQueryBuilder.mockReturnValue(mockQB);

      await service.findAll(1, 10, 'kowalski');

      expect(mockQB.where).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.objectContaining({ search: '%kowalski%' }),
      );
    });

    it('should filter by customer type', async () => {
      const mockQB = createMockQueryBuilder([], 0);
      repository.createQueryBuilder.mockReturnValue(mockQB);

      await service.findAll(1, 10, undefined, CustomerType.BUSINESS);

      expect(mockQB.andWhere).toHaveBeenCalledWith('customer.type = :type', {
        type: CustomerType.BUSINESS,
      });
    });
  });

  describe('findOne', () => {
    it('should return customer when found', async () => {
      const mockCustomer = { id: 'cust-1', firstName: 'Jan' } as Customer;
      repository.findOne.mockResolvedValue(mockCustomer);

      const result = await service.findOne('cust-1');

      expect(result).toEqual(mockCustomer);
    });

    it('should throw NotFoundException when customer not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update customer successfully', async () => {
      const mockCustomer = {
        id: 'cust-1',
        firstName: 'Jan',
        pesel: '12345678901',
        nip: undefined,
      } as Customer;
      repository.findOne.mockResolvedValue(mockCustomer);
      repository.save.mockResolvedValue({
        ...mockCustomer,
        firstName: 'Janusz',
      });

      const result = await service.update('cust-1', { firstName: 'Janusz' });

      expect(result.firstName).toBe('Janusz');
    });

    it('should throw BadRequestException when updating to existing PESEL', async () => {
      const mockCustomer = { id: 'cust-1', pesel: '11111111111' } as Customer;
      repository.findOne
        .mockResolvedValueOnce(mockCustomer)
        .mockResolvedValueOnce({ id: 'cust-2', pesel: '99999999999' });

      await expect(
        service.update('cust-1', { pesel: '99999999999' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove customer successfully', async () => {
      const mockCustomer = { id: 'cust-1' } as Customer;
      repository.findOne.mockResolvedValue(mockCustomer);
      repository.remove.mockResolvedValue(undefined);

      await service.remove('cust-1');

      expect(repository.remove).toHaveBeenCalledWith(mockCustomer);
    });
  });
});
