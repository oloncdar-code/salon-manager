import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Master } from '../../entities/master.entity';
import { User } from '../../entities/user.entity';
import { CreateMasterDto } from './dto/create-master.dto';
import { UpdateMasterDto } from './dto/update-master.dto';
import { MasterService } from '../../entities/master-service.entity';
import { Service } from '../../entities/service.entity';
import { ConflictException } from '@nestjs/common';

@Injectable()
export class MastersService {
  constructor(
    @InjectRepository(Master)
    private masterRepository: Repository<Master>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(MasterService)
    private masterServiceRepo: Repository<MasterService>,
    @InjectRepository(Service)
    private serviceRepo: Repository<Service>,
  ) {}

  async create(createMasterDto: CreateMasterDto): Promise<Master> {
    const { userId, ...masterData } = createMasterDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
    }

    const master = this.masterRepository.create({
      ...masterData,
      user,
      //is_active: masterData.is_active !== undefined ? masterData.is_active : true,
  });

    return this.masterRepository.save(master);
  }

  async findAll(serviceId?: number): Promise<Master[]> {
  const relations = {
    user: true,
    masterServices: {
      service: true,
    },
  };

  if (serviceId) {
    return this.masterRepository.find({
      relations,
      where: {
        masterServices: {
          service: { id: serviceId },
        },
      },
    });
  }

  return this.masterRepository.find({ relations });
}

  async findOne(id: number): Promise<Master> {
    const master = await this.masterRepository.findOne({
      where: { id },
      relations: {
        user: true,
        masterServices: {
          service: true,
        },
      },
    });
    if (!master) {
      throw new NotFoundException(`Мастер с ID ${id} не найден`);
    }
    return master;
  }

  async update(id: number, updateMasterDto: UpdateMasterDto): Promise<Master> {
    const master = await this.findOne(id);

    if (updateMasterDto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: updateMasterDto.userId },
      });
      if (!user) {
        throw new NotFoundException(`Пользователь с ID ${updateMasterDto.userId} не найден`);
      }
      master.user = user;
    }

    Object.assign(master, updateMasterDto);
    return this.masterRepository.save(master);
  }

  async remove(id: number): Promise<void> {
    const master = await this.findOne(id);
    master.is_active = false;
    await this.masterRepository.save(master);
  }

  async addService(masterId: number, serviceId: number): Promise<MasterService> {
    const master = await this.findOne(masterId);
    const service = await this.serviceRepo.findOne({ where: { id: serviceId } });
    if (!service) {
      throw new NotFoundException(`Услуга с ID ${serviceId} не найдена`);
    }
    const existing = await this.masterServiceRepo.findOne({
      where: { master_id: masterId, service_id: serviceId },
    });
    if (existing) {
      throw new ConflictException('Эта услуга уже добавлена мастеру');
    }
    const ms = this.masterServiceRepo.create({
      master_id: masterId,
      service_id: serviceId,
    });
    return this.masterServiceRepo.save(ms);
  }

  async removeService(id: number): Promise<void> {
    const ms = await this.masterServiceRepo.findOne({ where: { id } });
    if (!ms) {
      throw new NotFoundException('Связь мастера и услуги не найдена');
    }
    await this.masterServiceRepo.remove(ms);
  }
}