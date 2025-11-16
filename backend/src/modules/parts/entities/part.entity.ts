import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ServiceOrderPart } from '../../service-order-parts/entities/service-order-part.entity';

export enum PartCategory {
  ENGINE = 'ENGINE',
  BRAKES = 'BRAKES',
  SUSPENSION = 'SUSPENSION',
  ELECTRICAL = 'ELECTRICAL',
  TRANSMISSION = 'TRANSMISSION',
  EXHAUST = 'EXHAUST',
  FILTERS = 'FILTERS',
  FLUIDS = 'FLUIDS',
  TIRES = 'TIRES',
  BODYWORK = 'BODYWORK',
  INTERIOR = 'INTERIOR',
  OTHER = 'OTHER',
}

export enum PartStatus {
  AVAILABLE = 'AVAILABLE',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED',
}

@Entity({ name: 'parts' })
@Index('idx_parts_part_number', ['partNumber'], { unique: true })
@Index('idx_parts_name', ['name'])
@Index('idx_parts_category', ['category'])
@Index('idx_parts_status', ['status'])
export class Part {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  partNumber: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: PartCategory,
    default: PartCategory.OTHER,
  })
  category: PartCategory;

  @Column({ length: 100, nullable: true })
  manufacturer?: string;

  @Column({ length: 100, nullable: true })
  brand?: string;

  // Dane cenowe
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  purchasePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sellingPrice: number;

  // Magazyn
  @Column({ type: 'int', default: 0 })
  quantityInStock: number;

  @Column({ type: 'int', default: 5 })
  minStockLevel: number; // Minimalny stan (alert o niskim stanie)

  @Column({ length: 50, nullable: true })
  location?: string; // Lokalizacja w magazynie (np. "Regał A3")

  @Column({
    type: 'enum',
    enum: PartStatus,
    default: PartStatus.AVAILABLE,
  })
  status: PartStatus;

  // Dostawca
  @Column({ length: 200, nullable: true })
  supplier?: string; // Nazwa dostawcy

  @Column({ length: 120, nullable: true })
  supplierEmail?: string;

  @Column({ length: 20, nullable: true })
  supplierPhone?: string;

  // Kompatybilność
  @Column({ type: 'text', nullable: true })
  compatibleVehicles?: string;

  // Notatki
  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relacja do ServiceOrderParts
  @OneToMany(() => ServiceOrderPart, (orderPart) => orderPart.part)
  serviceOrderParts: ServiceOrderPart[];
}
