import {
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { UserRole, UserStatus } from '../entities/user.entity';

// DTO dla aktualizacji użytkownika
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;
}
