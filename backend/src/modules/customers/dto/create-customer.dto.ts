import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { CustomerType } from '../entities/customer.entity';

export class CreateCustomerDto {
  @IsEnum(CustomerType, {
    message: 'Typ klienta musi być INDIVIDUAL lub BUSINESS',
  })
  type: CustomerType;

  @IsString()
  @MinLength(2, { message: 'Imię musi mieć minimum 2 znaki' })
  @MaxLength(60)
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'Nazwisko musi mieć minimum 2 znaki' })
  @MaxLength(60)
  lastName: string;

  @IsOptional()
  @IsEmail({}, { message: 'Nieprawidłowy format email' })
  email?: string;

  @IsString()
  @Matches(/^\+?[0-9]{9,15}$/, {
    message: 'Nieprawidłowy format numeru telefonu',
  })
  phone: string;

  // Adres
  @IsOptional()
  @IsString()
  @MaxLength(100)
  street?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}-\d{3}$/, {
    message: 'Kod pocztowy musi być w formacie XX-XXX',
  })
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  city?: string;

  // Dane identyfikacyjne
  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'PESEL musi składać się z 11 cyfr' })
  pesel?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, { message: 'NIP musi składać się z 10 cyfr' })
  nip?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyName?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
