import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { FilterAppointmentsDto } from './dto/filter-appointments.dto';
import { UpdateStatusDto } from './dto/appointment-status.dto';
import { AddAppointmentServiceDto } from './dto/add-appointment-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDto: CreateAppointmentDto) {
    console.log('Received create appointment DTO:', createDto);
    return this.appointmentsService.create(createDto);
  }

  @Get('slots')
  async getAvailableSlots(
    @Query('masterId') masterId: string,
    @Query('date') date: string,
    @Query('serviceId') serviceId: string,
  ) {
    return this.appointmentsService.getAvailableSlots(+masterId, date, +serviceId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() filterDto: FilterAppointmentsDto) {
    console.log('🔍 filterDto:', filterDto);
    console.log('📅 dateFrom:', filterDto.dateFrom);
    console.log('📅 dateTo:', filterDto.dateTo);
    return this.appointmentsService.findAll(filterDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(+id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() statusDto: UpdateStatusDto) {
    return this.appointmentsService.updateStatus(+id, statusDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-service')
  addServiceToAppointment(@Body() dto: AddAppointmentServiceDto) {
    return this.appointmentsService.addServiceToAppointment(dto);
  }
}