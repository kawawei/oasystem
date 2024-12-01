import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from 'typeorm'
import { Task } from './Task.entity'
import { TaskStatus } from '../types/task'

@Entity('task_stages')
export class TaskStage extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column('text', { nullable: true })
  description?: string

  @Column()
  order!: number

  @Column('simple-array')
  assignee!: number[]

  @Column('simple-array', { nullable: true })
  dependencies?: number[]

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING
  })
  status!: TaskStatus

  @Column({ type: 'int', default: 0 })
  progress!: number

  @Column({ type: 'datetime', nullable: true })
  startDate?: Date | null

  @Column({ type: 'datetime', nullable: true })
  endDate?: Date | null

  @ManyToOne(() => Task, task => task.stages)
  task!: Task
} 