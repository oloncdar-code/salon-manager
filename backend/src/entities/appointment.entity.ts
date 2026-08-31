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
import { Client } from './client.entity';
import { Master } from './master.entity';
import { Service } from './service.entity';
import { AppointmentService } from './appointment-service.entity';

export enum AppointmentStatus {
  CREATED = 'created',
  AWAIT_CONFIRM = 'await_confirm',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  client_id: number;

  @ManyToOne(() => Client, (client) => client.appointments)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'bigint' })
  master_id: number;

  @ManyToOne(() => Master, (master) => master.appointments)
  @JoinColumn({ name: 'master_id' })
  master: Master;

  @Column({ type: 'bigint' })
  service_id: number;

  @ManyToOne(() => Service, (service) => service.appointments)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp' })
  end_time: Date;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.CREATED })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => AppointmentService, (as) => as.appointment)
  appointmentServices: AppointmentService[];
}