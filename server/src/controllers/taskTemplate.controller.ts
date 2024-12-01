import { Request, Response } from 'express'
import { TaskTemplate } from '../entities/TaskTemplate.entity'
import { TaskTemplateStage } from '../entities/TaskTemplateStage.entity'
import { AppError } from '../utils/AppError'

interface TaskTemplateController {
  getTemplates: (req: Request, res: Response) => Promise<void>
  createTemplate: (req: Request, res: Response) => Promise<void>
  updateTemplate: (req: Request, res: Response) => Promise<void>
  deleteTemplate: (req: Request, res: Response) => Promise<void>
}

const taskTemplateController: TaskTemplateController = {
  // 獲取模板列表
  getTemplates: async (req: Request, res: Response) => {
    try {
      const templates = await TaskTemplate.find({
        relations: ['stages'],
        order: { createdAt: 'DESC' }
      })
      
      // 如果沒有模板，返回空數組而不是錯誤
      if (!templates.length) {
        res.json({ success: true, data: [] })
        return
      }
      
      res.json({ success: true, data: templates })
    } catch (error) {
      console.error('獲取模板列表失敗:', error)
      throw new AppError('獲取模板列表失敗', 500)
    }
  },

  // 創建模板
  createTemplate: async (req: Request, res: Response) => {
    try {
      const templateData = req.body
      const template = new TaskTemplate()
      
      template.name = templateData.name
      template.description = templateData.description
      template.category = templateData.category
      template.priority = templateData.priority
      
      // 先保存模板
      await template.save()
      
      // 創建並保存階段
      const stages = await Promise.all(templateData.stages.map(async (stageData: any) => {
        const stage = new TaskTemplateStage()
        stage.name = stageData.name
        stage.description = stageData.description
        stage.order = stageData.order
        stage.assignee = stageData.assignee
        stage.estimatedHours = stageData.estimatedHours
        stage.dependencies = stageData.dependencies
        stage.template = template
        return await stage.save()
      }))

      // 構造返回數據，避免循環引用
      const responseData = {
        ...template,
        stages: stages.map(stage => ({
          id: stage.id,
          name: stage.name,
          description: stage.description,
          order: stage.order,
          assignee: stage.assignee,
          estimatedHours: stage.estimatedHours,
          dependencies: stage.dependencies
        }))
      }
      
      res.json({
        success: true,
        data: responseData
      })
    } catch (error) {
      console.error('創建模板失敗:', error)
      res.status(500).json({
        success: false,
        message: '創建模板失敗',
        error: error instanceof Error ? error.message : '未知錯誤'
      })
    }
  },

  // 更新模板
  updateTemplate: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const templateData = req.body
      const template = await TaskTemplate.findOne({ 
        where: { id },
        relations: ['stages']
      })
      
      if (!template) {
        throw new AppError('模板不存在', 404)
      }

      template.name = templateData.name
      template.description = templateData.description
      template.category = templateData.category
      
      await template.save()

      res.json({
        success: true,
        data: template
      })
    } catch (error) {
      throw new AppError('更新模板失敗', 500)
    }
  },

  // 刪除模板
  deleteTemplate: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const template = await TaskTemplate.findOne({ where: { id } })
      
      if (!template) {
        throw new AppError('模板不存在', 404)
      }

      await template.remove()
      res.json({
        success: true,
        message: '刪除成功'
      })
    } catch (error) {
      throw new AppError('刪除模板失敗', 500)
    }
  }
}

export default taskTemplateController 