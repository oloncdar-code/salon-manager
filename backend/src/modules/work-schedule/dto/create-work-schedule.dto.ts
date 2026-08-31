import { IsNumber, IsDateString, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer'; // ← добавить этот импорт

export class CreateWorkScheduleDto {
  @IsNumber()
  @Type(() => Number)
  masterId: number;

  @IsDateString()
  date: string;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsDateString()
  @IsOptional()
  breakStart?: string;

  @IsDateString()
  @IsOptional()
  breakEnd?: string;

  @IsBoolean()
  @IsOptional()
  isWorking?: boolean;
}