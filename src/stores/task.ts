import { defineStore } from 'pinia'
import type { Task, TaskStatus, ReportData, TaskTemplate, TaskComment } from '@/types/task'
import { emailService as _emailService } from '@/services/email'
import { api } from '../services/api'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as Task[],
    loading: false
  }),

  actions: {
    async fetchTasks() {
      this.loading = true
      try {
        const response = await api.get<Task[]>('/tasks')
        this.tasks = response.data.data
        return this.tasks
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
        this.tasks = []
      } finally {
        this.loading = false
      }
    },

    async addTask(task: Task) {
      try {
        const response = await api.post<Task>('/tasks', task)
        const newTask = response.data.data
        this.tasks = [...this.tasks, newTask]
        return newTask
      } catch (error) {
        console.error('Failed to add task:', error)
        throw error
      }
    },

    generateReport(startDate: Date, endDate: Date): ReportData {
      // 計算��表數據
      const filteredTasks = this.tasks.filter(task => {
        const taskDate = new Date(task.createdAt)
        return taskDate >= startDate && taskDate <= endDate
      })
      
      return {
        totalTasks: filteredTasks.length,
        completionRate: this.calculateCompletionRate(filteredTasks),
        averageDuration: this.calculateAverageDuration(filteredTasks),
        overdueRate: this.calculateOverdueRate(filteredTasks),
        statusDistribution: this.getStatusDistribution(filteredTasks),
        dailyTrend: this.getDailyTrend(filteredTasks, startDate, endDate)
      }
    },

    async exportReport(startDate: Date, endDate: Date) {
      const reportData = this.generateReport(startDate, endDate)
      try {
        // 這裡實現導出邏輯，例如：
        const response = await fetch('/api/tasks/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startDate, endDate, data: reportData })
        })
        return await response.blob()
      } catch (error) {
        console.error('Failed to export report:', error)
        throw error
      }
    },

    async updateTask(id: number, task: Task) {
      try {
        const response = await api.put(`/tasks/${id}`, task)
        return response.data
      } catch (error) {
        console.error('Failed to update task:', error)
        throw error
      }
    },

    async updateTaskStatus(id: number, status: TaskStatus) {
      try {
        const response = await api.put(`/tasks/${id}/status`, { status })
        const task = this.tasks.find(t => t.id === id)
        if (task) {
          task.status = status
        }
        return response.data
      } catch (error) {
        console.error('Failed to update task status:', error)
        throw error
      }
    },

    async deleteTask(id: string | number) {
      try {
        // 先從本地狀態中移除
        const taskIndex = this.tasks.findIndex(task => task.id === id)
        if (taskIndex === -1) {
          throw new Error('Task not found')
        }
        
        // 調用 API 刪除
        const response = await api.delete(`/tasks/${id}`)
        
        // 只有在 API 調用成功後才更新本地狀態
        if (response.status === 200 || response.status === 204) {
          this.tasks.splice(taskIndex, 1)
          return true
        } else {
          throw new Error('Failed to delete task')
        }
      } catch (error: any) {
        console.error('Failed to delete task:', error)
        if (error.response) {
          console.error('Error response:', error.response.data)
        }
        // 如果刪除失敗，重新獲取任務列表
        await this.fetchTasks()
        throw error
      }
    },

    calculateCompletionRate(tasks: Task[]) {
      const completed = tasks.filter(t => t.status === 'completed').length
      return tasks.length ? Math.round((completed / tasks.length) * 100) : 0
    },

    calculateAverageDuration(tasks: Task[]) {
      return tasks.length ? Math.round(tasks.reduce((acc, t) => 
        acc + (new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / (1000 * 3600 * 24), 0
      ) / tasks.length) : 0
    },

    calculateOverdueRate(tasks: Task[]) {
      const overdue = tasks.filter(t => new Date(t.endDate) < new Date() && t.status !== 'completed').length
      return tasks.length ? Math.round((overdue / tasks.length) * 100) : 0
    },

    getStatusDistribution(tasks: Task[]) {
      return ['pending', 'processing', 'reviewing', 'completed', 'cancelled'].map(status => ({
        name: status,
        value: tasks.filter(t => t.status === status).length
      }))
    },

    getDailyTrend(tasks: Task[], startDate: Date, endDate: Date) {
      const dailyStats = []
      const currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        const dayTasks = tasks.filter(task => {
          const taskDate = new Date(task.createdAt)
          return taskDate.toDateString() === currentDate.toDateString()
        })
        
        dailyStats.push({
          date: currentDate.toISOString().split('T')[0],
          newTasks: dayTasks.length,
          completedTasks: dayTasks.filter(t => t.status === 'completed').length,
          averageDuration: this.calculateAverageDuration(dayTasks),
          overdueTasks: dayTasks.filter(t => new Date(t.endDate) < new Date() && t.status !== 'completed').length,
          overdueRate: this.calculateOverdueRate(dayTasks)
        })
        
        currentDate.setDate(currentDate.getDate() + 1)
      }

      return dailyStats
    },

    canStartStage(taskId: number, stageId: number): boolean {
      const task = this.tasks.find(t => t.id === taskId)
      if (!task) return false
      
      const stage = task.stages.find(s => s.id === stageId)
      if (!stage) return false

      // 檢查依賴的階段是否都已完成
      return !stage.dependencies?.some(depId => {
        const depStage = task.stages.find(s => s.id === depId)
        return depStage && depStage.status !== 'completed'
      })
    },

    async updateStageStatus(taskId: number, stageId: number, status: TaskStatus, progress: number) {
      const task = this.tasks.find(t => t.id === taskId)
      if (!task) throw new Error('Task not found')

      const stage = task.stages.find(s => s.id === stageId)
      if (!stage) throw new Error('Stage not found')

      try {
        const response = await api.put(`/tasks/${taskId}/stages/${stageId}/status`, {
          status,
          progress
        })
        
        const updatedStage = response.data.data
        Object.assign(stage, updatedStage)
        
        // 更新任務整體進度
        task.progress = Math.round(
          task.stages.reduce((acc, s) => acc + s.progress, 0) / task.stages.length
        )

        return task
      } catch (error) {
        console.error('Failed to update stage status:', error)
        throw error
      }
    },

    async updateStageProgress(taskId: number, stageId: number, progress: number) {
      const task = this.tasks.find(t => t.id === taskId)
      if (!task) throw new Error('Task not found')

      const stage = task.stages.find(s => s.id === stageId)
      if (!stage) throw new Error('Stage not found')

      try {
        const response = await api.put(`/tasks/${taskId}/stages/${stageId}/progress`, {
          progress
        })
        
        const updatedStage = response.data.data
        Object.assign(stage, updatedStage)
        
        // 更新任務整體進度
        task.progress = Math.round(
          task.stages.reduce((acc, s) => acc + s.progress, 0) / task.stages.length
        )

        return task
      } catch (error) {
        console.error('Failed to update stage progress:', error)
        throw error
      }
    },

    // 獲取任務模板列表
    async getTemplates(): Promise<TaskTemplate[]> {
      try {
        const response = await api.get('/task-templates')
        return (response.data as any).data as TaskTemplate[]
      } catch (error) {
        console.error('Failed to fetch templates:', error)
        throw error
      }
    },

    // 從模板創建任務
    async createFromTemplate(templateId: number) {
      try {
        const response = await api.post(`/tasks/from-template/${templateId}`, {})
        const task = (response.data as any).data as Task
        this.tasks = [...this.tasks, task]
        return task
      } catch (error) {
        console.error('Failed to create task from template:', error)
        throw error
      }
    },

    // 將任務保存為模板
    async saveAsTemplate(task: Task, name: string) {
      try {
        const template = {
          name,
          description: task.description,
          priority: task.priority,
          stages: task.stages.map(stage => ({
            name: stage.name,
            description: stage.description,
            order: stage.order,
            dependencies: stage.dependencies
          }))
        }
        const response = await api.post('/task-templates', template)
        return response.data.data
      } catch (error) {
        console.error('Failed to save as template:', error)
        throw error
      }
    },

    async addComment(taskId: number, content: string, attachments: string[] = []) {
      const task = this.tasks.find(t => t.id === taskId)
      if (!task) throw new Error('Task not found')

      try {
        const response = await api.post(`/tasks/${taskId}/comments`, {
          content,
          attachments
        })
        
        const newComment = response.data.data as TaskComment
        if (!task.comments) task.comments = []
        task.comments.push(newComment)
        
        return newComment
      } catch (error) {
        console.error('Failed to add comment:', error)
        throw error
      }
    }
  }
}) 