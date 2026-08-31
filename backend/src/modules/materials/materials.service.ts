import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Material } from '../../entities/material.entity';
import { MaterialPrice } from '../../entities/material-price.entity';
import { ServiceMaterial } from '../../entities/service-material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { CreateMaterialPriceDto } from './dto/create-material-price.dto';
import { CreateServiceMaterialDto } from './dto/create-service-material.dto';
import { FilterMaterialsDto } from './dto/filter-materials.dto';
import { Service } from '../../entities/service.entity';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private materialRepo: Repository<Material>,
    @InjectRepository(MaterialPrice)
    private materialPriceRepo: Repository<MaterialPrice>,
    @InjectRepository(ServiceMaterial)
    private serviceMaterialRepo: Repository<ServiceMaterial>,
    @InjectRepository(Service)
    private serviceRepo: Repository<Service>,
  ) {}

  async create(createDto: CreateMaterialDto): Promise<Material> {
    const { price, name, shortName } = createDto;

    const material = this.materialRepo.create({
      name,
      short_name: shortName,
    });
    const saved = await this.materialRepo.save(material);

    if (price !== undefined) {
      const existing = await this.materialPriceRepo.findOne({
        where: { material: { id: saved.id }, is_active: true },
      });
      if (existing) {
        throw new ConflictException('У материала уже есть активная цена. Деактивируйте её перед добавлением новой.');
      }
      const priceEntity = this.materialPriceRepo.create({
        material: saved,
        price,
        is_active: true,
      });
      await this.materialPriceRepo.save(priceEntity);
    }
    return saved;
  }

  async findAll(filterDto: FilterMaterialsDto): Promise<Material[]> {
    const where: FindOptionsWhere<Material> = {};
    if (filterDto.search) {
      where.name = ILike(`%${filterDto.search}%`);
    }

    let query = this.materialRepo.createQueryBuilder('material');
    query.leftJoinAndSelect('material.prices', 'prices');
    query.leftJoinAndSelect('material.serviceMaterials', 'serviceMaterials');
    query.leftJoinAndSelect('serviceMaterials.service', 'service');

    if (filterDto.serviceId) {
      query.where('serviceMaterials.service_id = :serviceId', { serviceId: filterDto.serviceId });
    }
    if (filterDto.search) {
      query.andWhere('material.name ILIKE :search', { search: `%${filterDto.search}%` });
    }
    return query.getMany();
  }

  async findOne(id: number): Promise<Material> {
    const material = await this.materialRepo.findOne({
      where: { id },
      relations: {
        prices: true,
        serviceMaterials: { service: true },
      },
    });
    if (!material) throw new NotFoundException(`Материал с ID ${id} не найден`);
    return material;
  }

  async getActivePrice(materialId: number): Promise<MaterialPrice | null> {
    const price = await this.materialPriceRepo.findOne({
      where: { material: { id: materialId }, is_active: true },
    });
    return price;
  }

  async update(id: number, updateDto: UpdateMaterialDto): Promise<Material> {
    const material = await this.findOne(id);
    if (updateDto.name !== undefined) material.name = updateDto.name;
    if (updateDto.shortName !== undefined) material.short_name = updateDto.shortName;
    if (updateDto.isActive !== undefined) material.is_active = updateDto.isActive;
    return this.materialRepo.save(material);
  }

  async setPrice(materialId: number, priceDto: CreateMaterialPriceDto): Promise<MaterialPrice> {
    const material = await this.findOne(materialId);
    await this.materialPriceRepo.update(
      { material: { id: materialId }, is_active: true },
      { is_active: false },
    );
    const priceEntity = this.materialPriceRepo.create({
      material,
      price: priceDto.price,
      is_active: true,
    });
    return this.materialPriceRepo.save(priceEntity);
  }

  async addServiceMaterial(createDto: CreateServiceMaterialDto): Promise<ServiceMaterial> {
    const { serviceId, materialId } = createDto;

    const existing = await this.serviceMaterialRepo.findOne({
      where: { service_id: serviceId, material_id: materialId },
    });
    if (existing) {
      throw new ConflictException('Такая связь уже существует');
    }
    const serviceMaterial = this.serviceMaterialRepo.create({
      service_id: serviceId,
      material_id: materialId,
      is_active: true,
    });
    return this.serviceMaterialRepo.save(serviceMaterial);
  }

  async addService(materialId: number, serviceId: number): Promise<ServiceMaterial> {
    const material = await this.materialRepo.findOne({ where: { id: materialId } });
    if (!material) {
      throw new NotFoundException(`Материал с ID ${materialId} не найден`);
    }
    const service = await this.serviceRepo.findOne({ where: { id: serviceId } });
    if (!service) {
      throw new NotFoundException(`Услуга с ID ${serviceId} не найдена`);
    }
    const existing = await this.serviceMaterialRepo.findOne({
      where: { material_id: materialId, service_id: serviceId },
    });
    if (existing) {
      throw new ConflictException('Эта услуга уже привязана к материалу');
    }
    const relation = this.serviceMaterialRepo.create({
      material_id: materialId,
      service_id: serviceId,
    });
    return this.serviceMaterialRepo.save(relation);
  }

  async removeServiceMaterial(id: number): Promise<void> {
    const relation = await this.serviceMaterialRepo.findOne({ where: { id } });
    if (!relation) {
      throw new NotFoundException(`Связь услуги и материала с ID ${id} не найдена`);
    }
    await this.serviceMaterialRepo.remove(relation);
  }

  async remove(id: number): Promise<void> {
    const material = await this.findOne(id);
    material.is_active = false;
    await this.materialRepo.save(material);
    await this.materialPriceRepo.update(
      { material: { id }, is_active: true },
      { is_active: false },
    );
  }
}