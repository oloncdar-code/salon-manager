import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from '../../entities/service.entity';
import { ServicePrice } from '../../entities/service-price.entity';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { ServiceMaterial } from '../../entities/service-material.entity';
import { Material } from '../../entities/material.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, ServicePrice, ServiceMaterial, Material])],
  providers: [ServicesService],
  controllers: [ServicesController],
  exports: [ServicesService],
})
export class ServicesModule {}