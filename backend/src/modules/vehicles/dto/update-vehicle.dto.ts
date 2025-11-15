import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateVehicleDto } from './create-vehicle.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { VehicleStatus } from '../entities/vehicle.entity';

export class UpdateVehicleDto extends PartialType(
  OmitType(CreateVehicleDto, ['customerId', 'vin'] as const),
) {
  // Możliwość zmiany statusu
  @IsOptional()
  @IsEnum(VehicleStatus, { message: 'Nieprawidłowy status pojazdu' })
  status?: VehicleStatus;
}
