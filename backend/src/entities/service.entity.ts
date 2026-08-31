import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ServicePrice } from './service-price.entity';
import { ServiceMaterial } from './service-material.entity';
import { MasterService } from './master-service.entity';
import { Appointment } from './appointment.entity';
import { AppointmentService } from './appointment-service.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', nullable: true })
  parent_id: number;

  @ManyToOne(() => Service, (service) => service.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Service;

  @OneToMany(() => Service, (service) => service.parent)
  children: Service[];

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  short_name: string;

  @Column({ type: 'int' })
  duration: number; // minutes

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => ServicePrice, (sp) => sp.service)
  prices: ServicePrice[];

  @OneToMany(() => ServiceMaterial, (sm) => sm.service)
  serviceMaterials: ServiceMaterial[];

  @OneToMany(() => MasterService, (ms) => ms.service)
  masterServices: MasterService[];

  @OneToMany(() => Appointment, (app) => app.service)
  appointments: Appointment[];

  @OneToMany(() => AppointmentService, (as) => as.service)
  appointmentServices: AppointmentService[];
}