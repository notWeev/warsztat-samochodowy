import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceOrderDto } from './create-service-order.dto';
import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { ServiceOrderStatus } from '../entities/service-order.entity';

export class UpdateServiceOrderDto extends PartialType(CreateServiceOrderDto) {
  @IsOptional()
  @IsEnum(ServiceOrderStatus, { message: 'Nieprawidłowy status' })
  status?: ServiceOrderStatus;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsDateString()
  closedAt?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  laborCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  partsCost?: number;

  @IsOptional()
  @IsString()
  mechanicNotes?: string;
}
