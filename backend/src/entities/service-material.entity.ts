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
import { Service } from './service.entity';
import { Material } from './material.entity';

@Entity('service_materials')
@Unique(['service_id', 'material_id'])
export class ServiceMaterial {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  service_id: number;

  @ManyToOne(() => Service, (service) => service.serviceMaterials)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'bigint' })
  material_id: number;

  @ManyToOne(() => Material, (material) => material.serviceMaterials)
  @JoinColumn({ name: 'material_id' })
  material: Material;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}