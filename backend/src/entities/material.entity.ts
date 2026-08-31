import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { MaterialPrice } from './material-price.entity';
import { ServiceMaterial } from './service-material.entity';
import { AppointmentService } from './appointment-service.entity';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  short_name: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => MaterialPrice, (mp) => mp.material)
  prices: MaterialPrice[];

  @OneToMany(() => ServiceMaterial, (sm) => sm.material)
  serviceMaterials: ServiceMaterial[];

  @OneToMany(() => AppointmentService, (as) => as.material)
  appointmentServices: AppointmentService[];
}