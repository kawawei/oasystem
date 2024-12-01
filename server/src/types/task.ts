// 任務狀態
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  REVIEWING = 'reviewing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// 任務優先級
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 任務請求類型
export interface TaskRequest {
  title: string
  description: string
  priority: TaskPriority
  startDate?: string
  endDate?: string
  stages: TaskStageRequest[]
}

// 任務階段請求類型
export interface TaskStageRequest {
  name: string
  description?: string
  order: number
  assignee: number[]
  startDate?: string
  endDate?: string
  dependencies?: number[]
} 