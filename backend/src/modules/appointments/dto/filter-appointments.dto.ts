import { IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentStatus } from '../../../entities/appointment.entity';

export class FilterAppointmentsDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  clientId?: number;

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

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}