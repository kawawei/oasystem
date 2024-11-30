import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BaseEntity } from 'typeorm'
import { TaskPriority } from '../types/task'

@Entity('task_templates')
export class TaskTemplate extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column('text')
  description!: string

  @Column()
  category!: string

  @OneToMany('TaskTemplateStage', 'template')
  stages!: any[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM
  })
  priority!: TaskPriority
}

// 添加預設模板數據
export const defaultTemplates = [
  {
    name: '影片製作流程',
    description: '標準影片製作流程模板',
    category: 'video',
    priority: TaskPriority.MEDIUM,
    stages: [
      {
        name: 'A Cut',
        description: '完成初步剪輯',
        order: 1,
        estimatedHours: 8,
        assignee: [],
        dependencies: []
      },
      {
        name: '審片',
        description: '審核並提供修改意見',
        order: 2,
        estimatedHours: 4,
        assignee: [],
        dependencies: [1]
      },
      {
        name: '字幕製作',
        description: '添加字幕和最終修改',
        order: 3,
        estimatedHours: 6,
        assignee: [],
        dependencies: [2]
      }
    ]
  }
] 