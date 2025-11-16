import {
  IsUUID,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AddPartToOrderDto {
  @IsUUID('4', { message: 'Nieprawidłowy format ID części' })
  partId: string;

  @IsInt({ message: 'Ilość musi być liczbą całkowitą' })
  @Min(1, { message: 'Ilość musi być większa niż 0' })
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Cena jednostkowa nie może być ujemna' })
  unitPrice?: number; // Jeśli nie podano, użyje sellingPrice z Part

  @IsOptional()
  @IsString()
  notes?: string;
}
