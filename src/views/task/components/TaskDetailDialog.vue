<template>
  <el-dialog
    :title="task?.title"
    v-model="dialogVisible"
    width="800px"
  >
    <div class="task-detail">
      <!-- 任務信息 -->
      <div class="task-info">
        <el-descriptions :column="2">
          <el-descriptions-item label="優先級">
            <el-tag :type="getPriorityType(task?.priority)">
              {{ getPriorityText(task?.priority) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="狀態">
            <el-tag :type="getStatusType(task?.status)">
              {{ getStatusText(task?.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="創建時間">
            {{ formatTime(task?.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新時間">
            {{ formatTime(task?.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>
        <div class="task-description">
          <h4>任務描述</h4>
          <p>{{ task?.description }}</p>
        </div>
      </div>

      <!-- 階段信息 -->
      <div class="task-stages">
        <h4>任務階段</h4>
        <el-steps :active="getActiveStageIndex(task)" finish-status="success">
          <el-step 
            v-for="stage in task?.stages" 
            :key="stage.id"
            :title="stage.name"
            :description="getStageDescription(stage)"
          />
        </el-steps>
      </div>

      <!-- 評論區域 -->
      <div class="task-comments">
        <h4>任務評論</h4>
        <TaskComments
          :comments="task?.comments || []"
          @add="handleAddComment"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { taskStatusOptions, taskPriorityOptions } from '@/types/task'
import type { Task } from '@/types/task'
import TaskComments from './TaskComments.vue'

const props = defineProps<{
  visible: boolean
  task: Task | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'add-comment', data: { content: string; attachments: string[] }): void
}>()

// 對話框可見性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 獲取狀態類型
const getStatusType = (status?: string) => {
  const map: Record<string, string> = {
    pending: 'info',
    processing: 'primary',
    reviewing: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return map[status || ''] || ''
}

// 獲取狀態文字
const getStatusText = (status?: string) => {
  const option = taskStatusOptions.find(opt => opt.value === status)
  return option ? option.label : '未知'
}

// 獲取優先級類型
const getPriorityType = (priority?: string) => {
  const map: Record<string, string> = {
    low: 'info',
    medium: '',
    high: 'warning',
    urgent: 'danger'
  }
  return map[priority || ''] || ''
}

// 獲取優先級文字
const getPriorityText = (priority?: string) => {
  const option = taskPriorityOptions.find(opt => opt.value === priority)
  return option ? option.label : '未知'
}

// 格式化時間
const formatTime = (time?: string) => {
  if (!time) return '未知'
  return new Date(time).toLocaleString()
}

// 獲取活動的階段索引
const getActiveStageIndex = (task?: Task | null) => {
  if (!task) return 0
  return task.stages.findIndex(stage => stage.status === 'processing') + 1
}

// 獲取階段描述
const getStageDescription = (stage: any) => {
  return `負責人: ${stage.assignee.map(id => getUserName(id)).join(', ')}`
}

// 模擬用戶列表
const userList = [
  { id: 1, name: '張三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
]

// 獲取用戶名稱
const getUserName = (userId: number) => {
  return userList.find(user => user.id === userId)?.name || '未知用戶'
}

// 處理添加評論
const handleAddComment = (data: { content: string; attachments: string[] }) => {
  emit('add-comment', data)
}
</script>

<style scoped>
.task-detail {
  padding: 20px;
}

.task-info {
  margin-bottom: 30px;
}

.task-description {
  margin-top: 20px;
}

.task-stages {
  margin-bottom: 30px;
}

h4 {
  margin-bottom: 15px;
  color: #303133;
  font-weight: bold;
}
</style> 