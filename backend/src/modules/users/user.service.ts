import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async create(data: CreateUserDto) {
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

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  findByEmail(email: string, withPassword = false) {
    const qb = this.repo.createQueryBuilder('u').where('u.email = :email', {
      email: email.toLowerCase(),
    });
    if (withPassword) {
      qb.addSelect('u.passwordHash');
    }
    return qb.getOne();
  }

  async update(id: string, patch: Partial<User>) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, patch);
    return this.repo.save(user);
  }

  async remove(id: string) {
    await this.repo.delete({ id });
  }

  async list(where?: FindOptionsWhere<User>) {
    return this.repo.find({ where });
  }
}
