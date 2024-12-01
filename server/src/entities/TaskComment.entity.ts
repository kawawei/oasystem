import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, BaseEntity } from 'typeorm'
import { Task } from './Task.entity'
import { User } from './User.entity'

@Entity('task_comments')
export class TaskComment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('text')
  content!: string

  @Column('simple-array', { nullable: true })
  attachments?: string[]

  @ManyToOne(() => Task, task => task.comments)
  task!: Task

  @ManyToOne(() => User)
  creator!: User

  @CreateDateColumn()
  createdAt!: Date
} 