import { Request, Response } from 'express'
import { Task } from '../entities/Task.entity'
import { AppError } from '../utils/AppError'

// 添加控制器類型聲明
interface TaskController {
  getTasks: (req: Request, res: Response) => Promise<void>
  createTask: (req: Request, res: Response) => Promise<void>
  updateTask: (req: Request, res: Response) => Promise<void>
  deleteTask: (req: Request, res: Response) => Promise<void>
}

const taskController: TaskController = {
  // 獲取任務列表
  getTasks: async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find({
        relations: ['assignee', 'creator']
      })
      res.json({
        success: true,
        data: tasks
      })
    } catch (error) {
      throw new AppError('獲取任務列表失敗', 500)
    }
  },

  // 創建任務
  createTask: async (req: Request, res: Response) => {
    try {
      const task = new Task()
      Object.assign(task, req.body)
      
      const savedTask = await task.save()
      
      res.json({
        success: true,
        data: savedTask
      })
    } catch (error) {
      throw new AppError('創建任務失敗', 500)
    }
  },

  // 更新任務
  updateTask: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const task = await Task.findOne({ where: { id } })
      
      if (!task) {
        throw new AppError('任務不存在', 404)
      }

      Object.assign(task, req.body)
      const updatedTask = await task.save()

      res.json({
        success: true,
        data: updatedTask
      })
    } catch (error) {
      throw new AppError('更新任務失敗', 500)
    }
  },

  // 刪除任務
  deleteTask: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const task = await Task.findOne({ where: { id } })
      
      if (!task) {
        throw new AppError('任務不存在', 404)
      }

      await task.remove()
      res.json({
        success: true,
        message: '刪除成功'
      })
    } catch (error) {
      throw new AppError('刪除任務失敗', 500)
    }
  }
}

export default taskController
