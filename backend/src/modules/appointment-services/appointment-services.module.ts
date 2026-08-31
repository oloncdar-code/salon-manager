import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentServicesController } from './appointment-services.controller';
import { AppointmentServicesService } from './appointment-services.service';
import { AppointmentService } from '../../entities/appointment-service.entity';
import { Appointment } from '../../entities/appointment.entity';
import { Service } from '../../entities/service.entity';
import { Material } from '../../entities/material.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppointmentService, Appointment, Service, Material]),
  ],
  controllers: [AppointmentServicesController],
  providers: [AppointmentServicesService],
  exports: [AppointmentServicesService],
})
export class AppointmentServicesModule {}