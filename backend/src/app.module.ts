import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MastersModule } from './modules/masters/masters.module';
import { ServicesModule } from './modules/services/services.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { WorkScheduleModule } from './modules/work-schedule/work-schedule.module';
import { AppointmentServicesModule } from './modules/appointment-services/appointment-services.module';

@Module({
  imports: [
  ConfigModule.forRoot({
    envFilePath: '.env',
    isGlobal: true,
  }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,
    }),
    UsersModule,
    AuthModule,
    MastersModule,
    ServicesModule,
    AppointmentsModule,
    MaterialsModule,
    WorkScheduleModule,
    AppointmentServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}