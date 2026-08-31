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

@Entity('work_schedule')
@Unique(['master_id', 'date'])
export class WorkSchedule {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  master_id: number;

  @ManyToOne(() => Master, (master) => master.workSchedules)
  @JoinColumn({ name: 'master_id' })
  master: Master;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'timestamp', nullable: true })
  start_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  break_start: Date;

  @Column({ type: 'timestamp', nullable: true })
  break_end: Date;

  @Column({ type: 'boolean', default: true })
  is_working: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}