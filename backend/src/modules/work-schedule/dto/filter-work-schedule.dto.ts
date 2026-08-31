import { IsOptional, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterWorkScheduleDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  masterId?: number;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}