import {
  IsString,
  IsUUID,
  IsInt,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  Min,
  Max,
  Matches,
  Length,
} from 'class-validator';
import { FuelType } from '../entities/vehicle.entity';

export class CreateVehicleDto {
  @IsUUID('4', { message: 'Nieprawidłowy format ID klienta' })
  customerId: string;

  @IsString()
  @Length(17, 17, { message: 'VIN musi mieć dokładnie 17 znaków' })
  @Matches(/^[A-HJ-NPR-Z0-9]{17}$/, {
    message: 'VIN może zawierać tylko cyfry i wielkie litery (bez I, O, Q)',
  })
  vin: string;

  @IsString()
  @MinLength(2, { message: 'Marka musi mieć minimum 2 znaki' })
  @MaxLength(50)
  brand: string;

  @IsString()
  @MinLength(1, { message: 'Model musi mieć minimum 1 znak' })
  @MaxLength(50)
  model: string;

  @IsInt({ message: 'Rok musi być liczbą całkowitą' })
  @Min(1900, { message: 'Rok produkcji nie może być wcześniejszy niż 1900' })
  @Max(new Date().getFullYear() + 1, {
    message: 'Rok produkcji nie może być z przyszłości',
  })
  year: number;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9]{2,15}$/, {
    message:
      'Numer rejestracyjny może zawierać tylko wielkie litery i cyfry (2-15 znaków)',
  })
  registrationNumber?: string;

  @IsOptional()
  @IsEnum(FuelType, { message: 'Nieprawidłowy typ paliwa' })
  fuelType?: FuelType;

  @IsOptional()
  @IsInt()
  @Min(50, { message: 'Pojemność silnika musi być większa niż 50 cm³' })
  @Max(10000, { message: 'Pojemność silnika nie może przekraczać 10000 cm³' })
  engineCapacity?: number;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Moc silnika musi być większa niż 0 KM' })
  @Max(2000, { message: 'Moc silnika nie może przekraczać 2000 KM' })
  enginePower?: number;

  @IsInt({ message: 'Przebieg musi być liczbą całkowitą' })
  @Min(0, { message: 'Przebieg nie może być ujemny' })
  mileage: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  color?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
