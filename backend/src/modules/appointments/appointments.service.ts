import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, In, Not } from 'typeorm';
import { Appointment, AppointmentStatus } from '../../entities/appointment.entity';
import { Client } from '../../entities/client.entity';
import { Master } from '../../entities/master.entity';
import { Service } from '../../entities/service.entity';
import { ServicePrice } from '../../entities/service-price.entity';
import { Material } from '../../entities/material.entity';
import { MaterialPrice } from '../../entities/material-price.entity';
import { AppointmentService } from '../../entities/appointment-service.entity';
import { WorkSchedule } from '../../entities/work-schedule.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { FilterAppointmentsDto } from './dto/filter-appointments.dto';
import { UpdateStatusDto } from './dto/appointment-status.dto';
import { AddAppointmentServiceDto } from './dto/add-appointment-service.dto';
import { User, UserRole } from '../../entities/user.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(Client)
    private clientRepo: Repository<Client>,
    @InjectRepository(Master)
    private masterRepo: Repository<Master>,
    @InjectRepository(Service)
    private serviceRepo: Repository<Service>,
    @InjectRepository(ServicePrice)
    private servicePriceRepo: Repository<ServicePrice>,
    @InjectRepository(Material)
    private materialRepo: Repository<Material>,
    @InjectRepository(MaterialPrice)
    private materialPriceRepo: Repository<MaterialPrice>,
    @InjectRepository(AppointmentService)
    private appointmentServiceRepo: Repository<AppointmentService>,
    @InjectRepository(WorkSchedule)
    private workScheduleRepo: Repository<WorkSchedule>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

async create(createDto: CreateAppointmentDto): Promise<Appointment> {
  const { clientId, clientPhone, clientFullName, masterId, serviceId, startTime, comment } = createDto;
  let client: Client;

  if (clientId) {
    client = await this.clientRepo.findOne({ where: { user_id: clientId } });
    if (!client) throw new NotFoundException(`Клиент с user_id ${clientId} не найден`);
  } else {
    // Создаём нового клиента
    if (!clientPhone || !clientFullName) {
      throw new BadRequestException('Для нового клиента необходимо указать телефон и ФИО');
    }
    // Проверяем, что телефон не занят
    const existingUser = await this.userRepo.findOne({ where: { phone: clientPhone } });
    if (existingUser) {
      throw new ConflictException(`Пользователь с телефоном ${clientPhone} уже существует`);
    }

    // Создаём пользователя (без пароля)
    const user = new User();
    user.phone = clientPhone;
    user.full_name = clientFullName;
    user.password_hash = null;
    user.role = UserRole.CLIENT;
    user.is_active = true;
    const savedUser = await this.userRepo.save(user);

    // Создаём клиента
    client = new Client();
    client.user = savedUser;
    await this.clientRepo.save(client);
  }

  // Далее мастер, услуга, проверка пересечений...
  const master = await this.masterRepo.findOne({ where: { id: masterId } });
  if (!master) throw new NotFoundException(`Мастер с ID ${masterId} не найден`);

  const service = await this.serviceRepo.findOne({ where: { id: serviceId } });
  if (!service) throw new NotFoundException(`Услуга с ID ${serviceId} не найдена`);

  const start = new Date(startTime);
  const end = new Date(start.getTime() + service.duration * 60000);

  // Проверка пересечения для мастера
  const overlapping = await this.appointmentRepo.createQueryBuilder('appointment')
    .where('appointment.master_id = :masterId', { masterId })
    .andWhere('appointment.status IN (:...statuses)', { statuses: [AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED] })
    .andWhere('appointment.start_time < :end AND appointment.end_time > :start', { start, end })
    .getOne();
  if (overlapping) {
    throw new ConflictException('Это время уже занято для данного мастера');
  }

  const appointment = this.appointmentRepo.create({
    client,
    master,
    service,
    start_time: start,
    end_time: end,
    status: AppointmentStatus.CREATED,
    comment,
  });

  return this.appointmentRepo.save(appointment);
}

async findAll(filterDto: FilterAppointmentsDto): Promise<Appointment[]> {
  const where: FindOptionsWhere<Appointment> = {};
  if (filterDto.clientId) where.client_id = filterDto.clientId;
  if (filterDto.masterId) where.master_id = filterDto.masterId;
  if (filterDto.status) where.status = filterDto.status;
  if (filterDto.dateFrom && filterDto.dateTo) {
    // Преобразуем строки в Date объекты и устанавливаем границы дня
    const start = new Date(filterDto.dateFrom);
    const end = new Date(filterDto.dateTo);
    // Если переданы только даты (без времени), то start и end будут с временем 00:00:00 по локальному поясу
    const startUTC = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0));
    const endUTC = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999));
    where.start_time = Between(startUTC, endUTC);
  }

    return this.appointmentRepo.find({
    where,
    relations: {
      client: {
        user: true,   
      },
      master: {
        user: true,   
      },
      service: true,
      appointmentServices: {
        service: true,
        material: true,
      },
    },
    order: { start_time: 'ASC' },
  });
}

  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({
    where: { id },
    relations: {
      client: {
        user: true,   
      },
      master: {
        user: true,   
      },
      service: true,
      appointmentServices: {
        service: true,
        material: true,
      },
    },
  });
  if (!appointment) throw new NotFoundException(`Запись с ID ${id} не найдена`);
  return appointment;
}

  async update(id: number, updateDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Если меняется время или услуга, пересчитываем end_time
    if (updateDto.startTime || updateDto.serviceId) {
      const serviceId = updateDto.serviceId || appointment.service_id;
      const service = await this.serviceRepo.findOne({ where: { id: serviceId } });
      if (!service) throw new NotFoundException(`Услуга с ID ${serviceId} не найдена`);
      const start = updateDto.startTime ? new Date(updateDto.startTime) : appointment.start_time;
      appointment.start_time = start;
      appointment.end_time = new Date(start.getTime() + service.duration * 60000);
      if (updateDto.serviceId) appointment.service_id = serviceId;
    }
    if (updateDto.clientId) appointment.client_id = updateDto.clientId;
    if (updateDto.masterId) appointment.master_id = updateDto.masterId;
    if (updateDto.comment !== undefined) appointment.comment = updateDto.comment;

    // Проверка пересечений
    if (updateDto.masterId || updateDto.startTime || updateDto.serviceId) {
      const conflict = await this.appointmentRepo.findOne({
        where: {
          master_id: appointment.master_id,
          status: In([AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED]),
          start_time: Between(appointment.start_time, appointment.end_time),
          id: Not(id),
        },
      });
      if (conflict) throw new ConflictException('Это время уже занято для данного мастера');
    }

    return this.appointmentRepo.save(appointment);
  }

  async updateStatus(id: number, statusDto: UpdateStatusDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.status = statusDto.status;
    return this.appointmentRepo.save(appointment);
  }

  async remove(id: number): Promise<void> {
    const appointment = await this.findOne(id);
    appointment.status = AppointmentStatus.CANCELLED;
    await this.appointmentRepo.save(appointment);
  }

  async getAvailableSlots(masterId: number, date: string, serviceId: number): Promise<{ start: Date; end: Date }[]> {
    console.log('🔍 getAvailableSlots called with:', { masterId, date, serviceId });

    const schedule = await this.workScheduleRepo.findOne({
      where: { master_id: masterId, date: new Date(date) },
    });
    console.log('📅 Schedule found:', schedule);

    if (!schedule || !schedule.is_working) {
      console.log('❌ Мастер не работает в этот день или график не найден');
      throw new NotFoundException('Мастер не работает в этот день');
    }

    const service = await this.serviceRepo.findOne({ where: { id: serviceId } });
    if (!service) {
      throw new NotFoundException(`Услуга с ID ${serviceId} не найдена`);
    }
    console.log('🛠️ Service duration:', service.duration);

    const durationMinutes = service.duration;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await this.appointmentRepo.find({
      where: {
        master_id: masterId,
        status: In([AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED]),
        start_time: Between(startOfDay, endOfDay),
      },
      order: { start_time: 'ASC' },
    });

    const busySlots = appointments.map((app) => ({
      start: app.start_time,
      end: app.end_time,
    }));

    const stepMinutes = 15;
    const slots: { start: Date; end: Date }[] = [];

    let current = new Date(schedule.start_time);
    const end = new Date(schedule.end_time);

    const breaks = [];
    if (schedule.break_start && schedule.break_end) {
      breaks.push({ start: schedule.break_start, end: schedule.break_end });
    }

    while (current.getTime() + durationMinutes * 60000 <= end.getTime()) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current.getTime() + durationMinutes * 60000);

      const inBreak = breaks.some((b) => {
        const breakStart = new Date(b.start);
        const breakEnd = new Date(b.end);
        return (slotStart < breakEnd && slotEnd > breakStart);
      });

      const isBusy = busySlots.some((busy) => {
        return (slotStart < busy.end && slotEnd > busy.start);
      });

      if (!inBreak && !isBusy) {
        slots.push({ start: new Date(slotStart), end: new Date(slotEnd) });
      }

      current = new Date(current.getTime() + stepMinutes * 60000);
    }

    console.log('✅ Сгенерировано слотов:', slots.length);
    return slots;
  }

  async addServiceToAppointment(dto: AddAppointmentServiceDto): Promise<AppointmentService> {
    const { appointmentId, serviceId, servicePrice, materialId, materialPrice, discount } = dto;

    const appointment = await this.appointmentRepo.findOne({ where: { id: appointmentId } });
    if (!appointment) {
      throw new NotFoundException(`Запись с ID ${appointmentId} не найдена`);
    }

    const service = await this.serviceRepo.findOne({ where: { id: serviceId } });
    if (!service) {
      throw new NotFoundException(`Услуга с ID ${serviceId} не найдена`);
    }

    const existing = await this.appointmentServiceRepo.findOne({
      where: { appointment_id: appointmentId, service_id: serviceId },
    });
    if (existing) {
      throw new ConflictException('Эта услуга уже добавлена в запись');
    }

    let finalServicePrice = servicePrice;
    if (finalServicePrice === undefined) {
      const activePrice = await this.servicePriceRepo.findOne({
        where: { service: { id: serviceId }, is_active: true },
      });
      if (activePrice) {
        finalServicePrice = activePrice.price;
      } else {
        throw new BadRequestException('У услуги нет активной цены');
      }
    }

    if (materialId) {
      const material = await this.materialRepo.findOne({ where: { id: materialId } });
      if (!material) {
        throw new NotFoundException(`Материал с ID ${materialId} не найден`);
      }
      let finalMaterialPrice = materialPrice;
      if (finalMaterialPrice === undefined) {
        const activeMatPrice = await this.materialPriceRepo.findOne({
          where: { material: { id: materialId }, is_active: true },
        });
        if (activeMatPrice) {
          finalMaterialPrice = activeMatPrice.price;
        } else {
          throw new BadRequestException('У материала нет активной цены');
        }
      }
    }

    const appointmentService = this.appointmentServiceRepo.create({
      appointment_id: appointmentId,
      service_id: serviceId,
      service_price: finalServicePrice,
      material_id: materialId || null,
      material_price: materialPrice || null,
      discount: discount || 0,
    });

    return this.appointmentServiceRepo.save(appointmentService);
  } 
}