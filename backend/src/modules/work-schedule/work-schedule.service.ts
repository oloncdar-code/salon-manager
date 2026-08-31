import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, Not } from 'typeorm';
import { WorkSchedule } from '../../entities/work-schedule.entity';
import { Master } from '../../entities/master.entity';
import { CreateWorkScheduleDto } from './dto/create-work-schedule.dto';
import { UpdateWorkScheduleDto } from './dto/update-work-schedule.dto';
import { FilterWorkScheduleDto } from './dto/filter-work-schedule.dto';

@Injectable()
export class WorkScheduleService {
  constructor(
    @InjectRepository(WorkSchedule)
    private workScheduleRepo: Repository<WorkSchedule>,
    @InjectRepository(Master)
    private masterRepo: Repository<Master>,
  ) {}

  async create(createDto: CreateWorkScheduleDto): Promise<WorkSchedule> {
    const { masterId, date, ...data } = createDto;
    const master = await this.masterRepo.findOne({ where: { id: masterId } });
    if (!master) {
      throw new NotFoundException(`Мастер с ID ${masterId} не найден`);
    }

    const existing = await this.workScheduleRepo.findOne({
      where: { master_id: masterId, date: new Date(date) },
    });
    if (existing) {
      throw new ConflictException('Расписание на эту дату уже существует');
    }

    // Преобразуем строки в Date
    const startTime = data.startTime ? new Date(data.startTime) : null;
    const endTime = data.endTime ? new Date(data.endTime) : null;
    const breakStart = data.breakStart ? new Date(data.breakStart) : null;
    const breakEnd = data.breakEnd ? new Date(data.breakEnd) : null;

    const schedule = this.workScheduleRepo.create({
      master_id: masterId,
      date: new Date(date),
      start_time: startTime,
      end_time: endTime,
      break_start: breakStart,
      break_end: breakEnd,
      is_working: data.isWorking,
    });
    return this.workScheduleRepo.save(schedule);
  }

  async findAll(filterDto: FilterWorkScheduleDto): Promise<WorkSchedule[]> {
    const where: FindOptionsWhere<WorkSchedule> = {};
    if (filterDto.masterId) where.master_id = filterDto.masterId;
    if (filterDto.dateFrom && filterDto.dateTo) {
      where.date = Between(new Date(filterDto.dateFrom), new Date(filterDto.dateTo));
    }
    return this.workScheduleRepo.find({
      where,
      relations: { master: true },
      order: { date: 'ASC' },
    });
  }

  async findOne(id: number): Promise<WorkSchedule> {
    const schedule = await this.workScheduleRepo.findOne({
      where: { id },
      relations: { master: true },
    });
    if (!schedule) {
      throw new NotFoundException(`Расписание с ID ${id} не найдено`);
    }
    return schedule;
  }

  async update(id: number, updateDto: UpdateWorkScheduleDto): Promise<WorkSchedule> {
    const schedule = await this.findOne(id);

    if (updateDto.masterId) {
      const master = await this.masterRepo.findOne({ where: { id: updateDto.masterId } });
      if (!master) {
        throw new NotFoundException(`Мастер с ID ${updateDto.masterId} не найден`);
      }
      schedule.master_id = updateDto.masterId;
    }

    if (updateDto.date) {
      const newDate = new Date(updateDto.date);
      const existing = await this.workScheduleRepo.findOne({
        where: {
          master_id: updateDto.masterId || schedule.master_id,
          date: newDate,
          id: Not(id),
        },
      });
      if (existing) {
        throw new ConflictException('На эту дату уже есть расписание у этого мастера');
      }
      schedule.date = newDate;
    }

    // Обновляем поля с преобразованием в Date
    if (updateDto.startTime !== undefined) {
      schedule.start_time = updateDto.startTime ? new Date(updateDto.startTime) : null;
    }
    if (updateDto.endTime !== undefined) {
      schedule.end_time = updateDto.endTime ? new Date(updateDto.endTime) : null;
    }
    if (updateDto.breakStart !== undefined) {
      schedule.break_start = updateDto.breakStart ? new Date(updateDto.breakStart) : null;
    }
    if (updateDto.breakEnd !== undefined) {
      schedule.break_end = updateDto.breakEnd ? new Date(updateDto.breakEnd) : null;
    }
    if (updateDto.isWorking !== undefined) {
      schedule.is_working = updateDto.isWorking;
    }

    return this.workScheduleRepo.save(schedule);
  }

  async remove(id: number): Promise<void> {
    const schedule = await this.findOne(id);
    await this.workScheduleRepo.remove(schedule);
  }
}