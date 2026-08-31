import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceMaterialDto {
  @IsNumber()
  @Type(() => Number)
  serviceId: number;

  @IsNumber()
  @Type(() => Number)
  materialId: number;
}