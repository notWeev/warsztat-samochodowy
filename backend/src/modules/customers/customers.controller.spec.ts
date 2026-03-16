import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CustomerType } from './entities/customer.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

const mockCustomersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getStats: jest.fn(),
};

describe('CustomersController', () => {
  let controller: CustomersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        { provide: CustomersService, useValue: mockCustomersService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CustomersController>(CustomersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create customer', async () => {
      const dto = { firstName: 'Jan', type: CustomerType.INDIVIDUAL };
      const expected = { id: 'cust-1', ...dto };
      mockCustomersService.create.mockResolvedValue(expected);

      const result = await controller.create(dto as never);

      expect(mockCustomersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return paginated customers', async () => {
      const expected = { data: [], total: 0, page: 1, limit: 10 };
      mockCustomersService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(expected);
    });

    it('should pass valid type filter', async () => {
      mockCustomersService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await controller.findAll(1, 10, undefined, CustomerType.BUSINESS);

      expect(mockCustomersService.findAll).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        CustomerType.BUSINESS,
      );
    });

    it('should ignore invalid type filter', async () => {
      mockCustomersService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await controller.findAll(1, 10, undefined, 'INVALID' as never);

      expect(mockCustomersService.findAll).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
      );
    });

    it('should pass search parameter', async () => {
      mockCustomersService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await controller.findAll(1, 10, 'kowalski');

      expect(mockCustomersService.findAll).toHaveBeenCalledWith(
        1,
        10,
        'kowalski',
        undefined,
      );
    });
  });

  describe('getStats', () => {
    it('should return customer statistics', async () => {
      const expected = { total: 10, individual: 7, business: 3 };
      mockCustomersService.getStats.mockResolvedValue(expected);

      const result = await controller.getStats();

      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should return customer by id', async () => {
      const expected = { id: 'cust-1', firstName: 'Jan' };
      mockCustomersService.findOne.mockResolvedValue(expected);

      const result = await controller.findOne('cust-1');

      expect(mockCustomersService.findOne).toHaveBeenCalledWith('cust-1');
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should update customer', async () => {
      const expected = { id: 'cust-1', firstName: 'Janusz' };
      mockCustomersService.update.mockResolvedValue(expected);

      const result = await controller.update('cust-1', {
        firstName: 'Janusz',
      } as never);

      expect(mockCustomersService.update).toHaveBeenCalledWith('cust-1', {
        firstName: 'Janusz',
      });
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should remove customer', async () => {
      mockCustomersService.remove.mockResolvedValue(undefined);

      await controller.remove('cust-1');

      expect(mockCustomersService.remove).toHaveBeenCalledWith('cust-1');
    });
  });
});
