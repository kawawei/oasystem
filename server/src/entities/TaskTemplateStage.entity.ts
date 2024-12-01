import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from 'typeorm'
import { TaskTemplate } from './TaskTemplate.entity'

@Entity('task_template_stages')
export class TaskTemplateStage extends BaseEntity {
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

  @Column({ type: 'int', default: 0 })
  estimatedHours?: number

  @Column('simple-array', { nullable: true })
  dependencies?: number[]

  @ManyToOne(() => TaskTemplate, template => template.stages, {
    onDelete: 'CASCADE'
  })
  template!: TaskTemplate
} 