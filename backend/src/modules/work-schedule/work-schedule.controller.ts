import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { WorkScheduleService } from './work-schedule.service';
import { CreateWorkScheduleDto } from './dto/create-work-schedule.dto';
import { UpdateWorkScheduleDto } from './dto/update-work-schedule.dto';
import { FilterWorkScheduleDto } from './dto/filter-work-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('work-schedule')
export class WorkScheduleController {
  constructor(private readonly workScheduleService: WorkScheduleService) {}

  @Post()
  create(@Body() createDto: CreateWorkScheduleDto) {
  console.log('Received DTO in work-schedule controller:', createDto);
  console.log('typeof masterId:', typeof createDto.masterId);
  return this.workScheduleService.create(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() filterDto: FilterWorkScheduleDto) {
    return this.workScheduleService.findAll(filterDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workScheduleService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateWorkScheduleDto) {
    return this.workScheduleService.update(+id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workScheduleService.remove(+id);
  }
}