import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateOrderPartDto {
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Ilość musi być większa niż 0' })
  quantity?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
