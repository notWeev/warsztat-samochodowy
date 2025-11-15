import { UserRole, UserStatus } from '../entities/user.entity';

// DTO dla odpowiedzi API - nie zawiera wrażliwych danych
export class UserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
