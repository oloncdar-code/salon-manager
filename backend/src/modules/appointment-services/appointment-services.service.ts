import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentService } from '../../entities/appointment-service.entity';

@Injectable()
export class AppointmentServicesService {
  constructor(
    @InjectRepository(AppointmentService)
    private appointmentServiceRepo: Repository<AppointmentService>,
  ) {}

  async remove(id: number): Promise<void> {
    const record = await this.appointmentServiceRepo.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`AppointmentService с ID ${id} не найден`);
    }
    await this.appointmentServiceRepo.remove(record);
  }
}