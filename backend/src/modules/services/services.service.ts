import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Service } from '../../entities/service.entity';
import { ServicePrice } from '../../entities/service-price.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateServicePriceDto } from './dto/create-service-price.dto';
import { FilterServicesDto } from './dto/filter-services.dto';
import { ServiceMaterial } from '../../entities/service-material.entity';
import { Material } from '../../entities/material.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(ServicePrice)
    private servicePriceRepository: Repository<ServicePrice>,
    @InjectRepository(ServiceMaterial)
    private serviceMaterialRepo: Repository<ServiceMaterial>,
    @InjectRepository(Material)
    private materialRepo: Repository<Material>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
  const { price, parentId, name, shortName, duration } = createServiceDto;

  // Проверяем parentId, если указан
  if (parentId) {
    const parent = await this.serviceRepository.findOne({
      where: { id: parentId },
    });
    if (!parent) {
      throw new NotFoundException(`Родительская услуга с ID ${parentId} не найдена`);
    }
  }

  const service = this.serviceRepository.create({
    name,
    short_name: shortName,  
    duration,
    parent_id: parentId || null,
    // is_active по умолчанию true (задано в сущности)
  });
  const saved = await this.serviceRepository.save(service);

  if (price !== undefined) {
    const existingActive = await this.servicePriceRepository.findOne({
      where: { service: { id: saved.id }, is_active: true },
    });
    if (existingActive) {
      throw new ConflictException('У услуги уже есть активная цена. Сначала деактивируйте её.');
    }
    const priceEntity = this.servicePriceRepository.create({
      service: saved,
      price,
      is_active: true,
    });
    await this.servicePriceRepository.save(priceEntity);
  }

  return saved;
}

  async findAll(filterDto: FilterServicesDto): Promise<Service[]> {
    const where: FindOptionsWhere<Service> = {};
    // filterDto использует camelCase
    if (filterDto.parentId !== undefined) {
      where.parent_id = filterDto.parentId;
    }
    if (filterDto.isActive !== undefined) {
      where.is_active = filterDto.isActive;
    }
    if (filterDto.search) {
      where.name = ILike(`%${filterDto.search}%`);
    }

    return this.serviceRepository.find({
      where,
      relations: {
        prices: true,
        children: true,
        parent: true,
      },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: {
        prices: true,
        children: true,
        parent: true,
        serviceMaterials: { material: true },
        masterServices: { master: true },
      },
    });
    if (!service) {
      throw new NotFoundException(`Услуга с ID ${id} не найдена`);
    }
    return service;
  }

  async getActivePrice(serviceId: number): Promise<ServicePrice | null> {
    const price = await this.servicePriceRepository.findOne({
      where: { service: { id: serviceId }, is_active: true },
    });
    return price;
  }

  async update(id: number, updateServiceDto: UpdateServiceDto): Promise<Service> {
  const service = await this.findOne(id);

  if (updateServiceDto.parentId) {
    const parent = await this.serviceRepository.findOne({
      where: { id: updateServiceDto.parentId },
    });
    if (!parent) {
      throw new NotFoundException(`Родительская услуга с ID ${updateServiceDto.parentId} не найдена`);
    }
  }

  if (updateServiceDto.name !== undefined) service.name = updateServiceDto.name;
  if (updateServiceDto.shortName !== undefined) service.short_name = updateServiceDto.shortName;
  if (updateServiceDto.duration !== undefined) service.duration = updateServiceDto.duration;
  if (updateServiceDto.parentId !== undefined) service.parent_id = updateServiceDto.parentId;
  if (updateServiceDto.isActive !== undefined) service.is_active = updateServiceDto.isActive;

  return this.serviceRepository.save(service);
}

  async setPrice(serviceId: number, createPriceDto: CreateServicePriceDto): Promise<ServicePrice> {
    const service = await this.findOne(serviceId);

    // Деактивируем все активные цены для этой услуги
    await this.servicePriceRepository.update(
      { service: { id: serviceId }, is_active: true },
      { is_active: false },
    );

    const priceEntity = this.servicePriceRepository.create({
      service,
      price: createPriceDto.price,
      is_active: true,
    });
    return this.servicePriceRepository.save(priceEntity);
  }

  async remove(id: number): Promise<void> {
    const service = await this.findOne(id);
    service.is_active = false;
    await this.serviceRepository.save(service);
    await this.servicePriceRepository.update(
      { service: { id }, is_active: true },
      { is_active: false },
    );
  }

  async getMaterials(serviceId: number): Promise<Material[]> {
    const service = await this.findOne(serviceId);
    const materials = await this.serviceMaterialRepo.find({
    where: { service_id: serviceId },
    relations: { material: true },
  });
  return materials.map(sm => sm.material);
}

async addMaterial(serviceId: number, materialId: number): Promise<ServiceMaterial> {
    const service = await this.findOne(serviceId);
    const material = await this.materialRepo.findOne({ where: { id: materialId } });
    if (!material) throw new NotFoundException(`Материал с ID ${materialId} не найден`);
    const existing = await this.serviceMaterialRepo.findOne({
      where: { service_id: serviceId, material_id: materialId },
    });
    if (existing) throw new ConflictException('Этот материал уже привязан к услуге');
    const sm = this.serviceMaterialRepo.create({
      service_id: serviceId,
      material_id: materialId,
    });
    return this.serviceMaterialRepo.save(sm);
  }

async removeMaterial(serviceId: number, materialId: number): Promise<void> {
  const sm = await this.serviceMaterialRepo.findOne({
    where: { service_id: serviceId, material_id: materialId },
  });
  if (!sm) throw new NotFoundException('Связь услуги и материала не найдена');
  await this.serviceMaterialRepo.remove(sm);
}
}