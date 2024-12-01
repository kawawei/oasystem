import type { TaskStatus } from '@/types/task'
import { TaskPriority } from '@/types/task'

export const taskStatuses: TaskStatus[] = [
  'pending',
  'processing',
  'reviewing',
  'completed',
  'cancelled'
]

export const taskPriorities: TaskPriority[] = [
  TaskPriority.LOW,
  TaskPriority.MEDIUM,
  TaskPriority.HIGH,
  TaskPriority.URGENT
] 