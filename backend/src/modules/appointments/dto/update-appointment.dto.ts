import { IsNumber, IsDateString, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  clientId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  masterId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  serviceId?: number;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}