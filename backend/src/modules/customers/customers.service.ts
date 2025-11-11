import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Customer, CustomerType } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
  ) {}

  /**
   * Tworzy nowego klienta
   */
  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // Walidacja biznesowa
    if (
      createCustomerDto.type === CustomerType.BUSINESS &&
      !createCustomerDto.nip
    ) {
      throw new BadRequestException('Firma musi mieć NIP');
    }

    if (
      createCustomerDto.type === CustomerType.INDIVIDUAL &&
      !createCustomerDto.pesel
    )
      if (createCustomerDto.pesel) {
        // Sprawdź unikalność PESEL/NIP
        const existingByPesel = await this.repo.findOne({
          where: { pesel: createCustomerDto.pesel },
        });
        if (existingByPesel) {
          throw new BadRequestException('Klient z tym PESEL już istnieje');
        }
      }

    if (createCustomerDto.nip) {
      const existingByNip = await this.repo.findOne({
        where: { nip: createCustomerDto.nip },
      });
      if (existingByNip) {
        throw new BadRequestException('Klient z tym NIP już istnieje');
      }
    }

    const customer = this.repo.create(createCustomerDto);
    return this.repo.save(customer);
  }

  /**
   * Pobiera wszystkich klientów z paginacją i filtrowaniem
   */
  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    type?: CustomerType,
  ): Promise<{
    data: Customer[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: FindOptionsWhere<Customer> = {};

    // Filtrowanie po typie
    if (type) {
      where.type = type;
    }

    const queryBuilder = this.repo.createQueryBuilder('customer');

    // Wyszukiwanie po imieniu, nazwisku, telefonie, email
    if (search) {
      queryBuilder.where(
        '(customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR customer.phone ILIKE :search OR customer.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type) {
      queryBuilder.andWhere('customer.type = :type', { type });
    }

    const [data, total] = await queryBuilder
      .orderBy('customer.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * Pobiera klienta po ID
   */
  async findOne(id: string): Promise<Customer> {
    const customer = await this.repo.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Klient o ID ${id} nie istnieje`);
    }
    return customer;
  }

  /**
   * Aktualizuje dane klienta
   */
  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.findOne(id);

    // Sprawdź unikalność PESEL/NIP przy aktualizacji
    if (updateCustomerDto.pesel && updateCustomerDto.pesel !== customer.pesel) {
      const existingByPesel = await this.repo.findOne({
        where: { pesel: updateCustomerDto.pesel },
      });
      if (existingByPesel) {
        throw new BadRequestException('Klient z tym PESEL już istnieje');
      }
    }

    if (updateCustomerDto.nip && updateCustomerDto.nip !== customer.nip) {
      const existingByNip = await this.repo.findOne({
        where: { nip: updateCustomerDto.nip },
      });
      if (existingByNip) {
        throw new BadRequestException('Klient z tym NIP już istnieje');
      }
    }

    Object.assign(customer, updateCustomerDto);
    return this.repo.save(customer);
  }

  /**
   * Usuwa klienta (soft delete - możesz rozszerzyć)
   */
  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.repo.remove(customer);
  }

  /**
   * Pobiera statystyki klientów
   */
  async getStats(): Promise<{
    total: number;
    individual: number;
    business: number;
  }> {
    const total = await this.repo.count();
    const individual = await this.repo.count({
      where: { type: CustomerType.INDIVIDUAL },
    });
    const business = await this.repo.count({
      where: { type: CustomerType.BUSINESS },
    });

    return { total, individual, business };
  }
}
