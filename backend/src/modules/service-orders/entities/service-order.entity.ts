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
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { User } from '../../users/entities/user.entity';

export enum ServiceOrderStatus {
  PENDING = 'PENDING', // Oczekujące - nowe zlecenie
  SCHEDULED = 'SCHEDULED', // Zaplanowane - wyznaczono datę
  IN_PROGRESS = 'IN_PROGRESS', // W trakcie realizacji
  WAITING_FOR_PARTS = 'WAITING_FOR_PARTS', // Czeka na części
  COMPLETED = 'COMPLETED', // Ukończone - gotowe do odbioru
  CLOSED = 'CLOSED', // Zamknięte - klient odebrał
  CANCELLED = 'CANCELLED', // Anulowane
}

export enum ServiceOrderPriority {
  LOW = 'LOW', // Niski priorytet
  NORMAL = 'NORMAL', // Normalny
  HIGH = 'HIGH', // Wysoki
  URGENT = 'URGENT', // Pilne
}

@Entity({ name: 'service_orders' })
@Index('idx_service_orders_order_number', ['orderNumber'], { unique: true })
@Index('idx_service_orders_customer', ['customerId'])
@Index('idx_service_orders_vehicle', ['vehicleId'])
@Index('idx_service_orders_mechanic', ['assignedMechanicId'])
@Index('idx_service_orders_status', ['status'])
export class ServiceOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20, unique: true })
  orderNumber: string;

  // Relacje
  @ManyToOne(() => Customer, { eager: false })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'uuid' })
  customerId: string;

  @ManyToOne(() => Vehicle, { eager: false })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column({ type: 'uuid' })
  vehicleId: string;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'assignedMechanicId' })
  assignedMechanic?: User;

  @Column({ type: 'uuid', nullable: true })
  assignedMechanicId?: string;

  // Szczegóły zlecenia
  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ServiceOrderStatus,
    default: ServiceOrderStatus.PENDING,
  })
  status: ServiceOrderStatus;

  @Column({
    type: 'enum',
    enum: ServiceOrderPriority,
    default: ServiceOrderPriority.NORMAL,
  })
  priority: ServiceOrderPriority;

  // Daty
  @Column({ type: 'timestamp', nullable: true })
  scheduledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt?: Date;

  @Column({ type: 'int', nullable: true })
  mileageAtAcceptance?: number;

  // Koszty
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  laborCost: number; // Koszt robocizny

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  partsCost: number; // Koszt części

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalCost: number; // Całkowity koszt

  // Notatki
  @Column({ type: 'text', nullable: true })
  mechanicNotes?: string; // Notatki mechanika

  @Column({ type: 'text', nullable: true })
  internalNotes?: string; // Notatki wewnętrzne

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relacja do części użytych w zleceniu (dodamy w następnym module)
  // @OneToMany(() => ServiceOrderPart, (part) => part.serviceOrder)
  // parts: ServiceOrderPart[];
}
