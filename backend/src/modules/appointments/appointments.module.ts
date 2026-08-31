import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../../entities/appointment.entity';
import { Client } from '../../entities/client.entity';
import { Master } from '../../entities/master.entity';
import { Service } from '../../entities/service.entity';
import { ServicePrice } from '../../entities/service-price.entity';
import { Material } from '../../entities/material.entity';
import { MaterialPrice } from '../../entities/material-price.entity';
import { AppointmentService } from '../../entities/appointment-service.entity';
import { WorkSchedule } from '../../entities/work-schedule.entity';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { AppointmentServicesModule } from '../appointment-services/appointment-services.module';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      Client,
      Master,
      Service,
      ServicePrice,
      Material,
      MaterialPrice,
      AppointmentService,
      WorkSchedule,
      AppointmentServicesModule,
      User,
    ]),
  ],
  providers: [AppointmentsService],
  controllers: [AppointmentsController],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}