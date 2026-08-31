import { IsString, IsOptional, IsPhoneNumber, IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '../../../entities/user.entity';

export class CreateUserDto {
  @IsString()
  fullName: string;

  @IsPhoneNumber('RU')
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}