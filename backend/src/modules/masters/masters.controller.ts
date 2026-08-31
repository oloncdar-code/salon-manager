import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { MastersService } from './masters.service';
import { CreateMasterDto } from './dto/create-master.dto';
import { UpdateMasterDto } from './dto/update-master.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('masters')
export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createMasterDto: CreateMasterDto) {
    console.log('Received DTO:', createMasterDto);
    return this.mastersService.create(createMasterDto);
  }

  @Get()
  findAll(@Query('serviceId') serviceId?: string) {
    return this.mastersService.findAll(serviceId ? +serviceId : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mastersService.findOne(+id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateMasterDto: UpdateMasterDto) {
    return this.mastersService.update(+id, updateMasterDto);
  }

  @Delete('services/:id')
  @UseGuards(JwtAuthGuard)
  removeService(@Param('id') id: string) {
    return this.mastersService.removeService(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.mastersService.remove(+id);
  }

  @Post(':id/services')
  @UseGuards(JwtAuthGuard)
  addService(@Param('id') id: string, @Body('serviceId') serviceId: number) {
    return this.mastersService.addService(+id, +serviceId);
  }

}