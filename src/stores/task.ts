import { defineStore } from 'pinia'
import type { Task, TaskForm, TaskComment, TaskStatus, TaskPriority } from '@/types/task'
import { storageService } from '@/services/storage'
import { emailService } from '@/services/email'

const STORAGE_KEY = 'task_list'

// 添加測試數據
const mockTasks: Task[] = [
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
    loading: false,
    currentTask: null as Task | null
  }),

  getters: {
    // 獲取所有頂層任務（非子任務）
    rootTasks: (state) => {
      return state.tasks.filter(task => !task.parentId)
    },

    // 根據狀態獲取任務
    getTasksByStatus: (state) => (status: string) => {
      return state.tasks.filter(task => task.status === status)
    },

    // 根據負責人獲取任務（修改為檢查階段的負責人）
    getTasksByAssignee: (state) => (userId: number) => {
      return state.tasks.filter(task => 
        task.stages.some(stage => stage.assignee.includes(userId))
      )
    },

    // 獲取子任務
    getSubTasks: (state) => (parentId: number) => {
      return state.tasks.filter(task => task.parentId === parentId)
    },

    // 獲取逾期任務
    getOverdueTasks: (state) => {
      const now = new Date()
      return state.tasks.filter(task => {
        return task.status !== 'completed' && 
               task.status !== 'cancelled' && 
               new Date(task.endDate) < now
      })
    },

    // 獲取階段的任務
    getTasksByStageAssignee: (state) => (userId: number) => {
      return state.tasks.filter(task => 
        task.stages.some(stage => stage.assignee.includes(userId))
      )
    },

    // 獲取特定階段的任務
    getTasksByStage: (state) => (stageName: string) => {
      return state.tasks.filter(task =>
        task.stages.some(stage => stage.name === stageName)
      )
    },

    // 報表相關的 getters
    getTasksInDateRange: (state) => (startDate: Date, endDate: Date) => {
      return state.tasks.filter(task => {
        const taskDate = new Date(task.createdAt)
        return taskDate >= startDate && taskDate <= endDate
      })
    },

    getCompletedTasksInDateRange: (state) => (startDate: Date, endDate: Date) => {
      return state.tasks.filter(task => {
        const completedDate = task.status === 'completed' ? new Date(task.updatedAt) : null
        return completedDate && completedDate >= startDate && completedDate <= endDate
      })
    },

    getOverdueTasksInDateRange: (state) => (startDate: Date, endDate: Date) => {
      return state.tasks.filter(task => {
        const taskEndDate = new Date(task.endDate)
        return taskEndDate >= startDate && 
               taskEndDate <= endDate && 
               taskEndDate < new Date() && 
               task.status !== 'completed' && 
               task.status !== 'cancelled'
      })
    }
  },

  actions: {
    // 初始化數據
    init() {
      const savedTasks = storageService.get<Task[]>(STORAGE_KEY, mockTasks)
      this.tasks = savedTasks || mockTasks // 如果沒有保存的數據，使用測試數據
    },

    // 保存數據
    saveToStorage() {
      storageService.set(STORAGE_KEY, this.tasks)
    },

    // 添加任務（更新以支持階段）
    async addTask(taskForm: TaskForm) {
      this.loading = true
      try {
        const task: Task = {
          id: Date.now(),
          title: taskForm.title,
          description: taskForm.description,
          priority: taskForm.priority,
          status: 'pending' as TaskStatus,
          progress: 0,
          startDate: taskForm.stages[0]?.startDate || '',
          endDate: taskForm.stages[taskForm.stages.length - 1]?.endDate || '',
          createdBy: 1, // TODO: 從用戶store獲取
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          comments: [],
          stages: taskForm.stages.map((stage, index) => ({
            id: Date.now() + index + 1,
            taskId: Date.now(),
            name: stage.name,
            order: stage.order,
            status: 'pending' as TaskStatus,
            assignee: stage.assignee,
            startDate: stage.startDate,
            endDate: stage.endDate,
            progress: 0,
            description: stage.description,
            dependencies: stage.dependencies
          }))
        }
        this.tasks.push(task)
        this.saveToStorage()

        // 發送郵件通知
        task.stages.forEach(stage => {
          stage.assignee.forEach(async userId => {
            await emailService.sendTaskAssignment(task, { id: userId })
          })
        })

        return task
      } finally {
        this.loading = false
      }
    },

    // 更新任務（更新以支持階段）
    async updateTask(id: number, taskForm: TaskForm) {
      this.loading = true
      try {
        const index = this.tasks.findIndex(t => t.id === id)
        if (index > -1) {
          const task = this.tasks[index]
          // 更新基本信息
          task.title = taskForm.title
          task.description = taskForm.description
          task.priority = taskForm.priority
          task.updatedAt = new Date().toISOString()
          
          // 更新階段
          task.stages = taskForm.stages.map(stage => {
            const existingStage = task.stages.find(s => s.id === stage.id)
            if (existingStage) {
              return {
                ...existingStage,
                name: stage.name,
                order: stage.order,
                assignee: stage.assignee,
                startDate: stage.startDate,
                endDate: stage.endDate,
                description: stage.description,
                dependencies: stage.dependencies
              }
            }
            return {
              id: Date.now() + Math.random(),
              taskId: task.id,
              name: stage.name,
              order: stage.order,
              status: 'pending' as TaskStatus,
              assignee: stage.assignee,
              startDate: stage.startDate,
              endDate: stage.endDate,
              progress: 0,
              description: stage.description,
              dependencies: stage.dependencies
            }
          })

          // 更新任務的開始和結束日期
          task.startDate = task.stages[0]?.startDate || task.startDate
          task.endDate = task.stages[task.stages.length - 1]?.endDate || task.endDate
          
          this.saveToStorage()

          // 發送郵件通知
          await emailService.sendTaskUpdate(task, '任務更新')

          return task
        }
        throw new Error('Task not found')
      } finally {
        this.loading = false
      }
    },

    // 刪除任務
    async deleteTask(id: number) {
      this.loading = true
      try {
        // 同時刪除所有子任務
        this.tasks = this.tasks.filter(task => 
          task.id !== id && task.parentId !== id
        )
        this.saveToStorage()
        return true
      } finally {
        this.loading = false
      }
    },

    // 更新任務進度
    async updateProgress(id: number, progress: number) {
      const task = this.tasks.find(t => t.id === id)
      if (task) {
        task.progress = progress
        task.updatedAt = new Date().toISOString()
        // 如果進度為100%，自動將狀態改為審核中
        if (progress === 100) {
          task.status = 'reviewing' as TaskStatus
        }
        this.saveToStorage()
      }
    },

    // 添加任務評論
    async addComment(taskId: number, content: string, attachments: string[] = []) {
      const task = this.tasks.find(t => t.id === taskId)
      if (task) {
        const comment: TaskComment = {
          id: Date.now(),
          taskId,
          content,
          attachments,
          createdBy: 1, // TODO: 從用戶store獲取
          createdAt: new Date().toISOString()
        }
        task.comments = task.comments || []
        task.comments.push(comment)
        task.updatedAt = new Date().toISOString()
        this.saveToStorage()
        return comment
      }
      throw new Error('Task not found')
    },

    // 設置當前任務
    setCurrentTask(task: Task | null) {
      this.currentTask = task
    },

    // 更新階段狀態
    async updateStageStatus(taskId: number, stageId: number, status: TaskStatus, progress: number) {
      const task = this.tasks.find(t => t.id === taskId)
      if (task) {
        const stage = task.stages.find(s => s.id === stageId)
        if (stage) {
          stage.status = status
          stage.progress = progress
          
          // 更新任務整體進度
          task.progress = Math.round(
            task.stages.reduce((sum, s) => sum + s.progress, 0) / task.stages.length
          )
          
          // 如果所有階段都完成，更新任務狀態
          if (task.stages.every(s => s.status === 'completed')) {
            task.status = 'completed' as TaskStatus
          } else if (task.stages.some(s => s.status === 'processing')) {
            task.status = 'processing' as TaskStatus
          }
          
          task.updatedAt = new Date().toISOString()
          this.saveToStorage()

          // 發送郵件通知
          await emailService.sendTaskUpdate(task, '階段狀態更新')

          return task
        }
      }
      throw new Error('Task or stage not found')
    },

    // 檢查階段是否可以開始
    canStartStage(taskId: number, stageId: number): boolean {
      const task = this.tasks.find(t => t.id === taskId)
      if (!task) return false

      const stage = task.stages.find(s => s.id === stageId)
      if (!stage) return false

      // 如果沒有依賴，可以直接開始
      if (!stage.dependencies?.length) return true

      // 檢查所有依賴的階段是否都已完成
      return stage.dependencies.every(depId => {
        const depStage = task.stages.find(s => s.id === depId)
        return depStage?.status === 'completed'
      })
    },

    // 生成報表數據
    generateReport(startDate: Date, endDate: Date) {
      // 獲取時間範圍內的任務
      const tasksInRange = this.getTasksInDateRange(startDate, endDate)
      const completedTasks = this.getCompletedTasksInDateRange(startDate, endDate)
      const overdueTasks = this.getOverdueTasksInDateRange(startDate, endDate)

      // 計算統計數據
      const statistics = {
        totalTasks: tasksInRange.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
        completionRate: tasksInRange.length ? 
          Math.round((completedTasks.length / tasksInRange.length) * 100) : 0,
        overdueRate: tasksInRange.length ? 
          Math.round((overdueTasks.length / tasksInRange.length) * 100) : 0,
        averageDuration: this.calculateAverageDuration(completedTasks),
        statusDistribution: this.calculateStatusDistribution(tasksInRange),
        dailyTrend: this.calculateDailyTrend(startDate, endDate)
      }

      return statistics
    },

    // 計算平均任務持續時間（天）
    calculateAverageDuration(tasks: Task[]) {
      if (!tasks.length) return 0
      
      const totalDays = tasks.reduce((sum, task) => {
        const start = new Date(task.startDate)
        const end = new Date(task.endDate)
        return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      }, 0)

      return Math.round(totalDays / tasks.length)
    },

    // 計算狀態分布
    calculateStatusDistribution(tasks: Task[]) {
      const distribution = {
        pending: 0,
        processing: 0,
        reviewing: 0,
        completed: 0,
        cancelled: 0
      }

      tasks.forEach(task => {
        distribution[task.status]++
      })

      return Object.entries(distribution).map(([name, value]) => ({
        name,
        value
      }))
    },

    // 計算每日趨勢
    calculateDailyTrend(startDate: Date, endDate: Date) {
      const trend: any[] = []
      const currentDate = new Date(startDate)

      while (currentDate <= endDate) {
        const dayStart = new Date(currentDate)
        const dayEnd = new Date(currentDate)
        dayEnd.setHours(23, 59, 59, 999)

        const dayTasks = this.getTasksInDateRange(dayStart, dayEnd)
        const completedTasks = this.getCompletedTasksInDateRange(dayStart, dayEnd)

        trend.push({
          date: currentDate.toISOString().split('T')[0],
          newTasks: dayTasks.length,
          completedTasks: completedTasks.length
        })

        currentDate.setDate(currentDate.getDate() + 1)
      }

      return trend
    },

    // 導出報表數據
    async exportReport(startDate: Date, endDate: Date) {
      const statistics = this.generateReport(startDate, endDate)
      
      // TODO: 實現導出邏輯
      console.log('導出報表數據', statistics)
      
      return statistics
    },

    updateTaskStatus: async (taskId: number, status: TaskStatus) => {
      const task = useTaskStore().tasks.find((t: Task) => t.id === taskId)
      if (task) {
        task.status = status
      }
    }
  }
}) 