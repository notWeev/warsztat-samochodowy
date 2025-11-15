import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';

export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  SCRAPPED = 'SCRAPPED',
  INACTIVE = 'INACTIVE',
}

export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  LPG = 'LPG',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
  PLUGIN_HYBRID = 'PLUGIN_HYBRID',
}

@Entity({ name: 'vehicles' })
@Index('idx_vehicles_vin', ['vin'], { unique: true })
@Index('idx_vehicles_registration', ['registrationNumber'])
@Index('idx_vehicles_customer', ['customerId'])
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relacja do klienta (właściciela pojazdu)
  @ManyToOne(() => Customer, { eager: false })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'uuid' })
  customerId: string;

  // Dane identyfikacyjne pojazdu
  @Column({ length: 17, unique: true })
  vin: string;

  @Column({ length: 50 })
  brand: string;

  @Column({ length: 50 })
  model: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ length: 15, nullable: true })
  registrationNumber?: string;

  @Column({
    type: 'enum',
    enum: FuelType,
    nullable: true,
  })
  fuelType?: FuelType;

  @Column({ type: 'int', nullable: true })
  engineCapacity?: number;

  @Column({ type: 'int', nullable: true })
  enginePower?: number;

  @Column({ type: 'int', default: 0 })
  mileage: number;

  @Column({ length: 30, nullable: true })
  color?: string;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.ACTIVE,
  })
  status: VehicleStatus;

  // Notatki
  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
