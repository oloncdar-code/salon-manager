import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateServicePriceDto } from './dto/create-service-price.dto';
import { FilterServicesDto } from './dto/filter-services.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createServiceDto: CreateServiceDto) {
    console.log('Received create service DTO:', createServiceDto);
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  findAll(@Query() filterDto: FilterServicesDto) {
    return this.servicesService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Get(':id/price/active')
  getActivePrice(@Param('id') id: string) {
    return this.servicesService.getActivePrice(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/price')
  setPrice(@Param('id') id: string, @Body() createPriceDto: CreateServicePriceDto) {
    return this.servicesService.setPrice(+id, createPriceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }

  @Get(':id/materials')
  async getMaterials(@Param('id') id: string) {
    return this.servicesService.getMaterials(+id);
  }

  @Post(':id/materials')
  @UseGuards(JwtAuthGuard)
  async addMaterial(@Param('id') id: string, @Body('materialId') materialId: number) {
    return this.servicesService.addMaterial(+id, +materialId);
  }

  @Delete(':id/materials/:materialId')
  @UseGuards(JwtAuthGuard)
  async removeMaterial(@Param('id') id: string, @Param('materialId') materialId: string) {
    return this.servicesService.removeMaterial(+id, +materialId);
  }
}