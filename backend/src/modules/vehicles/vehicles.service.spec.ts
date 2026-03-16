import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { Vehicle, VehicleStatus } from './entities/vehicle.entity';
import { CustomersService } from '../customers/customers.service';

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

const mockCustomersService = {
  findOne: jest.fn(),
};

const createMockQueryBuilder = (data: Vehicle[] = [], total = 0) => ({
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([data, total]),
});

describe('VehiclesService', () => {
  let service: VehiclesService;
  let repository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: createMockRepository(),
        },
        { provide: CustomersService, useValue: mockCustomersService },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    repository = module.get<MockRepository>(getRepositoryToken(Vehicle));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a vehicle successfully', async () => {
      const dto = {
        customerId: 'cust-1',
        vin: 'VIN123456789',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        registrationNumber: 'WA12345',
        mileage: 10000,
      };
      const mockCustomer = { id: 'cust-1' };
      const mockVehicle = { id: 'veh-1', ...dto };

      mockCustomersService.findOne.mockResolvedValue(mockCustomer);
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockVehicle);
      repository.save.mockResolvedValue(mockVehicle);

      const result = await service.create(dto);

      expect(mockCustomersService.findOne).toHaveBeenCalledWith('cust-1');
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { vin: dto.vin },
      });
      expect(result).toEqual(mockVehicle);
    });

    it('should throw BadRequestException when VIN already exists', async () => {
      const dto = {
        customerId: 'cust-1',
        vin: 'VIN123456789',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        registrationNumber: 'WA12345',
        mileage: 20000,
      };

      mockCustomersService.findOne.mockResolvedValue({ id: 'cust-1' });
      repository.findOne.mockResolvedValue({
        id: 'existing-veh',
        vin: dto.vin,
      });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated vehicles', async () => {
      const mockVehicles = [{ id: 'veh-1', brand: 'Toyota' } as Vehicle];
      const mockQB = createMockQueryBuilder(mockVehicles, 1);
      repository.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.findAll(1, 10);

      expect(result.data).toEqual(mockVehicles);
      expect(result.total).toBe(1);
    });

    it('should apply ILIKE search filter', async () => {
      const mockQB = createMockQueryBuilder([], 0);
      repository.createQueryBuilder.mockReturnValue(mockQB);

      await service.findAll(1, 10, 'toyota');

      expect(mockQB.where).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.objectContaining({ search: '%toyota%' }),
      );
    });

    it('should filter by customerId', async () => {
      const mockQB = createMockQueryBuilder([], 0);
      repository.createQueryBuilder.mockReturnValue(mockQB);

      await service.findAll(1, 10, undefined, 'cust-1');

      expect(mockQB.andWhere).toHaveBeenCalledWith(
        'vehicle.customerId = :customerId',
        { customerId: 'cust-1' },
      );
    });

    it('should filter by status', async () => {
      const mockQB = createMockQueryBuilder([], 0);
      repository.createQueryBuilder.mockReturnValue(mockQB);

      await service.findAll(1, 10, undefined, undefined, VehicleStatus.ACTIVE);

      expect(mockQB.andWhere).toHaveBeenCalledWith('vehicle.status = :status', {
        status: VehicleStatus.ACTIVE,
      });
    });
  });

  describe('findOne', () => {
    it('should return vehicle with customer relation', async () => {
      const mockVehicle = { id: 'veh-1', brand: 'Toyota' } as Vehicle;
      repository.findOne.mockResolvedValue(mockVehicle);

      const result = await service.findOne('veh-1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'veh-1' },
        relations: ['customer'],
      });
      expect(result).toEqual(mockVehicle);
    });

    it('should throw NotFoundException when vehicle not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByVin', () => {
    it('should return vehicle when found by VIN', async () => {
      const mockVehicle = { id: 'veh-1', vin: 'VIN123' } as Vehicle;
      repository.findOne.mockResolvedValue(mockVehicle);

      const result = await service.findByVin('VIN123');

      expect(result).toEqual(mockVehicle);
    });
  });

  describe('update', () => {
    it('should update vehicle successfully', async () => {
      const mockVehicle = {
        id: 'veh-1',
        brand: 'Toyota',
        model: 'Corolla',
      } as Vehicle;
      repository.findOne.mockResolvedValue(mockVehicle);
      repository.save.mockResolvedValue({ ...mockVehicle, model: 'Yaris' });

      const result = await service.update('veh-1', { model: 'Yaris' });

      expect(result.model).toBe('Yaris');
    });
  });

  describe('remove', () => {
    it('should remove vehicle successfully', async () => {
      const mockVehicle = { id: 'veh-1' } as Vehicle;
      repository.findOne.mockResolvedValue(mockVehicle);
      repository.remove.mockResolvedValue(undefined);

      await service.remove('veh-1');

      expect(repository.remove).toHaveBeenCalledWith(mockVehicle);
    });
  });

  describe('findByCustomer', () => {
    it('should return vehicles for customer', async () => {
      const mockVehicles = [{ id: 'veh-1', customerId: 'cust-1' }] as Vehicle[];
      repository.find.mockResolvedValue(mockVehicles);

      const result = await service.findByCustomer('cust-1');

      expect(repository.find).toHaveBeenCalledWith({
        where: { customerId: 'cust-1' },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockVehicles);
    });
  });
});
