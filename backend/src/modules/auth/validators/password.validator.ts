import { applyDecorators } from '@nestjs/common';
import { IsString, MinLength, Matches } from 'class-validator';

export function IsStrongPassword() {
  return applyDecorators(
    IsString(),
    MinLength(8, { message: 'Hasło musi mieć minimum 8 znaków' }),
    Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
      message:
        'Hasło musi zawierać wielką literę, małą literę, cyfrę i znak specjalny',
    }),
  );
}
