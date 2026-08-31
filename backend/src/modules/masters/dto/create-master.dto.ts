import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMasterDto {
  @IsNumber()
  @Type(() => Number)
  userId: number;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  rating?: number;
}