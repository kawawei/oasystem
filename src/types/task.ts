// 任務狀態
export type TaskStatus = 'pending' | 'processing' | 'reviewing' | 'completed' | 'cancelled'

// 任務優先級
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 任務類型
export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  startDate: string
  endDate: string
  progress: number
  attachments?: string[]
  createdBy: number
  createdAt: string
  updatedAt: string
  parentId?: number
  subTasks?: Task[]
  comments?: TaskComment[]
  stages: TaskStage[]
}

// 任務評論
export interface TaskComment {
  id: number
  taskId: number
  content: string
  createdBy: number
  createdAt: string
  attachments?: string[]
}

// 任務階段
export interface TaskStage {
  id: number
  taskId: number
  name: string
  order: number
  status: TaskStatus
  assignee: number[]
  startDate: string
  endDate: string
  progress: number
  description?: string
  dependencies?: number[]
}

// 任務表單
export interface TaskForm {
  id?: number
  title: string
  description: string
  priority: TaskPriority
  stages: TaskStageForm[]
}

// 任務階段表單
export interface TaskStageForm {
  id?: number
  name: string
  order: number
  assignee: number[]
  startDate: string
  endDate: string
  description?: string
  dependencies?: number[]
}

// 任務狀態選項
export const taskStatusOptions = [
  { label: '待處理', value: 'pending' },
  { label: '進行中', value: 'processing' },
  { label: '審核中', value: 'reviewing' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

// 任務優先級選項
export const taskPriorityOptions = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '緊急', value: 'urgent' }
]

// 任務表單驗證規則
export const taskRules = {
  title: [
    { required: true, message: '請輸入任務標題', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '請選擇優先級', trigger: 'change' }
  ]
}

// 階段表單驗證規則
export const stageRules = {
  name: [
    { required: true, message: '請輸入階段名稱', trigger: 'blur' }
  ],
  assignee: [
    { required: true, message: '請選擇負責人', trigger: 'change' }
  ],
  startDate: [
    { required: true, message: '請選擇開始日���', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '請選擇結束日期', trigger: 'change' }
  ]
}

// 任務階段模板
export const taskStageTemplates = {
  // 影片製作模板
  video: [
    {
      name: 'A Cut',
      description: '影片初剪',
      order: 1
    },
    {
      name: '審片',
      description: '影片審核與修改建議',
      order: 2,
      dependencies: [1]
    },
    {
      name: '字幕製作',
      description: '添加字幕與最終修改',
      order: 3,
      dependencies: [2]
    }
  ],
  // 設計專案模板
  design: [
    {
      name: '設計草圖',
      order: 1
    },
    {
      name: '細節設計',
      order: 2,
      dependencies: [1]
    },
    {
      name: '最終修改',
      order: 3,
      dependencies: [2]
    }
  ]
}

// 模板分類
export enum TemplateCategory {
  DEFAULT = 'default',
  VIDEO = 'video',
  DESIGN = 'design',
  DEVELOPMENT = 'development'
}

// 更新任務模板接口
export interface TaskTemplate {
  id: number
  name: string
  description: string
  priority: TaskPriority
  category: TemplateCategory  // 添加分類
  stages: {
    name: string
    description?: string
    order: number
    dependencies?: number[]
    estimatedHours?: number  // 添加預估工時
  }[]
}

// 模板分類選項
export const templateCategoryOptions = [
  { label: '影片製作', value: 'video' },
  { label: '設計專案', value: 'design' },
  { label: '開發專案', value: 'development' },
  { label: '行銷活動', value: 'marketing' },
  { label: '其他', value: 'other' }
]

// 更新預設任務模板
export const defaultTaskTemplates: TaskTemplate[] = [
  {
    id: 1,
    name: '影片製作',
    description: '標準影片製作流程',
    priority: TaskPriority.MEDIUM,
    category: TemplateCategory.VIDEO,
    stages: [
      {
        name: 'A Cut',
        description: '影片初剪',
        order: 1,
        estimatedHours: 16
      },
      {
        name: '審片',
        description: '影片審核與修改建議',
        order: 2,
        dependencies: [1],
        estimatedHours: 4
      },
      {
        name: '字幕製',
        description: '添加字幕與最終修改',
        order: 3,
        dependencies: [2],
        estimatedHours: 8
      }
    ]
  },
  {
    id: 2,
    name: '設計專案',
    description: '標準設計流程',
    priority: TaskPriority.MEDIUM,
    category: TemplateCategory.DESIGN,
    stages: [
      {
        name: '設計草圖',
        description: '初步設計概念',
        order: 1,
        estimatedHours: 8
      },
      {
        name: '細節設計',
        description: '完善設計細節',
        order: 2,
        dependencies: [1],
        estimatedHours: 16
      },
      {
        name: '最終修改',
        description: '根據反饋進行最終修改',
        order: 3,
        dependencies: [2],
        estimatedHours: 8
      }
    ]
  },
  {
    id: 3,
    name: '網站開發',
    description: '標準網站開發流程',
    priority: TaskPriority.HIGH,
    category: TemplateCategory.DEVELOPMENT,
    stages: [
      {
        name: '需求分析',
        description: '收集和分析需求',
        order: 1,
        estimatedHours: 8
      },
      {
        name: '設計開發',
        description: '進行設計和開發工作',
        order: 2,
        dependencies: [1],
        estimatedHours: 40
      },
      {
        name: '測試部署',
        description: '進行測試和部署',
        order: 3,
        dependencies: [2],
        estimatedHours: 16
      }
    ]
  }
]

// 報表數據接口
export interface ReportData {
  totalTasks: number
  completionRate: number
  averageDuration: number
  overdueRate: number
  statusDistribution: { name: string; value: number }[]
  dailyTrend: {
    date: string
    newTasks: number
    completedTasks: number
    averageDuration: number
    overdueTasks: number
    overdueRate: number
  }[]
} 