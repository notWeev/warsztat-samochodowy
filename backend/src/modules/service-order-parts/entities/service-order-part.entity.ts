import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ServiceOrder } from '../../service-orders/entities/service-order.entity';
import { Part } from '../../parts/entities/part.entity';

@Entity({ name: 'service_order_parts' })
@Index('idx_service_order_parts_order', ['serviceOrderId'])
@Index('idx_service_order_parts_part', ['partId'])
export class ServiceOrderPart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relacja do zlecenia
  @ManyToOne(() => ServiceOrder, { eager: false })
  @JoinColumn({ name: 'serviceOrderId' })
  serviceOrder: ServiceOrder;

  @Column({ type: 'uuid' })
  serviceOrderId: string;

  // Relacja do części
  @ManyToOne(() => Part, { eager: false })
  @JoinColumn({ name: 'partId' })
  part: Part;

  @Column({ type: 'uuid' })
  partId: string;

  // Ilość użytych części
  @Column({ type: 'int' })
  quantity: number;

  // Cena jednostkowa w momencie dodania do zlecenia
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  // Całkowita cena (quantity * unitPrice)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  // Notatka (np. "Wymieniono wraz z filtrami")
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;
}
