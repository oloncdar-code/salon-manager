import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { AppointmentServicesService } from './appointment-services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('appointment-services')
export class AppointmentServicesController {
  constructor(private readonly service: AppointmentServicesService) {}

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}