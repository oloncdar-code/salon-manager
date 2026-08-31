import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddAppointmentServiceDto {
  @IsNumber()
  @Type(() => Number)
  appointmentId: number;

  @IsNumber()
  @Type(() => Number)
  serviceId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  servicePrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  materialId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  materialPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discount?: number;
}