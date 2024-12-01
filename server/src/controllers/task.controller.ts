import { Request, Response, RequestHandler } from 'express'
import { Task } from '../entities/Task.entity'
import { TaskStage } from '../entities/TaskStage.entity'
import { TaskComment } from '../entities/TaskComment.entity'
import { User } from '../entities/User.entity'
import { TaskStatus } from '../types/task'
import { AppError } from '../utils/AppError'
import { In } from 'typeorm'
import { TaskTemplate } from '../entities/TaskTemplate.entity'

const taskController = {
  // 獲取任務列表（支持篩選和排序）
  getTasks: (async (req: Request, res: Response) => {
    try {
      const { status, priority, sortBy, order } = req.query

      // 構建查詢條件
      const where: any = {}
      if (status) {
        where.status = status
      }
      if (priority) {
        where.priority = priority
      }

      // 構建排序條件
      const orderBy: any = {}
      if (sortBy) {
        orderBy[sortBy as string] = order || 'ASC'
      } else {
        orderBy.createdAt = 'DESC'
      }

      const tasks = await Task.find({
        where,
        relations: ['creator', 'stages', 'comments'],
        order: orderBy
      })

      res.json({
        success: true,
        data: tasks
      })
    } catch (error) {
      console.error('Get tasks error:', error)
      res.status(500).json({
        success: false,
        message: '獲取任務列表失敗',
        error: error instanceof Error ? error.message : '未知錯誤'
      })
    }
  }) as RequestHandler,

  // 創建任務
  createTask: (async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未授權'
        })
      }

      const task = new Task()
      const taskData = { ...req.body }
      delete taskData.id
      
      if (taskData.stages) {
        taskData.stages = taskData.stages.map((stage: any) => {
          const newStage = { ...stage }
          delete newStage.id
          return newStage
        })
      }
      
      Object.assign(task, taskData)
      task.creator = req.user as User
      
      const savedTask = await task.save()
      
      res.json({
        success: true,
        data: savedTask
      })
    } catch (error) {
      console.error('Create task error:', error)
      res.status(500).json({
        success: false,
        message: '創建任務失敗',
        error: error instanceof Error ? error.message : '未知錯誤'
      })
    }
  }) as RequestHandler,

  // 更新任務
  updateTask: (async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const task = await Task.findOne({ where: { id } })
      
      if (!task) {
        return res.status(404).json({
          success: false,
          message: '任務不存在'
        })
      }

      Object.assign(task, req.body)
      const updatedTask = await task.save()

      res.json({
        success: true,
        data: updatedTask
      })
    } catch (error) {
      console.error('Update task error:', error)
      res.status(500).json({
        success: false,
        message: '更新任務失敗',
        error: error instanceof Error ? error.message : '未知錯誤'
      })
    }
  }) as RequestHandler,

  // 刪除任務
  deleteTask: (async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const task = await Task.findOne({ where: { id } })
      
      if (!task) {
        return res.status(404).json({
          success: false,
          message: '任務不存在'
        })
      }

      await task.remove()
      res.json({
        success: true,
        message: '刪除成功'
      })
    } catch (error) {
      console.error('Delete task error:', error)
      res.status(500).json({
        success: false,
        message: '刪除任務失敗',
        error: error instanceof Error ? error.message : '未知錯誤'
      })
    }
  }) as RequestHandler,

  // 獲取單個任務
  getTask: (async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const task = await Task.findOne({ 
        where: { id },
        relations: ['creator', 'stages', 'comments']
      })
      
      if (!task) {
        return res.status(404).json({
          success: false,
          message: '任務不存在'
        })
      }

      res.json({
        success: true,
        data: task
      })
    } catch (error) {
      console.error('Get task error:', error)
      res.status(500).json({
        success: false,
        message: '獲取任務失敗',
        error: error instanceof Error ? error.message : '未知錯誤'
      })
    }
  }) as RequestHandler,

  // 更新任務階段狀態
  updateStageStatus: (async (req: Request, res: Response) => {
    try {
      const { taskId, stageId } = req.params
      const { status } = req.body

      const stage = await TaskStage.findOne({ 
        where: { id: stageId },
        relations: ['task']
      })

      if (!stage) {
        return res.status(404).json({
          success: false,
          message: '任務階段不存在'
        })
      }

      if (stage.task.id !== taskId) {
        return res.status(400).json({
          success: false,
          message: '任務階段不屬於指定任務'
        })
      }

      await stage.updateStatus(status)

      res.json({
        success: true,
        data: stage
      })
    } catch (error) {
      console.error('Update stage status error:', error)
      res.status(error instanceof AppError ? error.statusCode : 500).json({
        success: false,
        message: error instanceof Error ? error.message : '更新任務階段狀態失敗'
      })
    }
  }) as RequestHandler,

  // 更新任務階段依賴關係
  updateStageDependencies: (async (req: Request, res: Response) => {
    try {
      const { taskId, stageId } = req.params
      const { dependencies } = req.body

      const stage = await TaskStage.findOne({ 
        where: { id: stageId },
        relations: ['task']
      })

      if (!stage) {
        return res.status(404).json({
          success: false,
          message: '任務階段不存在'
        })
      }

      if (stage.task.id !== taskId) {
        return res.status(400).json({
          success: false,
          message: '任務階段不屬於指定任務'
        })
      }

      stage.dependencies = dependencies
      await stage.save()

      res.json({
        success: true,
        data: stage
      })
    } catch (error) {
      console.error('Update stage dependencies error:', error)
      res.status(error instanceof AppError ? error.statusCode : 500).json({
        success: false,
        message: error instanceof Error ? error.message : '更新任務階段依賴關係失敗'
      })
    }
  }) as RequestHandler,

  // 更新任務階段進度
  updateStageProgress: (async (req: Request, res: Response) => {
    try {
      const { taskId, stageId } = req.params
      const { progress } = req.body

      if (progress < 0 || progress > 100) {
        throw new AppError('進度必須在 0-100 之間', 400)
      }

      const stage = await TaskStage.findOne({ 
        where: { id: stageId },
        relations: ['task']
      })

      if (!stage) {
        throw new AppError('任務階段不存在', 404)
      }

      if (stage.task.id !== taskId) {
        throw new AppError('任務階段不屬於指定任務', 400)
      }

      stage.progress = progress
      await stage.save()

      // 更新任務整體進度
      const allStages = await TaskStage.find({ where: { task: { id: taskId } } })
      const totalProgress = allStages.reduce((sum, s) => sum + s.progress, 0)
      const averageProgress = Math.round(totalProgress / allStages.length)
      
      stage.task.progress = averageProgress
      await stage.task.save()

      res.json({
        success: true,
        data: stage
      })
    } catch (error) {
      console.error('Update stage progress error:', error)
      res.status(error instanceof AppError ? error.statusCode : 500).json({
        success: false,
        message: error instanceof Error ? error.message : '更新任務階段進度失敗'
      })
    }
  }) as RequestHandler,

  // 批量更新任務階段
  batchUpdateStages: (async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params
      const { stages } = req.body

      if (!Array.isArray(stages)) {
        throw new AppError('無效的請求數據格式', 400)
      }

      const task = await Task.findOne({ where: { id: taskId } })
      if (!task) {
        throw new AppError('任務不存在', 404)
      }

      const existingStages = await TaskStage.find({
        where: { task: { id: taskId } }
      })

      const stageMap = new Map(existingStages.map(stage => [stage.id, stage]))
      const updatedStages = []

      for (const stageData of stages) {
        const stage = stageMap.get(stageData.id)
        if (stage) {
          // 更新現有階段
          Object.assign(stage, stageData)
          updatedStages.push(await stage.save())
        }
      }

      res.json({
        success: true,
        data: updatedStages
      })
    } catch (error) {
      console.error('Batch update stages error:', error)
      res.status(error instanceof AppError ? error.statusCode : 500).json({
        success: false,
        message: error instanceof Error ? error.message : '批量更新任務階段失敗'
      })
    }
  }) as RequestHandler,

  // 重新排序任務階段
  reorderStages: (async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params
      const { stageIds } = req.body

      if (!Array.isArray(stageIds)) {
        throw new AppError('無效的請求數據格式', 400)
      }

      const stages = await TaskStage.find({
        where: { 
          id: In(stageIds),
          task: { id: taskId }
        }
      })

      if (stages.length !== stageIds.length) {
        throw new AppError('部分任務階段不存在或不屬於該任務', 400)
      }

      // 更新順序
      const updates = stageIds.map((id, index) => {
        const stage = stages.find(s => s.id === id)
        if (stage) {
          stage.order = index + 1
          return stage.save()
        }
      })

      await Promise.all(updates)

      const updatedStages = await TaskStage.find({
        where: { task: { id: taskId } },
        order: { order: 'ASC' }
      })

      res.json({
        success: true,
        data: updatedStages
      })
    } catch (error) {
      console.error('Reorder stages error:', error)
      res.status(error instanceof AppError ? error.statusCode : 500).json({
        success: false,
        message: error instanceof Error ? error.message : '重新排序任務階段失敗'
      })
    }
  }) as RequestHandler,

  // 添加任務評論
  addComment: (async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params
      const { content, attachments } = req.body

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未授權'
        })
      }

      const task = await Task.findOne({ where: { id: taskId } })
      if (!task) {
        return res.status(404).json({
          success: false,
          message: '任務不存在'
        })
      }

      const comment = new TaskComment()
      comment.content = content
      comment.attachments = attachments
      comment.task = task
      comment.creator = req.user as User

      await comment.save()

      res.json({
        success: true,
        data: comment
      })
    } catch (error) {
      console.error('Add comment error:', error)
      res.status(500).json({
        success: false,
        message: '添加評論失敗',
        error: error instanceof Error ? error.message : '未知錯誤'
      })
    }
  }) as RequestHandler,

  // 獲取任務評論
  getComments: (async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params
      const comments = await TaskComment.find({
        where: { task: { id: taskId } },
        relations: ['creator'],
        order: { createdAt: 'DESC' }
      })

      res.json({
        success: true,
        data: comments
      })
    } catch (error) {
      console.error('Get comments error:', error)
      res.status(500).json({
        success: false,
        message: '獲取評論失敗',
        error: error instanceof Error ? error.message : '未知錯誤'
      })
    }
  }) as RequestHandler,

  // 從模板創建任務
  createFromTemplate: (async (req: Request, res: Response) => {
    try {
      const { templateId } = req.params
      const template = await TaskTemplate.findOne({
        where: { id: templateId },
        relations: ['stages']
      })

      if (!template) {
        return res.status(404).json({
          success: false,
          message: '模板不存在'
        })
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未授權'
        })
      }

      const task = new Task()
      task.title = `${template.name} - ${new Date().toLocaleDateString()}`
      task.description = template.description
      task.priority = template.priority
      task.creator = req.user as User
      task.startDate = new Date()
      task.endDate = new Date()
      task.endDate.setDate(task.endDate.getDate() + 7) // 默認設置一週的期限

      // 先保存任務
      await task.save()

      // 創建並保存任務階段
      const stages = await Promise.all(template.stages.map(async templateStage => {
        const stage = new TaskStage()
        stage.name = templateStage.name
        stage.description = templateStage.description
        stage.order = templateStage.order
        stage.assignee = templateStage.assignee
        stage.dependencies = templateStage.dependencies
        stage.task = task
        return await stage.save()
      }))

      // 構造返回數據，避免循環引用
      const responseData = {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        progress: task.progress,
        startDate: task.startDate,
        endDate: task.endDate,
        creator: task.creator,
        stages: stages.map(stage => ({
          id: stage.id,
          name: stage.name,
          description: stage.description,
          order: stage.order,
          assignee: stage.assignee,
          dependencies: stage.dependencies,
          status: stage.status,
          progress: stage.progress,
          startDate: stage.startDate,
          endDate: stage.endDate
        }))
      }

      res.json({
        success: true,
        data: responseData
      })
    } catch (error) {
      console.error('從模板創建任務失敗:', error)
      res.status(500).json({
        success: false,
        message: '從模板創建任務失敗',
        error: error instanceof Error ? error.message : '未知錯誤'
      })
    }
  }) as RequestHandler
}

export default taskController
