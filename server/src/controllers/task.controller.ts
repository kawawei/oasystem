import { Request, Response, RequestHandler } from 'express'
import { Task } from '../entities/Task.entity'
import { User } from '../entities/User.entity'
import { AppError } from '../utils/AppError'

const taskController = {
  // 獲取任務列表
  getTasks: (async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find({
        relations: ['creator', 'stages', 'comments']
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
        relations: ['assignee', 'creator']
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
  }) as RequestHandler
}

export default taskController
