import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    const passwordHash = await bcrypt.hash(
      data.password,
      parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),
    );

    const user = this.repo.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      passwordHash,
      role: data.role ?? UserRole.RECEPTION,
    });

    return this.repo.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByEmail(email: string, withPassword = false): Promise<User | null> {
    const qb = this.repo.createQueryBuilder('u').where('u.email = :email', {
      email: email.toLowerCase(),
    });

    if (withPassword) {
      qb.addSelect('u.passwordHash');
    }

    return qb.getOne();
  }

  async update(id: string, patch: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`Użytkownik o ID ${id} nie istnieje`);
    }

    Object.assign(user, patch);
    return this.repo.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`Użytkownik o ID ${id} nie istnieje`);
    }

    // Soft delete - zmień status zamiast usuwać
    await this.update(id, { status: UserStatus.INACTIVE });
  }

  async list(where?: FindOptionsWhere<User>): Promise<User[]> {
    return this.repo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async listPaginated(
    page = 1,
    limit = 10,
    where?: FindOptionsWhere<User>,
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }
}
