import { DataSource } from 'typeorm';
import {
  User,
  UserRole,
  UserStatus,
} from '../../modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@warsztat.pl' },
  });

  if (existingAdmin) {
    console.log('Seed users already exist, skipping...');
    return;
  }

  console.log('Seeding test users...');

  const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10);

  // Lista użytkowników testowych
  const testUsers = [
    {
      firstName: 'Admin',
      lastName: 'Systemu',
      email: 'admin@warsztat.pl',
      phone: '123456789',
      password: 'Admin123!',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    {
      firstName: 'Jan',
      lastName: 'Kowalski',
      email: 'manager@warsztat.pl',
      phone: '321321321',
      password: 'Manager123!',
      role: UserRole.MANAGER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    {
      firstName: 'Piotr',
      lastName: 'Nowak',
      email: 'mechanik@warsztat.pl',
      phone: '987654321',
      password: 'Mechanik123!',
      role: UserRole.MECHANIC,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    {
      firstName: 'Anna',
      lastName: 'Kowalska',
      email: 'recepcja@warsztat.pl',
      phone: '123123123',
      password: 'Recepcja123!',
      role: UserRole.RECEPTION,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    {
      firstName: 'Marek',
      lastName: 'Wróblewski',
      email: 'm.wroblewski@warsztat.pl',
      phone: '111222333',
      password: 'Mechanik123!',
      role: UserRole.MECHANIC,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    {
      firstName: 'Krzysztof',
      lastName: 'Jabłoński',
      email: 'k.jablonski@warsztat.pl',
      phone: '444555666',
      password: 'Mechanik123!',
      role: UserRole.MECHANIC,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    {
      firstName: 'Tomasz',
      lastName: 'Lewandowski',
      email: 't.lewandowski@warsztat.pl',
      phone: '777888999',
      password: 'Mechanik123!',
      role: UserRole.MECHANIC,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    {
      firstName: 'Katarzyna',
      lastName: 'Wiśniewska',
      email: 'k.wisniewska@warsztat.pl',
      phone: '600700800',
      password: 'Manager123!',
      role: UserRole.MANAGER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    {
      firstName: 'Monika',
      lastName: 'Dąbrowska',
      email: 'm.dabrowska@warsztat.pl',
      phone: '501601701',
      password: 'Recepcja123!',
      role: UserRole.RECEPTION,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    {
      firstName: 'Zbigniew',
      lastName: 'Adamczyk',
      email: 'z.adamczyk@warsztat.pl',
      phone: '900800700',
      password: 'Mechanik123!',
      role: UserRole.MECHANIC,
      status: UserStatus.INACTIVE,
      emailVerified: false,
    },
  ];

  // Utwórz użytkowników
  for (const userData of testUsers) {
    const passwordHash = await bcrypt.hash(userData.password, bcryptRounds);

    const user = userRepository.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      passwordHash,
      role: userData.role,
      status: userData.status,
      emailVerified: userData.emailVerified,
    });

    await userRepository.save(user);
    console.log(`Created ${userData.role}: ${userData.email}`);
  }

  console.log('User seeding completed!');
}
