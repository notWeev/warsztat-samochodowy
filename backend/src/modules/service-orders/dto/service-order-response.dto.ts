import {
  ServiceOrderStatus,
  ServiceOrderPriority,
} from '../entities/service-order.entity';
import { CustomerResponseDto } from '../../customers/dto/customer-response.dto';
import { VehicleResponseDto } from '../../vehicles/dto/vehicle-response.dto';

export class ServiceOrderResponseDto {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: CustomerResponseDto;
  vehicleId: string;
  vehicle?: VehicleResponseDto;
  assignedMechanicId?: string;
  assignedMechanic?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  description: string;
  status: ServiceOrderStatus;
  priority: ServiceOrderPriority;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  closedAt?: Date;
  mileageAtAcceptance?: number;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  mechanicNotes?: string;
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
