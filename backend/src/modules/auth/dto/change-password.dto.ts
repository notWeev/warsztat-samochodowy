import { IsString, MinLength } from 'class-validator';
import { IsStrongPassword } from '../validators/password.validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(8, { message: 'Stare hasło musi mieć minimum 8 znaków' })
  oldPassword: string;

  @IsStrongPassword()
  newPassword: string;
}
