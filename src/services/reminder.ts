import { useScheduleStore } from '@/stores/schedule'
import { useTaskStore } from '@/stores/task'
import { ElNotification } from 'element-plus'
import type { Task, TaskStage } from '@/types/task'
import { useRouter } from 'vue-router'

// 定義通知選項類型
export interface NotificationOptions {
  title: string
  body: string
  time?: string
  location?: string
  icon?: string
  onClick?: () => void
}

export class ReminderService {
  private static instance: ReminderService
  private checkInterval: number = 60000 // 每分鐘檢查一次
  private timer: number | null = null
  private notifiedTasks: Set<string> = new Set() // 記錄已提醒的任務

  private constructor() {
    // 私有構造函數，確保單例
  }

  public static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService()
    }
    return ReminderService.instance
  }

  // 開始提醒服務
  public start(): void {
    if (this.timer) return

    this.checkReminders() // 立即檢查一次
    this.timer = window.setInterval(() => {
      this.checkReminders()
    }, this.checkInterval)
  }

  // 停止提醒服務
  public stop(): void {
    if (this.timer) {
      window.clearInterval(this.timer)
      this.timer = null
    }
  }

  // 檢查需要提醒的事項
  private checkReminders(): void {
    this.checkScheduleReminders()
    this.checkTaskReminders()
  }

  // 檢查行程提醒（保持原有功能）
  private checkScheduleReminders(): void {
    const scheduleStore = useScheduleStore()
    const remindEvents = scheduleStore.getRemindEvents

    remindEvents.forEach(event => {
      const startTime = new Date(event.startTime)
      const reminderMinutes = parseInt(event.reminder || '0')
      const reminderTime = new Date(startTime.getTime() - reminderMinutes * 60000)
      
      if (this.shouldRemind(reminderTime)) {
        this.showNotification({
          title: event.title,
          body: '',
          time: startTime.toLocaleString(),
          location: event.location || '無'
        })
      }
    })
  }

  // 檢查任務提醒
  private checkTaskReminders(): void {
    const taskStore = useTaskStore()
    const tasks = taskStore.tasks

    tasks.forEach(task => {
      // 檢查每個階段
      task.stages.forEach(stage => {
        this.checkStageReminder(task, stage)
      })

      // 檢查任務截止日期
      this.checkTaskDeadline(task)
    })
  }

  // 檢查階段提醒
  private checkStageReminder(task: Task, stage: TaskStage): void {
    if (stage.status === 'pending' || stage.status === 'processing') {
      const startTime = new Date(stage.startDate)
      const endTime = new Date(stage.endDate)
      const now = new Date()

      // 生成提醒 ID
      const reminderId = `stage_${stage.id}_${stage.status}`

      // 如果已經提醒過，則跳過
      if (this.notifiedTasks.has(reminderId)) return

      // 階段即將開始提醒（24小時前）
      if (stage.status === 'pending' && 
          this.isWithinHours(startTime, 24) && 
          startTime > now) {
        this.showTaskNotification('階段即將開始', {
          task,
          stage,
          message: `任務「${task.title}」的「${stage.name}」階段將在24小時後開始`
        })
        this.notifiedTasks.add(reminderId)
      }

      // 階段即將結束提醒（48小時前）
      if (stage.status === 'processing' && 
          this.isWithinHours(endTime, 48) && 
          endTime > now) {
        this.showTaskNotification('階段即將結束', {
          task,
          stage,
          message: `任務「${task.title}」的「${stage.name}」階段將在48小時後結束`
        })
        this.notifiedTasks.add(reminderId)
      }
    }
  }

  // 檢查任務截止日期
  private checkTaskDeadline(task: Task): void {
    if (task.status !== 'completed' && task.status !== 'cancelled') {
      const endTime = new Date(task.endDate)
      const now = new Date()

      // 生成提醒 ID
      const reminderId = `task_${task.id}_deadline`

      // 如果已經提醒過，則跳過
      if (this.notifiedTasks.has(reminderId)) return

      // 任務即將截止提醒（72小時前）
      if (this.isWithinHours(endTime, 72) && endTime > now) {
        this.showTaskNotification('任務即將截止', {
          task,
          message: `任務「${task.title}」將在72小時後截止`
        })
        this.notifiedTasks.add(reminderId)
      }
    }
  }

  // 檢查是否在指定小時數內
  private isWithinHours(date: Date, hours: number): boolean {
    const now = new Date()
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diffHours > 0 && diffHours <= hours
  }

  // 顯示任務相關通知
  private showTaskNotification(type: string, data: any): void {
    ElNotification({
      title: type,
      message: data.message,
      type: 'warning',
      duration: 0,
      position: 'top-right',
      onClick: () => {
        // 使用 router 跳轉到任務詳情頁
        const router = useRouter()
        router.push(`/task/${data.task.id}`)
      }
    })
  }

  // 判斷是否應該提醒（用於行程提醒）
  private shouldRemind(reminderTime: Date): boolean {
    const now = new Date()
    const diff = reminderTime.getTime() - now.getTime()
    return diff >= 0 && diff <= 5 * 60000 // 5分鐘內
  }

  // 統一提醒方法
  public showNotification(options: NotificationOptions) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon
      })

      if (options.onClick) {
        notification.onclick = options.onClick
      }
    }
  }

  // 清除提醒記錄
  public clearNotificationRecord(): void {
    this.notifiedTasks.clear()
  }
}

// 導出單例實例
export const reminderService = ReminderService.getInstance() 