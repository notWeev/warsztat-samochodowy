import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL', // Osoba prywatna
  BUSINESS = 'BUSINESS', // Firma
}

@Entity({ name: 'customers' })
@Index('idx_customers_email', ['email'])
@Index('idx_customers_phone', ['phone'])
@Index('idx_customers_pesel', ['pesel'])
@Index('idx_customers_nip', ['nip'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: CustomerType,
    default: CustomerType.INDIVIDUAL,
  })
  type: CustomerType;

  // Dane osobowe / firmy
  @Column({ length: 60 })
  firstName: string;

  @Column({ length: 60 })
  lastName: string;

  @Column({ length: 120, nullable: true })
  email?: string;

  @Column({ length: 20 })
  phone: string;

  // Adres
  @Column({ length: 100, nullable: true })
  street?: string;

  @Column({ length: 10, nullable: true })
  postalCode?: string;

  @Column({ length: 60, nullable: true })
  city?: string;

  // Dane identyfikacyjne
  @Column({ length: 11, nullable: true, unique: true })
  pesel?: string; // Dla osób prywatnych

  @Column({ length: 10, nullable: true, unique: true })
  nip?: string; // Dla firm

  @Column({ length: 200, nullable: true })
  companyName?: string; // Nazwa firmy (jeśli type=BUSINESS)

  // Notatki
  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.customer)
  vehicles: Vehicle[];
}
