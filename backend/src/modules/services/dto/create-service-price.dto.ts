import { IsNumber, Min } from 'class-validator';

export class CreateServicePriceDto {
  @IsNumber()
  @Min(0)
  price: number;
}