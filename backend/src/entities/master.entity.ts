import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { MasterService } from './master-service.entity';
import { WorkSchedule } from './work-schedule.entity';
import { Appointment } from './appointment.entity';

@Entity('masters')
export class Master {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  user_id: number;

  @OneToOne(() => User, (user) => user.master)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => MasterService, (ms) => ms.master)
  masterServices: MasterService[];

  @OneToMany(() => WorkSchedule, (ws) => ws.master)
  workSchedules: WorkSchedule[];

  @OneToMany(() => Appointment, (app) => app.master)
  appointments: Appointment[];
}