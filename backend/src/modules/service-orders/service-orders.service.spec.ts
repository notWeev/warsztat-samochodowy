import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ServiceOrdersService } from './service-orders.service';
import {
  ServiceOrder,
  ServiceOrderStatus,
} from './entities/service-order.entity';
import { CustomersService } from '../customers/customers.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { UsersService } from '../users/user.service';

const createMockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
});

type MockRepository = ReturnType<typeof createMockRepository>;

const mockCustomersService = { findOne: jest.fn() };
const mockVehiclesService = { findOne: jest.fn() };
const mockUsersService = { findById: jest.fn() };

const createMockOrderNumberQB = (lastOrder: ServiceOrder | null) => ({
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getOne: jest.fn().mockResolvedValue(lastOrder),
});

const createMockFindAllQB = (data: ServiceOrder[] = [], total = 0) => ({
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([data, total]),
});

describe('ServiceOrdersService', () => {
  let service: ServiceOrdersService;
  let repository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceOrdersService,
        {
          provide: getRepositoryToken(ServiceOrder),
          useValue: createMockRepository(),
        },
        { provide: CustomersService, useValue: mockCustomersService },
        { provide: VehiclesService, useValue: mockVehiclesService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<ServiceOrdersService>(ServiceOrdersService);
    repository = module.get<MockRepository>(getRepositoryToken(ServiceOrder));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create - order number generation', () => {
    const baseDto = {
      customerId: 'cust-1',
      vehicleId: 'veh-1',
      description: 'Wymiana oleju',
    };

    const mockCustomer = { id: 'cust-1' };
    const mockVehicle = { id: 'veh-1', customerId: 'cust-1' };

    it('should generate order number WS-YYYY-00001 when no previous orders', async () => {
      const year = new Date().getFullYear();
      mockCustomersService.findOne.mockResolvedValue(mockCustomer);
      mockVehiclesService.findOne.mockResolvedValue(mockVehicle);
      repository.createQueryBuilder.mockReturnValue(
        createMockOrderNumberQB(null),
      );

      const mockOrder = {
        id: 'order-1',
        orderNumber: `WS-${year}-00001`,
        ...baseDto,
      };
      repository.create.mockReturnValue(mockOrder);
      repository.save.mockResolvedValue(mockOrder);

      const result = await service.create(baseDto);

      expect(result.orderNumber).toBe(`WS-${year}-00001`);
    });

    it('should increment order number when previous orders exist', async () => {
      const year = new Date().getFullYear();
      const lastOrder = { orderNumber: `WS-${year}-00005` } as ServiceOrder;

      mockCustomersService.findOne.mockResolvedValue(mockCustomer);
      mockVehiclesService.findOne.mockResolvedValue(mockVehicle);
      repository.createQueryBuilder.mockReturnValue(
        createMockOrderNumberQB(lastOrder),
      );

      const mockOrder = {
        id: 'order-2',
        orderNumber: `WS-${year}-00006`,
        ...baseDto,
      };
      repository.create.mockReturnValue(mockOrder);
      repository.save.mockResolvedValue(mockOrder);

      const result = await service.create(baseDto);

      expect(result.orderNumber).toBe(`WS-${year}-00006`);
    });

    it('should set default status to PENDING', async () => {
      mockCustomersService.findOne.mockResolvedValue(mockCustomer);
      mockVehiclesService.findOne.mockResolvedValue(mockVehicle);
      repository.createQueryBuilder.mockReturnValue(
        createMockOrderNumberQB(null),
      );
      repository.create.mockReturnValue({
        id: 'order-1',
        status: ServiceOrderStatus.PENDING,
      });
      repository.save.mockResolvedValue({
        id: 'order-1',
        status: ServiceOrderStatus.PENDING,
      });

      await service.create(baseDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: ServiceOrderStatus.PENDING }),
      );
    });

    it('should throw BadRequestException when vehicle does not belong to customer', async () => {
      mockCustomersService.findOne.mockResolvedValue(mockCustomer);
      mockVehiclesService.findOne.mockResolvedValue({
        id: 'veh-1',
        customerId: 'other-cust',
      });

      await expect(service.create(baseDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should validate mechanic existence when assignedMechanicId is set', async () => {
      mockCustomersService.findOne.mockResolvedValue(mockCustomer);
      mockVehiclesService.findOne.mockResolvedValue(mockVehicle);
      mockUsersService.findById.mockResolvedValue(null);

      await expect(
        service.create({
          ...baseDto,
          assignedMechanicId: 'non-existent-mechanic',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      const mockOrders = [{ id: 'order-1' } as ServiceOrder];
      const mockQB = createMockFindAllQB(mockOrders, 1);
      repository.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.findAll(1, 10);

      expect(result.data).toEqual(mockOrders);
      expect(result.total).toBe(1);
    });

    it('should filter by status', async () => {
      const mockQB = createMockFindAllQB([], 0);
      repository.createQueryBuilder.mockReturnValue(mockQB);

      await service.findAll(1, 10, ServiceOrderStatus.IN_PROGRESS);

      expect(mockQB.andWhere).toHaveBeenCalledWith('order.status = :status', {
        status: ServiceOrderStatus.IN_PROGRESS,
      });
    });

    it('should filter by mechanicId', async () => {
      const mockQB = createMockFindAllQB([], 0);
      repository.createQueryBuilder.mockReturnValue(mockQB);

      await service.findAll(
        1,
        10,
        undefined,
        undefined,
        undefined,
        'mechanic-1',
      );

      expect(mockQB.andWhere).toHaveBeenCalledWith(
        'order.assignedMechanicId = :mechanicId',
        { mechanicId: 'mechanic-1' },
      );
    });
  });

  describe('findOne', () => {
    it('should return order when found', async () => {
      const mockOrder = { id: 'order-1' } as ServiceOrder;
      repository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findOne('order-1');

      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException when order not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update order and recalculate totalCost', async () => {
      const mockOrder = {
        id: 'order-1',
        laborCost: 100,
        partsCost: 50,
        totalCost: 150,
        status: ServiceOrderStatus.PENDING,
      } as ServiceOrder;

      repository.findOne.mockResolvedValue(mockOrder);
      repository.save.mockImplementation((o) => Promise.resolve(o));

      const result = await service.update('order-1', {
        laborCost: 200,
        partsCost: 80,
      });

      expect(result.totalCost).toBe(280);
    });
  });

  describe('remove', () => {
    it('should remove order successfully', async () => {
      const mockOrder = { id: 'order-1' } as ServiceOrder;
      repository.findOne.mockResolvedValue(mockOrder);
      repository.remove.mockResolvedValue(undefined);

      await service.remove('order-1');

      expect(repository.remove).toHaveBeenCalledWith(mockOrder);
    });
  });
});
