import { defineStore } from 'pinia'
import type { Task, TaskStatus, TaskPriority, ReportData } from '@/types/task'
import { emailService as _emailService } from '@/services/email'
import * as _axios from 'axios'

// 添加測試數據
const _mockTasks: Task[] = [
  {
    id: 1,
    title: '製作產品宣傳視頻',
    description: '為新產品製作宣傳視頻，包含產品特點介紹和使用演示',
    status: 'processing' as TaskStatus,
    priority: 'high' as TaskPriority,
    startDate: '2024-01-20',
    endDate: '2024-02-10',
    progress: 30,
    createdBy: 1,
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
    stages: [
      {
        id: 101,
        taskId: 1,
        name: 'A Cut',
        order: 1,
        status: 'completed' as TaskStatus,
        assignee: [2],
        startDate: '2024-01-20',
        endDate: '2024-01-25',
        progress: 100,
        description: '完成初步剪輯'
      },
      {
        id: 102,
        taskId: 1,
        name: '審片',
        order: 2,
        status: 'processing' as TaskStatus,
        assignee: [1, 3],
        startDate: '2024-01-26',
        endDate: '2024-02-01',
        progress: 50,
        description: '審核並提供修改意見'
      },
      {
        id: 103,
        taskId: 1,
        name: '字幕製作',
        order: 3,
        status: 'pending' as TaskStatus,
        assignee: [2],
        startDate: '2024-02-02',
        endDate: '2024-02-10',
        progress: 0,
        description: '添加字幕和最終修改'
      }
    ],
    comments: [
      {
        id: 1001,
        taskId: 1,
        content: '初剪已完成，請查看並提供修改意見',
        createdBy: 2,
        createdAt: '2024-01-25T15:00:00Z'
      }
    ]
  }
]

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as Task[],
    loading: false
  }),

  actions: {
    async fetchTasks() {
      this.loading = true
      try {
        // 臨時：返回測試數據
        this.tasks = _mockTasks
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