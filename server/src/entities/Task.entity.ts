import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, BaseEntity } from 'typeorm';
import { User } from './User.entity';
import { TaskStatus, TaskPriority } from '../types/task';
import { TaskStage } from './TaskStage.entity';
import { TaskComment } from './TaskComment.entity';

@Entity('tasks')
export class Task extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING
  })
  status!: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM
  })
  priority!: TaskPriority;

  @Column({ type: 'int', default: 0 })
  progress!: number;

  @ManyToOne(() => User)
  creator!: User;

  @Column({ type: 'datetime', nullable: true })
  startDate!: Date | null;

  @Column({ type: 'datetime', nullable: true })
  endDate!: Date | null;

  @OneToMany(() => TaskStage, stage => stage.task, {
    cascade: true
  })
  stages!: TaskStage[];

  @OneToMany(() => TaskComment, comment => comment.task, {
    cascade: true
  })
  comments!: TaskComment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(partial: Partial<Task> = {}) {
    super();
    Object.assign(this, partial);
  }
} 