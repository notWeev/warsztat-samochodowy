import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Part, PartStatus, PartCategory } from './entities/part.entity';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

@Injectable()
export class PartsService {
  constructor(
    @InjectRepository(Part)
    private readonly repo: Repository<Part>,
  ) {}

  //  Automatycznie aktualizuje status części na podstawie stanu magazynowego
  private updatePartStatus(part: Part): void {
    if (part.quantityInStock === 0) {
      part.status = PartStatus.OUT_OF_STOCK;
    } else if (part.quantityInStock <= part.minStockLevel) {
      part.status = PartStatus.LOW_STOCK;
    } else {
      part.status = PartStatus.AVAILABLE;
    }
  }

  // Tworzy nową część
  async create(createPartDto: CreatePartDto): Promise<Part> {
    // Sprawdź unikalność numeru katalogowego
    const existing = await this.repo.findOne({
      where: { partNumber: createPartDto.partNumber },
    });

    if (existing) {
      throw new BadRequestException(
        'Część z tym numerem katalogowym już istnieje',
      );
    }

    const part = this.repo.create(createPartDto);

    // Automatycznie ustaw status na podstawie stanu
    this.updatePartStatus(part);

    return this.repo.save(part);
  }

  // Pobiera wszystkie części z paginacją i filtrowaniem
  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    category?: PartCategory,
    status?: PartStatus,
    lowStock?: boolean,
  ): Promise<{
    data: Part[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.repo.createQueryBuilder('part');

    // Wyszukiwanie po nazwie, numerze katalogowym, producencie
    if (search) {
      queryBuilder.where(
        '(part.name ILIKE :search OR part.partNumber ILIKE :search OR part.manufacturer ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filtrowanie po kategorii
    if (category) {
      queryBuilder.andWhere('part.category = :category', { category });
    }

    // Filtrowanie po statusie
    if (status) {
      queryBuilder.andWhere('part.status = :status', { status });
    }

    // Tylko części z niskim stanem
    if (lowStock) {
      queryBuilder.andWhere('part.quantityInStock <= part.minStockLevel');
    }

    const [data, total] = await queryBuilder
      .orderBy('part.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  // Pobiera część po ID
  async findOne(id: string): Promise<Part> {
    const part = await this.repo.findOne({ where: { id } });

    if (!part) {
      throw new NotFoundException(`Część o ID ${id} nie istnieje`);
    }

    return part;
  }

  // Znajduje część po numerze katalogowym
  async findByPartNumber(partNumber: string): Promise<Part | null> {
    return this.repo.findOne({ where: { partNumber } });
  }

  // Aktualizuje część
  async update(id: string, updatePartDto: UpdatePartDto): Promise<Part> {
    const part = await this.findOne(id);

    Object.assign(part, updatePartDto);

    // Automatycznie aktualizuj status jeśli zmieniono stan magazynowy
    if (updatePartDto.quantityInStock !== undefined) {
      this.updatePartStatus(part);
    }

    return this.repo.save(part);
  }

  // Usuwa część
  async remove(id: string): Promise<void> {
    const part = await this.findOne(id);
    await this.repo.remove(part);
  }

  // Pobiera części z niskim stanem magazynowym
  async getLowStockParts(): Promise<Part[]> {
    return this.repo
      .createQueryBuilder('part')
      .where('part.quantityInStock <= part.minStockLevel')
      .andWhere('part.status != :status', {
        status: PartStatus.DISCONTINUED,
      })
      .orderBy('part.quantityInStock', 'ASC')
      .getMany();
  }

  // Pobiera statystyki części
  async getStats(): Promise<{
    total: number;
    available: number;
    lowStock: number;
    outOfStock: number;
    discontinued: number;
    totalValue: number;
  }> {
    const total = await this.repo.count();
    const available = await this.repo.count({
      where: { status: PartStatus.AVAILABLE },
    });
    const lowStock = await this.repo.count({
      where: { status: PartStatus.LOW_STOCK },
    });
    const outOfStock = await this.repo.count({
      where: { status: PartStatus.OUT_OF_STOCK },
    });
    const discontinued = await this.repo.count({
      where: { status: PartStatus.DISCONTINUED },
    });

    // Oblicz całkowitą wartość magazynu
    const parts = await this.repo.find();
    const totalValue = parts.reduce(
      (sum, part) => sum + Number(part.sellingPrice) * part.quantityInStock,
      0,
    );

    return {
      total,
      available,
      lowStock,
      outOfStock,
      discontinued,
      totalValue,
    };
  }

  // Zwiększa stan magazynowy (np. po zakupie)
  async increaseStock(id: string, quantity: number): Promise<Part> {
    const part = await this.findOne(id);
    part.quantityInStock += quantity;
    this.updatePartStatus(part);
    return this.repo.save(part);
  }

  // Zmniejsza stan magazynowy (np. po użyciu w zleceniu)
  async decreaseStock(id: string, quantity: number): Promise<Part> {
    const part = await this.findOne(id);

    if (part.quantityInStock < quantity) {
      throw new BadRequestException(
        `Niewystarczająca ilość na stanie. Dostępne: ${part.quantityInStock}`,
      );
    }

    part.quantityInStock -= quantity;
    this.updatePartStatus(part);
    return this.repo.save(part);
  }
}
