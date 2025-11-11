import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';
import { IsStrongPassword } from '../validators/password.validator';

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'Imię musi mieć minimum 2 znaki' })
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'Nazwisko musi mieć minimum 2 znaki' })
  lastName: string;

  @IsEmail({}, { message: 'Nieprawidłowy format email' })
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Nieprawidłowa rola użytkownika' })
  role?: UserRole;
}
