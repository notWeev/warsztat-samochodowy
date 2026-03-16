import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PartsService } from './parts.service';
import { Part, PartStatus, PartCategory } from './entities/part.entity';

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

const createMockQueryBuilder = (data: Part[] = [], total = 0) => ({
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([data, total]),
  getMany: jest.fn().mockResolvedValue(data),
});

const buildPart = (overrides: Partial<Part> = {}): Part =>
  ({
    id: 'part-1',
    partNumber: 'PN-001',
    name: 'Filtr oleju',
    category: PartCategory.FILTERS,
    quantityInStock: 10,
    minStockLevel: 5,
    status: PartStatus.AVAILABLE,
    sellingPrice: 50,
    ...overrides,
  }) as Part;

describe('PartsService', () => {
  let service: PartsService;
  let repository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartsService,
        {
          provide: getRepositoryToken(Part),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<PartsService>(PartsService);
    repository = module.get<MockRepository>(getRepositoryToken(Part));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create part with AVAILABLE status when stock > minStockLevel', async () => {
      const dto = {
        partNumber: 'PN-001',
        name: 'Filtr oleju',
        category: PartCategory.FILTERS,
        quantityInStock: 10,
        minStockLevel: 5,
        sellingPrice: 50,
      };
      const mockPart = buildPart({ ...dto, status: PartStatus.AVAILABLE });

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockPart);
      repository.save.mockResolvedValue(mockPart);

      const result = await service.create(dto as never);

      expect(result.status).toBe(PartStatus.AVAILABLE);
    });

    it('should create part with LOW_STOCK status when stock <= minStockLevel', async () => {
      const dto = {
        partNumber: 'PN-002',
        name: 'Klocki hamulcowe',
        category: PartCategory.BRAKES,
        quantityInStock: 3,
        minStockLevel: 5,
        sellingPrice: 120,
      };
      const mockPart = buildPart({ ...dto, status: PartStatus.LOW_STOCK });
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockPart);
      repository.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.create(dto as never);

      expect(result.status).toBe(PartStatus.LOW_STOCK);
    });

    it('should create part with OUT_OF_STOCK status when stock is 0', async () => {
      const dto = {
        partNumber: 'PN-003',
        name: 'Świeca zapłonowa',
        category: PartCategory.ENGINE,
        quantityInStock: 0,
        minStockLevel: 5,
        sellingPrice: 30,
      };
      const mockPart = buildPart({ ...dto, status: PartStatus.OUT_OF_STOCK });
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockPart);
      repository.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.create(dto as never);

      expect(result.status).toBe(PartStatus.OUT_OF_STOCK);
    });

    it('should throw BadRequestException when partNumber already exists', async () => {
      repository.findOne.mockResolvedValue({
        id: 'existing',
        partNumber: 'PN-001',
      });

      await expect(
        service.create({ partNumber: 'PN-001' } as never),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated parts', async () => {
      const mockParts = [buildPart()];
      const mockQB = createMockQueryBuilder(mockParts, 1);
      repository.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.findAll(1, 10);

      expect(result.data).toEqual(mockParts);
      expect(result.total).toBe(1);
    });

    it('should apply search filter across name, partNumber, manufacturer', async () => {
      const mockQB = createMockQueryBuilder([], 0);
      repository.createQueryBuilder.mockReturnValue(mockQB);

      await service.findAll(1, 10, 'filtr');

      expect(mockQB.where).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.objectContaining({ search: '%filtr%' }),
      );
    });

    it('should filter by category', async () => {
      const mockQB = createMockQueryBuilder([], 0);
      repository.createQueryBuilder.mockReturnValue(mockQB);

      await service.findAll(1, 10, undefined, PartCategory.FILTERS);

      expect(mockQB.andWhere).toHaveBeenCalledWith(
        'part.category = :category',
        { category: PartCategory.FILTERS },
      );
    });

    it('should filter by status', async () => {
      const mockQB = createMockQueryBuilder([], 0);
      repository.createQueryBuilder.mockReturnValue(mockQB);

      await service.findAll(1, 10, undefined, undefined, PartStatus.LOW_STOCK);

      expect(mockQB.andWhere).toHaveBeenCalledWith('part.status = :status', {
        status: PartStatus.LOW_STOCK,
      });
    });

    it('should filter low stock parts', async () => {
      const mockQB = createMockQueryBuilder([], 0);
      repository.createQueryBuilder.mockReturnValue(mockQB);

      await service.findAll(1, 10, undefined, undefined, undefined, true);

      expect(mockQB.andWhere).toHaveBeenCalledWith(
        'part.quantityInStock <= part.minStockLevel',
      );
    });
  });

  describe('findOne', () => {
    it('should return part when found', async () => {
      const mockPart = buildPart();
      repository.findOne.mockResolvedValue(mockPart);

      const result = await service.findOne('part-1');

      expect(result).toEqual(mockPart);
    });

    it('should throw NotFoundException when part not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update status when quantityInStock changes', async () => {
      const mockPart = buildPart({ quantityInStock: 10, minStockLevel: 5 });
      repository.findOne.mockResolvedValue(mockPart);
      repository.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.update('part-1', { quantityInStock: 2 });

      expect(result.status).toBe(PartStatus.LOW_STOCK);
    });

    it('should set OUT_OF_STOCK when quantity drops to 0', async () => {
      const mockPart = buildPart({ quantityInStock: 5, minStockLevel: 3 });
      repository.findOne.mockResolvedValue(mockPart);
      repository.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.update('part-1', { quantityInStock: 0 });

      expect(result.status).toBe(PartStatus.OUT_OF_STOCK);
    });
  });

  describe('increaseStock', () => {
    it('should increase quantity and update status', async () => {
      const mockPart = buildPart({
        quantityInStock: 3,
        minStockLevel: 5,
        status: PartStatus.LOW_STOCK,
      });
      repository.findOne.mockResolvedValue(mockPart);
      repository.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.increaseStock('part-1', 10);

      expect(result.quantityInStock).toBe(13);
      expect(result.status).toBe(PartStatus.AVAILABLE);
    });
  });

  describe('decreaseStock', () => {
    it('should decrease quantity and update status', async () => {
      const mockPart = buildPart({ quantityInStock: 10, minStockLevel: 5 });
      repository.findOne.mockResolvedValue(mockPart);
      repository.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.decreaseStock('part-1', 8);

      expect(result.quantityInStock).toBe(2);
      expect(result.status).toBe(PartStatus.LOW_STOCK);
    });

    it('should throw BadRequestException when insufficient stock', async () => {
      const mockPart = buildPart({ quantityInStock: 2 });
      repository.findOne.mockResolvedValue(mockPart);

      await expect(service.decreaseStock('part-1', 5)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should remove part successfully', async () => {
      const mockPart = buildPart();
      repository.findOne.mockResolvedValue(mockPart);
      repository.remove.mockResolvedValue(undefined);

      await service.remove('part-1');

      expect(repository.remove).toHaveBeenCalledWith(mockPart);
    });
  });
});
