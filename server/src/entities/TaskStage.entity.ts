import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, BaseEntity, BeforeUpdate, BeforeInsert } from 'typeorm'
import { Task } from './Task.entity'
import { User } from './User.entity'
import { TaskStatus } from '../types/task'
import { AppError } from '../utils/AppError'

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

  @ManyToMany(() => User)
  @JoinTable({
    name: 'task_stage_assignees',
    joinColumn: { name: 'stage_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' }
  })
  assignee!: User[]

  @Column('simple-array', { nullable: true })
  dependencies?: string[]

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

  async updateProgress(progress: number) {
    if (progress < 0 || progress > 100) {
      throw new AppError('進度必須在 0-100 之間', 400)
    }

    this.progress = progress
    await this.save()

    // 更新任務整體進度
    if (this.task) {
      const allStages = await TaskStage.find({ where: { task: { id: this.task.id } } })
      const totalProgress = allStages.reduce((sum, stage) => sum + stage.progress, 0)
      const averageProgress = Math.round(totalProgress / allStages.length)
      
      this.task.progress = averageProgress
      await this.task.save()
    }
  }

  @BeforeUpdate()
  @BeforeInsert()
  async validateDependencies() {
    if (this.dependencies && this.dependencies.length > 0) {
      const dependentStages = await TaskStage.findByIds(this.dependencies)
      if (dependentStages.length !== this.dependencies.length) {
        throw new AppError('依賴的任務階段不存在', 400)
      }

      const visited = new Set<string>()
      const checkCycle = async (stageId: string): Promise<boolean> => {
        if (visited.has(stageId)) {
          return true
        }
        visited.add(stageId)
        const stage = await TaskStage.findOne({ where: { id: stageId } })
        if (stage?.dependencies) {
          for (const depId of stage.dependencies) {
            if (await checkCycle(depId)) {
              return true
            }
          }
        }
        visited.delete(stageId)
        return false
      }

      for (const depId of this.dependencies) {
        if (await checkCycle(depId)) {
          throw new AppError('檢測到循環依賴', 400)
        }
      }
    }
  }

  async updateStatus(newStatus: TaskStatus) {
    if (newStatus === TaskStatus.IN_PROGRESS && this.dependencies?.length) {
      const dependentStages = await TaskStage.findByIds(this.dependencies)
      const hasUnfinishedDependencies = dependentStages.some(
        stage => stage.status !== TaskStatus.COMPLETED
      )
      if (hasUnfinishedDependencies) {
        throw new AppError('有依賴項尚未完成', 400)
      }
    }

    this.status = newStatus

    if (newStatus === TaskStatus.IN_PROGRESS && !this.startDate) {
      this.startDate = new Date()
    } else if (newStatus === TaskStatus.COMPLETED && !this.endDate) {
      this.endDate = new Date()
    }

    if (newStatus === TaskStatus.COMPLETED) {
      this.progress = 100
    } else if (newStatus === TaskStatus.PENDING) {
      this.progress = 0
    }

    await this.save()

    if (this.task) {
      const allStages = await TaskStage.find({ where: { task: { id: this.task.id } } })
      const totalProgress = allStages.reduce((sum, stage) => sum + stage.progress, 0)
      const averageProgress = Math.round(totalProgress / allStages.length)
      
      this.task.progress = averageProgress
      if (allStages.every(stage => stage.status === TaskStatus.COMPLETED)) {
        this.task.status = TaskStatus.COMPLETED
      } else if (allStages.some(stage => stage.status === TaskStatus.IN_PROGRESS)) {
        this.task.status = TaskStatus.IN_PROGRESS
      }
      await this.task.save()
    }
  }
} 