import { IsNumber, IsDateString, IsOptional, IsString, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  clientId?: number;

  @ValidateIf(o => !o.clientId)
  @IsString()
  clientPhone?: string;

  @ValidateIf(o => !o.clientId)
  @IsString()
  clientFullName?: string;

  @IsNumber()
  @Type(() => Number)
  masterId: number;

  @IsNumber()
  @Type(() => Number)
  serviceId: number;

  @IsDateString()
  startTime: string;

  @IsOptional()
  @IsString()
  comment?: string;
}