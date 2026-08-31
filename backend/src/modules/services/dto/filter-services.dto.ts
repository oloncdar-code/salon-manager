import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterServicesDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parentId?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  isActive?: boolean;
}