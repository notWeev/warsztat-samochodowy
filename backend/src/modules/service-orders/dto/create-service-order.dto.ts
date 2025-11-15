import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsInt,
  IsDateString,
  Min,
  MinLength,
} from 'class-validator';
import { ServiceOrderPriority } from '../entities/service-order.entity';

export class CreateServiceOrderDto {
  @IsUUID('4', { message: 'Nieprawidłowy format ID klienta' })
  customerId: string;

  @IsUUID('4', { message: 'Nieprawidłowy format ID pojazdu' })
  vehicleId: string;

  @IsOptional()
  @IsUUID('4', { message: 'Nieprawidłowy format ID mechanika' })
  assignedMechanicId?: string;

  @IsString()
  @MinLength(10, { message: 'Opis musi mieć minimum 10 znaków' })
  description: string;

  @IsOptional()
  @IsEnum(ServiceOrderPriority, { message: 'Nieprawidłowy priorytet' })
  priority?: ServiceOrderPriority;

  @IsOptional()
  @IsDateString({}, { message: 'Nieprawidłowy format daty' })
  scheduledAt?: string;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Przebieg nie może być ujemny' })
  mileageAtAcceptance?: number;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}
