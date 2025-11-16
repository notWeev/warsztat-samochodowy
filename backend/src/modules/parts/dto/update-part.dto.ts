import { PartialType } from '@nestjs/mapped-types';
import { CreatePartDto } from './create-part.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { PartStatus } from '../entities/part.entity';

export class UpdatePartDto extends PartialType(CreatePartDto) {
  @IsOptional()
  @IsEnum(PartStatus, { message: 'Nieprawidłowy status części' })
  status?: PartStatus;
}
