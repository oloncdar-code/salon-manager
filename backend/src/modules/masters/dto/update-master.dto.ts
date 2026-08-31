import { PartialType } from '@nestjs/mapped-types';
import { CreateMasterDto } from './create-master.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateMasterDto extends PartialType(CreateMasterDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}