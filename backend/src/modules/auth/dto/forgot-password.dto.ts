import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Nieprawidłowy format email' })
  email: string;
}
