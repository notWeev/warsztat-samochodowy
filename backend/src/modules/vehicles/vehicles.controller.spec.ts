import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { VehicleStatus } from './entities/vehicle.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

const mockVehiclesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByVin: jest.fn(),
  findByCustomer: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getStats: jest.fn(),
};

describe('VehiclesController', () => {
  let controller: VehiclesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiclesController],
      providers: [{ provide: VehiclesService, useValue: mockVehiclesService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<VehiclesController>(VehiclesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create vehicle', async () => {
      const dto = { customerId: 'cust-1', vin: 'VIN123', brand: 'Toyota' };
      const expected = { id: 'veh-1', ...dto };
      mockVehiclesService.create.mockResolvedValue(expected);

      const result = await controller.create(dto as never);

      expect(mockVehiclesService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return paginated vehicles', async () => {
      const expected = { data: [], total: 0, page: 1, limit: 10 };
      mockVehiclesService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(expected);
    });

    it('should pass valid status filter', async () => {
      mockVehiclesService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await controller.findAll(
        1,
        10,
        undefined,
        undefined,
        VehicleStatus.ACTIVE,
      );

      expect(mockVehiclesService.findAll).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        VehicleStatus.ACTIVE,
      );
    });

    it('should ignore invalid status filter', async () => {
      mockVehiclesService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await controller.findAll(1, 10, undefined, undefined, 'INVALID' as never);

      expect(mockVehiclesService.findAll).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        undefined,
      );
    });
  });

  describe('findByVin', () => {
    it('should find vehicle by VIN', async () => {
      const expected = { id: 'veh-1', vin: 'VIN123' };
      mockVehiclesService.findByVin.mockResolvedValue(expected);

      const result = await controller.findByVin('VIN123');

      expect(mockVehiclesService.findByVin).toHaveBeenCalledWith('VIN123');
      expect(result).toEqual(expected);
    });
  });

  describe('findByCustomer', () => {
    it('should return vehicles for customer', async () => {
      const expected = [{ id: 'veh-1', customerId: 'cust-1' }];
      mockVehiclesService.findByCustomer.mockResolvedValue(expected);

      const result = await controller.findByCustomer('cust-1');

      expect(mockVehiclesService.findByCustomer).toHaveBeenCalledWith('cust-1');
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should return vehicle by id', async () => {
      const expected = { id: 'veh-1' };
      mockVehiclesService.findOne.mockResolvedValue(expected);

      const result = await controller.findOne('veh-1');

      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should update vehicle', async () => {
      const expected = { id: 'veh-1', model: 'Yaris' };
      mockVehiclesService.update.mockResolvedValue(expected);

      const result = await controller.update('veh-1', {
        model: 'Yaris',
      } as never);

      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should remove vehicle', async () => {
      mockVehiclesService.remove.mockResolvedValue(undefined);

      await controller.remove('veh-1');

      expect(mockVehiclesService.remove).toHaveBeenCalledWith('veh-1');
    });
  });

  describe('getStats', () => {
    it('should return vehicle statistics', async () => {
      const expected = {
        total: 5,
        active: 4,
        sold: 1,
        scrapped: 0,
        inactive: 0,
      };
      mockVehiclesService.getStats.mockResolvedValue(expected);

      const result = await controller.getStats();

      expect(result).toEqual(expected);
    });
  });
});
