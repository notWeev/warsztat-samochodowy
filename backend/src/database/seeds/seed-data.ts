import { DataSource } from 'typeorm';
import {
  Customer,
  CustomerType,
} from '../../modules/customers/entities/customer.entity';
import {
  Vehicle,
  VehicleStatus,
  FuelType,
} from '../../modules/vehicles/entities/vehicle.entity';
import {
  ServiceOrder,
  ServiceOrderStatus,
  ServiceOrderPriority,
} from '../../modules/service-orders/entities/service-order.entity';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../modules/users/entities/user.entity';

export async function seedDatabase(dataSource: DataSource) {
  console.log('Rozpoczynam seed bazy danych...');

  const customerRepo = dataSource.getRepository(Customer);
  const vehicleRepo = dataSource.getRepository(Vehicle);
  const serviceOrderRepo = dataSource.getRepository(ServiceOrder);
  const userRepo = dataSource.getRepository(User);

  // 1. Sprawdź czy już istnieją dane
  const existingCustomers = await customerRepo.count();
  if (existingCustomers > 0) {
    console.log('Baza już zawiera dane. Pomijam seed.');
    return;
  }

  // 2. Utwórz mechanika (jeśli nie istnieje)
  let mechanic = await userRepo.findOne({
    where: { email: 'mechanic@warsztat.pl' },
  });
  if (!mechanic) {
    const hashedPassword = await bcrypt.hash('mechanic123', 12);
    mechanic = userRepo.create({
      email: 'mechanic@warsztat.pl',
      firstName: 'Janusz',
      lastName: 'Mechanik',
      passwordHash: hashedPassword,
      role: UserRole.MECHANIC,
      phone: '+48 600 100 200',
    });
    await userRepo.save(mechanic);
    console.log('Utworzono mechanika');
  }

  // 3. Utwórz klientów
  const customers = [
    {
      type: CustomerType.INDIVIDUAL,
      firstName: 'Jan',
      lastName: 'Kowalski',
      email: 'jan.kowalski@example.com',
      phone: '+48 500 100 200',
      street: 'ul. Kwiatowa 15',
      postalCode: '00-001',
      city: 'Warszawa',
      pesel: '90010112345',
    },
    {
      type: CustomerType.INDIVIDUAL,
      firstName: 'Anna',
      lastName: 'Nowak',
      email: 'anna.nowak@example.com',
      phone: '+48 600 200 300',
      street: 'ul. Słoneczna 42',
      postalCode: '02-500',
      city: 'Warszawa',
    },
    {
      type: CustomerType.BUSINESS,
      firstName: 'Piotr',
      lastName: 'Wiśniewski',
      email: 'p.wisniewski@firma.pl',
      phone: '+48 700 300 400',
      companyName: 'TransBud Sp. z o.o.',
      nip: '1234567890',
      street: 'ul. Przemysłowa 10',
      postalCode: '01-100',
      city: 'Warszawa',
    },
    {
      type: CustomerType.INDIVIDUAL,
      firstName: 'Maria',
      lastName: 'Zielińska',
      phone: '+48 510 400 500',
      city: 'Warszawa',
    },
    {
      type: CustomerType.INDIVIDUAL,
      firstName: 'Tomasz',
      lastName: 'Kaczmarek',
      email: 'tkaczmarek@example.com',
      phone: '+48 520 500 600',
      street: 'ul. Długa 88',
      postalCode: '03-200',
      city: 'Warszawa',
    },
  ];

  const savedCustomers = await customerRepo.save(customers);
  console.log(`Utworzono ${savedCustomers.length} klientów`);

  // 4. Utwórz pojazdy
  const vehicles = [
    {
      customer: savedCustomers[0],
      customerId: savedCustomers[0].id,
      vin: '1HGBH41JXMN109186',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2018,
      registrationNumber: 'WA 12345',
      fuelType: FuelType.PETROL,
      engineCapacity: 1600,
      enginePower: 132,
      mileage: 85000,
      color: 'Srebrny',
      status: VehicleStatus.ACTIVE,
    },
    {
      customer: savedCustomers[1],
      customerId: savedCustomers[1].id,
      vin: 'WVWZZZ1KZBW123456',
      brand: 'Volkswagen',
      model: 'Golf',
      year: 2020,
      registrationNumber: 'WA 67890',
      fuelType: FuelType.DIESEL,
      engineCapacity: 2000,
      enginePower: 150,
      mileage: 45000,
      color: 'Czarny',
      status: VehicleStatus.ACTIVE,
    },
    {
      customer: savedCustomers[2],
      customerId: savedCustomers[2].id,
      vin: 'WBA3A5G59ENS52345',
      brand: 'BMW',
      model: '3 Series',
      year: 2019,
      registrationNumber: 'WA 11111',
      fuelType: FuelType.DIESEL,
      engineCapacity: 2000,
      enginePower: 190,
      mileage: 120000,
      color: 'Biały',
      status: VehicleStatus.ACTIVE,
    },
    {
      customer: savedCustomers[3],
      customerId: savedCustomers[3].id,
      vin: 'SJNFAAZE1U1234567',
      brand: 'Nissan',
      model: 'Qashqai',
      year: 2021,
      registrationNumber: 'WA 22222',
      fuelType: FuelType.PETROL,
      engineCapacity: 1300,
      enginePower: 140,
      mileage: 25000,
      color: 'Czerwony',
      status: VehicleStatus.ACTIVE,
    },
    {
      customer: savedCustomers[4],
      customerId: savedCustomers[4].id,
      vin: 'JM1BK32F781234567',
      brand: 'Mazda',
      model: 'CX-5',
      year: 2022,
      registrationNumber: 'WA 33333',
      fuelType: FuelType.HYBRID,
      engineCapacity: 2500,
      enginePower: 194,
      mileage: 15000,
      color: 'Niebieski',
      status: VehicleStatus.ACTIVE,
    },
  ];

  const savedVehicles = await vehicleRepo.save(vehicles);
  console.log(`Utworzono ${savedVehicles.length} pojazdów`);

  // 5. Utwórz zlecenia serwisowe
  const now = new Date();
  const serviceOrders = [
    {
      orderNumber: 'ZL-2026-001',
      customer: savedCustomers[0],
      customerId: savedCustomers[0].id,
      vehicle: savedVehicles[0],
      vehicleId: savedVehicles[0].id,
      assignedMechanic: mechanic,
      assignedMechanicId: mechanic.id,
      description: 'Wymiana oleju i filtrów, kontrola zawieszenia',
      status: ServiceOrderStatus.IN_PROGRESS,
      priority: ServiceOrderPriority.HIGH,
      scheduledAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      startedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      mileageAtAcceptance: 85000,
      laborCost: 200.0,
      partsCost: 350.0,
      totalCost: 550.0,
      mechanicNotes: 'Zawieszenie w dobrym stanie',
    },
    {
      orderNumber: 'ZL-2026-002',
      customer: savedCustomers[1],
      customerId: savedCustomers[1].id,
      vehicle: savedVehicles[1],
      vehicleId: savedVehicles[1].id,
      description: 'Przegląd roczny + wymiana klocków hamulcowych',
      status: ServiceOrderStatus.PENDING,
      priority: ServiceOrderPriority.NORMAL,
      scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      mileageAtAcceptance: 45000,
      laborCost: 150.0,
      partsCost: 280.0,
      totalCost: 430.0,
    },
    {
      orderNumber: 'ZL-2026-003',
      customer: savedCustomers[2],
      customerId: savedCustomers[2].id,
      vehicle: savedVehicles[2],
      vehicleId: savedVehicles[2].id,
      assignedMechanic: mechanic,
      assignedMechanicId: mechanic.id,
      description: 'Naprawa klimatyzacji, uzupełnienie płynu chłodzącego',
      status: ServiceOrderStatus.COMPLETED,
      priority: ServiceOrderPriority.URGENT,
      scheduledAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      startedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      mileageAtAcceptance: 120000,
      laborCost: 300.0,
      partsCost: 850.0,
      totalCost: 1150.0,
      mechanicNotes: 'Wymieniono kompresor klimatyzacji',
    },
    {
      orderNumber: 'ZL-2026-004',
      customer: savedCustomers[3],
      customerId: savedCustomers[3].id,
      vehicle: savedVehicles[3],
      vehicleId: savedVehicles[3].id,
      description: 'Diagnostyka komputerowa + wymiana świec zapłonowych',
      status: ServiceOrderStatus.SCHEDULED,
      priority: ServiceOrderPriority.LOW,
      scheduledAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      mileageAtAcceptance: 25000,
      laborCost: 100.0,
      partsCost: 180.0,
      totalCost: 280.0,
    },
    {
      orderNumber: 'ZL-2026-005',
      customer: savedCustomers[4],
      customerId: savedCustomers[4].id,
      vehicle: savedVehicles[4],
      vehicleId: savedVehicles[4].id,
      assignedMechanic: mechanic,
      assignedMechanicId: mechanic.id,
      description: 'Wymiana tarcz i klocków hamulcowych wszystkie osie',
      status: ServiceOrderStatus.WAITING_FOR_PARTS,
      priority: ServiceOrderPriority.HIGH,
      scheduledAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      startedAt: new Date(),
      mileageAtAcceptance: 15000,
      laborCost: 400.0,
      partsCost: 1200.0,
      totalCost: 1600.0,
      mechanicNotes: 'Oczekiwanie na dostawę tarcz hamulcowych',
    },
  ];

  const savedOrders = await serviceOrderRepo.save(serviceOrders);
  console.log(`Utworzono ${savedOrders.length} zleceń serwisowych`);

  console.log('Seed zakończony pomyślnie!');
}
