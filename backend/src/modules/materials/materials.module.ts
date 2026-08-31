import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from '../../entities/material.entity';
import { MaterialPrice } from '../../entities/material-price.entity';
import { ServiceMaterial } from '../../entities/service-material.entity';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
import { Service } from '../../entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Material, MaterialPrice, ServiceMaterial, Service])],
  providers: [MaterialsService],
  controllers: [MaterialsController],
  exports: [MaterialsService],
})
export class MaterialsModule {}