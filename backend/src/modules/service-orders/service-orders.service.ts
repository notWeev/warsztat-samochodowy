import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ServiceOrder,
  ServiceOrderStatus,
  ServiceOrderPriority,
} from './entities/service-order.entity';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { CustomersService } from '../customers/customers.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { UsersService } from '../users/user.service';

@Injectable()
export class ServiceOrdersService {
  constructor(
    @InjectRepository(ServiceOrder)
    private readonly repo: Repository<ServiceOrder>,
    private readonly customersService: CustomersService,
    private readonly vehiclesService: VehiclesService,
    private readonly usersService: UsersService,
  ) {}

  //  Generuje unikalny numer zlecenia (np. WS-2025-00001)
  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `WS-${year}-`;

    // Znajdź ostatnie zlecenie z tego roku
    const lastOrder = await this.repo
      .createQueryBuilder('order')
      .where('order.orderNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('order.createdAt', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastOrder) {
      const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
  }

  // Tworzy nowe zlecenie serwisowe
  async create(
    createServiceOrderDto: CreateServiceOrderDto,
  ): Promise<ServiceOrder> {
    // Walidacja - sprawdź czy klient istnieje
    const customer = await this.customersService.findOne(
      createServiceOrderDto.customerId,
    );
    if (!customer) {
      throw new BadRequestException('Klient o podanym ID nie istnieje');
    }

    // Walidacja - sprawdź czy pojazd istnieje
    const vehicle = await this.vehiclesService.findOne(
      createServiceOrderDto.vehicleId,
    );
    if (!vehicle) {
      throw new BadRequestException('Pojazd o podanym ID nie istnieje');
    }

    // Walidacja - sprawdź czy pojazd należy do klienta
    if (vehicle.customerId !== createServiceOrderDto.customerId) {
      throw new BadRequestException('Pojazd nie należy do tego klienta');
    }

    // Walidacja - sprawdź czy mechanik istnieje (jeśli został przypisany)
    if (createServiceOrderDto.assignedMechanicId) {
      const mechanic = await this.usersService.findById(
        createServiceOrderDto.assignedMechanicId,
      );
      if (!mechanic) {
        throw new BadRequestException('Mechanik o podanym ID nie istnieje');
      }
    }

    // Wygeneruj numer zlecenia
    const orderNumber = await this.generateOrderNumber();

    const serviceOrder = this.repo.create({
      ...createServiceOrderDto,
      orderNumber,
      priority: createServiceOrderDto.priority || ServiceOrderPriority.NORMAL,
      status: ServiceOrderStatus.PENDING,
    });

    return this.repo.save(serviceOrder);
  }

  // Pobiera wszystkie zlecenia z paginacją i filtrowaniem

  async findAll(
    page = 1,
    limit = 10,
    status?: ServiceOrderStatus,
    priority?: ServiceOrderPriority,
    customerId?: string,
    mechanicId?: string,
  ): Promise<{
    data: ServiceOrder[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.repo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.vehicle', 'vehicle')
      .leftJoinAndSelect('order.assignedMechanic', 'mechanic');

    // Filtrowanie po statusie
    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    // Filtrowanie po priorytecie
    if (priority) {
      queryBuilder.andWhere('order.priority = :priority', { priority });
    }

    // Filtrowanie po kliencie
    if (customerId) {
      queryBuilder.andWhere('order.customerId = :customerId', { customerId });
    }

    // Filtrowanie po mechaniku
    if (mechanicId) {
      queryBuilder.andWhere('order.assignedMechanicId = :mechanicId', {
        mechanicId,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  // Pobiera zlecenie po ID
  async findOne(id: string): Promise<ServiceOrder> {
    const order = await this.repo.findOne({
      where: { id },
      relations: ['customer', 'vehicle', 'assignedMechanic'],
    });

    if (!order) {
      throw new NotFoundException(`Zlecenie o ID ${id} nie istnieje`);
    }

    return order;
  }

  // Znajduje zlecenie po numerze
  async findByOrderNumber(orderNumber: string): Promise<ServiceOrder | null> {
    return this.repo.findOne({
      where: { orderNumber },
      relations: ['customer', 'vehicle', 'assignedMechanic'],
    });
  }

  // Aktualizuje zlecenie
  async update(
    id: string,
    updateServiceOrderDto: UpdateServiceOrderDto,
  ): Promise<ServiceOrder> {
    const order = await this.findOne(id);

    // Automatyczne obliczanie totalCost
    if (updateServiceOrderDto.laborCost !== undefined) {
      order.laborCost = updateServiceOrderDto.laborCost;
    }
    if (updateServiceOrderDto.partsCost !== undefined) {
      order.partsCost = updateServiceOrderDto.partsCost;
    }
    order.totalCost = Number(order.laborCost) + Number(order.partsCost);

    Object.assign(order, updateServiceOrderDto);
    return this.repo.save(order);
  }

  // Usuwa zlecenie
  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.repo.remove(order);
  }

  // Pobiera statystyki zleceń
  async getStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    closed: number;
    cancelled: number;
  }> {
    const total = await this.repo.count();
    const pending = await this.repo.count({
      where: { status: ServiceOrderStatus.PENDING },
    });
    const inProgress = await this.repo.count({
      where: { status: ServiceOrderStatus.IN_PROGRESS },
    });
    const completed = await this.repo.count({
      where: { status: ServiceOrderStatus.COMPLETED },
    });
    const closed = await this.repo.count({
      where: { status: ServiceOrderStatus.CLOSED },
    });
    const cancelled = await this.repo.count({
      where: { status: ServiceOrderStatus.CANCELLED },
    });

    return { total, pending, inProgress, completed, closed, cancelled };
  }
}
