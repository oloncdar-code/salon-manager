import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  name: string;

  @IsString()
  shortName: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number; 
}