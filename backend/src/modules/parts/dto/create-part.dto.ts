import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsInt,
  MinLength,
  MaxLength,
  Min,
  IsEmail,
} from 'class-validator';
import { PartCategory } from '../entities/part.entity';

export class CreatePartDto {
  @IsString()
  @MinLength(3, { message: 'Numer katalogowy musi mieć minimum 3 znaki' })
  @MaxLength(100)
  partNumber: string;

  @IsString()
  @MinLength(3, { message: 'Nazwa musi mieć minimum 3 znaki' })
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(PartCategory, { message: 'Nieprawidłowa kategoria części' })
  category: PartCategory;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  manufacturer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @IsNumber()
  @Min(0, { message: 'Cena zakupu nie może być ujemna' })
  purchasePrice: number;

  @IsNumber()
  @Min(0, { message: 'Cena sprzedaży nie może być ujemna' })
  sellingPrice: number;

  @IsInt({ message: 'Ilość musi być liczbą całkowitą' })
  @Min(0, { message: 'Ilość nie może być ujemna' })
  quantityInStock: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minStockLevel?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  supplier?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Nieprawidłowy format email dostawcy' })
  supplierEmail?: string;

  @IsOptional()
  @IsString()
  supplierPhone?: string;

  @IsOptional()
  @IsString()
  compatibleVehicles?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
