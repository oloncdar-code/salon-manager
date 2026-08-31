import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  name: string;

  @IsString()
  shortName: string;

  @IsNumber()
  @Min(1)
  duration: number;

  @IsOptional()
  @IsNumber()
  parentId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}