import { Test, TestingModule } from '@nestjs/testing';
import { PartsController } from './parts.controller';
import { PartsService } from './parts.service';
import { PartCategory } from './entities/part.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

const mockPartsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByPartNumber: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getLowStockParts: jest.fn(),
  getStats: jest.fn(),
  increaseStock: jest.fn(),
  decreaseStock: jest.fn(),
};

describe('PartsController', () => {
  let controller: PartsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartsController],
      providers: [{ provide: PartsService, useValue: mockPartsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PartsController>(PartsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create part', async () => {
      const dto = {
        partNumber: 'PN-001',
        name: 'Filtr oleju',
        category: PartCategory.FILTERS,
      };
      const expected = { id: 'part-1', ...dto };
      mockPartsService.create.mockResolvedValue(expected);

      const result = await controller.create(dto as never);

      expect(mockPartsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return paginated parts', async () => {
      const expected = { data: [], total: 0, page: 1, limit: 10 };
      mockPartsService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(expected);
    });

    it('should pass valid category filter', async () => {
      mockPartsService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await controller.findAll(1, 10, undefined, PartCategory.BRAKES);

      expect(mockPartsService.findAll).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        PartCategory.BRAKES,
        undefined,
        false,
      );
    });

    it('should ignore invalid category filter', async () => {
      mockPartsService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await controller.findAll(1, 10, undefined, 'INVALID' as never);

      expect(mockPartsService.findAll).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        undefined,
        false,
      );
    });

    it('should pass lowStock=true filter when query param is "true"', async () => {
      mockPartsService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await controller.findAll(1, 10, undefined, undefined, undefined, 'true');

      expect(mockPartsService.findAll).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        undefined,
        true,
      );
    });
  });

  describe('getLowStockParts', () => {
    it('should return low stock parts', async () => {
      const expected = [{ id: 'part-1', quantityInStock: 2 }];
      mockPartsService.getLowStockParts.mockResolvedValue(expected);

      const result = await controller.getLowStockParts();

      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should return part by id', async () => {
      const expected = { id: 'part-1' };
      mockPartsService.findOne.mockResolvedValue(expected);

      const result = await controller.findOne('part-1');

      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should update part', async () => {
      const expected = { id: 'part-1', quantityInStock: 20 };
      mockPartsService.update.mockResolvedValue(expected);

      const result = await controller.update('part-1', {
        quantityInStock: 20,
      } as never);

      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should remove part', async () => {
      mockPartsService.remove.mockResolvedValue(undefined);

      await controller.remove('part-1');

      expect(mockPartsService.remove).toHaveBeenCalledWith('part-1');
    });
  });

  describe('getStats', () => {
    it('should return parts statistics', async () => {
      const expected = {
        total: 50,
        available: 40,
        lowStock: 5,
        outOfStock: 3,
        discontinued: 2,
        totalValue: 10000,
      };
      mockPartsService.getStats.mockResolvedValue(expected);

      const result = await controller.getStats();

      expect(result).toEqual(expected);
    });
  });
});
