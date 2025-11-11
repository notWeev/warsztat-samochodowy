import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { IsStrongPassword } from '../../auth/validators/password.validator';

/**
 * DTO dla tworzenia użytkownika przez admina
 */
export class CreateUserDto {
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsStrongPassword()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
