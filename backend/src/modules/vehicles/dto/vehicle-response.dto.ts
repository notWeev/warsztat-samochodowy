import { FuelType, VehicleStatus } from '../entities/vehicle.entity';
import { CustomerResponseDto } from '../../customers/dto/customer-response.dto';

export class VehicleResponseDto {
  id: string;
  customerId: string;
  customer?: CustomerResponseDto; // Opcjonalnie dołącz dane klienta
  vin: string;
  brand: string;
  model: string;
  year: number;
  registrationNumber?: string;
  fuelType?: FuelType;
  engineCapacity?: number;
  enginePower?: number;
  mileage: number;
  color?: string;
  status: VehicleStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
