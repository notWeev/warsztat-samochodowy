import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle, VehicleStatus } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly repo: Repository<Vehicle>,
    private readonly customersService: CustomersService,
  ) {}

  //  Tworzy nowy pojazd
  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    // Sprawdź czy klient istnieje
    const customer = await this.customersService.findOne(
      createVehicleDto.customerId,
    );
    if (!customer) {
      throw new BadRequestException('Klient o podanym ID nie istnieje');
    }

    // Sprawdź unikalność VIN
    const existingVehicle = await this.repo.findOne({
      where: { vin: createVehicleDto.vin },
    });
    if (existingVehicle) {
      throw new BadRequestException('Pojazd z tym VIN już istnieje');
    }

    const vehicle = this.repo.create(createVehicleDto);
    return this.repo.save(vehicle);
  }

  //    Pobiera wszystkie pojazdy z paginacją i filtrowaniem
  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    customerId?: string,
    status?: VehicleStatus,
  ): Promise<{
    data: Vehicle[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.repo
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.customer', 'customer');

    // Wyszukiwanie po VIN, marce, modelu, rejestracji
    if (search) {
      queryBuilder.where(
        '(vehicle.vin ILIKE :search OR vehicle.brand ILIKE :search OR vehicle.model ILIKE :search OR vehicle.registrationNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filtrowanie po kliencie
    if (customerId) {
      queryBuilder.andWhere('vehicle.customerId = :customerId', {
        customerId,
      });
    }

    // Filtrowanie po statusie
    if (status) {
      queryBuilder.andWhere('vehicle.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .orderBy('vehicle.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  // Pobiera pojazd po ID
  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.repo.findOne({
      where: { id },
      relations: ['customer'],
    });

    if (!vehicle) {
      throw new NotFoundException(`Pojazd o ID ${id} nie istnieje`);
    }

    return vehicle;
  }

  // Znajduje pojazd po VIN

  async findByVin(vin: string): Promise<Vehicle | null> {
    return this.repo.findOne({
      where: { vin },
      relations: ['customer'],
    });
  }

  // Aktualizuje dane pojazdu
  async update(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    const vehicle = await this.findOne(id);

    Object.assign(vehicle, updateVehicleDto);
    return this.repo.save(vehicle);
  }

  // Usuwa pojazd
  async remove(id: string): Promise<void> {
    const vehicle = await this.findOne(id);
    await this.repo.remove(vehicle);
  }

  // Pobiera pojazdy konkretnego klienta
  async findByCustomer(customerId: string): Promise<Vehicle[]> {
    return this.repo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  // Pobiera statystyki pojazdów
  async getStats(): Promise<{
    total: number;
    active: number;
    sold: number;
    scrapped: number;
    inactive: number;
  }> {
    const total = await this.repo.count();
    const active = await this.repo.count({
      where: { status: VehicleStatus.ACTIVE },
    });
    const sold = await this.repo.count({
      where: { status: VehicleStatus.SOLD },
    });
    const scrapped = await this.repo.count({
      where: { status: VehicleStatus.SCRAPPED },
    });
    const inactive = await this.repo.count({
      where: { status: VehicleStatus.INACTIVE },
    });

    return { total, active, sold, scrapped, inactive };
  }
}
