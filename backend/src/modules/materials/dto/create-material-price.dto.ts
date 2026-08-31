import { IsNumber, Min } from 'class-validator';

export class CreateMaterialPriceDto {
  @IsNumber()
  @Min(0)
  price: number;
}