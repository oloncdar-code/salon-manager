import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('by-phone')
  @UseGuards(JwtAuthGuard)
  async findByPhone(@Query('phone') phone: string) {
    return this.clientsService.findByPhone(phone);
  }
}