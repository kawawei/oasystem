import { defineStore } from 'pinia'
import type { Task, TaskStatus, ReportData } from '@/types/task'
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
      // 計算報表數據
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

    async deleteTask(id: number) {
      try {
        await api.delete(`/tasks/${id}`)
        this.tasks = this.tasks.filter(task => task.id !== id)
      } catch (error) {
        console.error('Failed to delete task:', error)
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

      stage.status = status
      stage.progress = progress

      // 更新任務整體進度
      task.progress = Math.round(
        task.stages.reduce((acc, s) => acc + s.progress, 0) / task.stages.length
      )

      // 如果所有階段都完成，將任務標記為完成
      if (task.stages.every(s => s.status === 'completed')) {
        task.status = 'completed'
      }

      return task
    }
  }
}) 