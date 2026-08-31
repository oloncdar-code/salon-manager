import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Appointment } from './appointment.entity';
import { Service } from './service.entity';
import { Material } from './material.entity';

@Entity('appointment_services')
@Unique(['appointment_id', 'service_id'])
export class AppointmentService {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  appointment_id: number;

  @ManyToOne(() => Appointment, (app) => app.appointmentServices)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column({ type: 'bigint' })
  service_id: number;

  @ManyToOne(() => Service, (service) => service.appointmentServices)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  service_price: number;

  @Column({ type: 'bigint', nullable: true })
  material_id: number;

  @ManyToOne(() => Material, (material) => material.appointmentServices)
  @JoinColumn({ name: 'material_id' })
  material: Material;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  material_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}