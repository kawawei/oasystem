import { defineStore } from 'pinia'
import type { Task } from '@/types/task'

interface ReportData {
  totalTasks: number
  completionRate: number
  averageDuration: number
  overdueRate: number
  statusDistribution: { name: string; value: number }[]
  dailyTrend: any[]
}

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as Task[],
    loading: false
  }),

  actions: {
    async fetchTasks() {
      this.loading = true
      try {
        // 臨時：返回本地存儲的任務
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
        // 臨時模擬：生成新的任務 ID
        const newTask = {
          ...task,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
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
        const response = await fetch(`/api/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        })
        return await response.json()
      } catch (error) {
        console.error('Failed to update task:', error)
        throw error
      }
    },

    async deleteTask(id: number) {
      try {
        await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
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
          completedTasks: dayTasks.filter(t => t.status === 'completed').length
        })
        
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      return dailyStats
    }
  }
}) 