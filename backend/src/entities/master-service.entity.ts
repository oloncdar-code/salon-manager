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
import { Master } from './master.entity';
import { Service } from './service.entity';

@Entity('master_services')
@Unique(['master_id', 'service_id'])
export class MasterService {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  master_id: number;

  @ManyToOne(() => Master, (master) => master.masterServices)
  @JoinColumn({ name: 'master_id' })
  master: Master;

  @Column({ type: 'bigint' })
  service_id: number;

  @ManyToOne(() => Service, (service) => service.masterServices)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}