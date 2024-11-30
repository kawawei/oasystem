import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, BaseEntity } from 'typeorm';
import { User } from './User.entity';

@Entity('calendar_events')
export class CalendarEvent extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column({ type: 'datetime' })
  startTime!: Date;

  @Column({ type: 'datetime' })
  endTime!: Date;

  @ManyToOne(() => User)
  creator!: User;

  @Column('simple-array')
  participants!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(partial: Partial<CalendarEvent> = {}) {
    super();
    Object.assign(this, partial);
  }
} 