import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrdersController } from './service-orders.controller';
import { ServiceOrdersService } from './service-orders.service';
import {
  ServiceOrderStatus,
  ServiceOrderPriority,
} from './entities/service-order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

const mockServiceOrdersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByOrderNumber: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getStats: jest.fn(),
};

describe('ServiceOrdersController', () => {
  let controller: ServiceOrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceOrdersController],
      providers: [
        { provide: ServiceOrdersService, useValue: mockServiceOrdersService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ServiceOrdersController>(ServiceOrdersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create service order', async () => {
      const dto = {
        customerId: 'cust-1',
        vehicleId: 'veh-1',
        description: 'Wymiana oleju',
      };
      const year = new Date().getFullYear();
      const expected = {
        id: 'order-1',
        orderNumber: `WS-${year}-00001`,
        ...dto,
      };
      mockServiceOrdersService.create.mockResolvedValue(expected);

      const result = await controller.create(dto as never);

      expect(mockServiceOrdersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      const expected = { data: [], total: 0, page: 1, limit: 10 };
      mockServiceOrdersService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(expected);
    });

    it('should pass valid status filter', async () => {
      mockServiceOrdersService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await controller.findAll(1, 10, ServiceOrderStatus.IN_PROGRESS);

      expect(mockServiceOrdersService.findAll).toHaveBeenCalledWith(
        1,
        10,
        ServiceOrderStatus.IN_PROGRESS,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });

    it('should pass valid priority filter', async () => {
      mockServiceOrdersService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await controller.findAll(1, 10, undefined, ServiceOrderPriority.URGENT);

      expect(mockServiceOrdersService.findAll).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        ServiceOrderPriority.URGENT,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });

    it('should pass mechanicId and customerId filters', async () => {
      mockServiceOrdersService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await controller.findAll(1, 10, undefined, undefined, 'cust-1', 'mech-1');

      expect(mockServiceOrdersService.findAll).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        'cust-1',
        'mech-1',
        undefined,
        undefined,
      );
    });
  });

  describe('findOne', () => {
    it('should return order by id', async () => {
      const expected = { id: 'order-1' };
      mockServiceOrdersService.findOne.mockResolvedValue(expected);

      const result = await controller.findOne('order-1');

      expect(mockServiceOrdersService.findOne).toHaveBeenCalledWith('order-1');
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should update service order', async () => {
      const expected = {
        id: 'order-1',
        status: ServiceOrderStatus.IN_PROGRESS,
      };
      mockServiceOrdersService.update.mockResolvedValue(expected);

      const result = await controller.update('order-1', {
        status: ServiceOrderStatus.IN_PROGRESS,
      } as never);

      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should remove order', async () => {
      mockServiceOrdersService.remove.mockResolvedValue(undefined);

      await controller.remove('order-1');

      expect(mockServiceOrdersService.remove).toHaveBeenCalledWith('order-1');
    });
  });

  describe('getStats', () => {
    it('should return order statistics', async () => {
      const expected = {
        total: 10,
        pending: 3,
        inProgress: 5,
        completed: 2,
        closed: 0,
        cancelled: 0,
      };
      mockServiceOrdersService.getStats.mockResolvedValue(expected);

      const result = await controller.getStats();

      expect(result).toEqual(expected);
    });
  });
});
