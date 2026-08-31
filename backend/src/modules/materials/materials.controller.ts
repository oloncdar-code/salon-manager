import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { CreateMaterialPriceDto } from './dto/create-material-price.dto';
import { CreateServiceMaterialDto } from './dto/create-service-material.dto';
import { FilterMaterialsDto } from './dto/filter-materials.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDto: CreateMaterialDto) {
    return this.materialsService.create(createDto);
  }

  @Get()
  findAll(@Query() filterDto: FilterMaterialsDto) {
    return this.materialsService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialsService.findOne(+id);
  }

  @Get(':id/price/active')
  getActivePrice(@Param('id') id: string) {
    return this.materialsService.getActivePrice(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateMaterialDto) {
    return this.materialsService.update(+id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/price')
  setPrice(@Param('id') id: string, @Body() priceDto: CreateMaterialPriceDto) {
    return this.materialsService.setPrice(+id, priceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('service-material')
  addServiceMaterial(@Body() createDto: CreateServiceMaterialDto) {
    return this.materialsService.addServiceMaterial(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialsService.remove(+id);
  }
  @Post(':id/services')
  @UseGuards(JwtAuthGuard)
  addService(@Param('id') id: string, @Body('serviceId') serviceId: number) {
    return this.materialsService.addService(+id, +serviceId);
  }

  @Delete('service-materials/:id')
  @UseGuards(JwtAuthGuard)
  removeServiceMaterial(@Param('id') id: string) {
    return this.materialsService.removeServiceMaterial(+id);
  }
}