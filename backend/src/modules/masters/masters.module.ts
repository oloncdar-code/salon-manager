import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MastersService } from './masters.service';
import { MastersController } from './masters.controller';
import { Master } from '../../entities/master.entity';
import { User } from '../../entities/user.entity';
import { Service } from '../../entities/service.entity';
import { MasterService } from '../../entities/master-service.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([Master, User, MasterService, Service])],
  providers: [MastersService],
  controllers: [MastersController],
  exports: [MastersService],
})
export class MastersModule {}