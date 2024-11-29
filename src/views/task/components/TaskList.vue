<template>
  <div class="task-list">
    <el-table :data="tasks" style="width: 100%">
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="stage-list">
            <el-steps :active="getActiveStageIndex(row)" finish-status="success">
              <el-step 
                v-for="stage in row.stages" 
                :key="stage.id"
                :title="stage.name"
                :description="getStageDescription(stage)"
              />
            </el-steps>
            <el-table :data="row.stages" style="margin-top: 20px">
              <el-table-column prop="name" label="階段名稱" width="150" />
              <el-table-column label="負責人" width="200">
                <template #default="{ row: stage }">
                  <el-tag 
                    v-for="userId in stage.assignee"
                    :key="userId"
                    class="mx-1"
                  >
                    {{ getUserName(userId) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="狀態" width="120">
                <template #default="{ row: stage }">
                  <el-tag :type="getStatusType(stage.status)">
                    {{ getStatusText(stage.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="進度" width="200">
                <template #default="{ row: stage }">
                  <el-progress 
                    :percentage="stage.progress"
                    :status="getProgressStatus(stage.progress)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="{ row: stage }">
                  <el-button-group>
                    <el-button 
                      size="small"
                      :type="stage.status === 'processing' ? 'success' : 'primary'"
                      :disabled="!canStartStage(row.id, stage.id)"
                      @click="handleStageAction(row.id, stage)"
                    >
                      {{ stage.status === 'processing' ? '完成' : '開始' }}
                    </el-button>
                    <el-button 
                      size="small"
                      @click="handleUpdateProgress(row.id, stage)"
                    >
                      更新進度
                    </el-button>
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="任務標題" min-width="200" />
      <el-table-column prop="priority" label="優先級" width="100">
        <template #default="{ row }">
          <el-tag :type="getPriorityType(row.priority)">
            {{ getPriorityText(row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="狀態" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="總進度" width="200">
        <template #default="{ row }">
          <el-progress 
            :percentage="row.progress"
            :status="getProgressStatus(row.progress)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button size="small" @click="$emit('edit', row)">
              編輯
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="$emit('delete', row)"
            >
              刪除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '@/stores/task'
import { taskStatusOptions, taskPriorityOptions } from '@/types/task'
import type { Task } from '@/types/task'

const props = defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  (e: 'edit', task: Task): void
  (e: 'delete', task: Task): void
}>()

const taskStore = useTaskStore()

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

// 獲取活動的階段索引
const getActiveStageIndex = (task: Task) => {
  return task.stages.findIndex(stage => stage.status === 'processing') + 1
}

// 獲取階段描述
const getStageDescription = (stage: any) => {
  return `負責人: ${stage.assignee.map(id => getUserName(id)).join(', ')}`
}

// 獲取狀態類型
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'info',
    processing: 'primary',
    reviewing: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return map[status] || ''
}

// 獲取狀態文字
const getStatusText = (status: string) => {
  const option = taskStatusOptions.find(opt => opt.value === status)
  return option ? option.label : '未知'
}

// 獲取優先級類型
const getPriorityType = (priority: string) => {
  const map: Record<string, string> = {
    low: 'info',
    medium: '',
    high: 'warning',
    urgent: 'danger'
  }
  return map[priority] || ''
}

// 獲取優先級文字
const getPriorityText = (priority: string) => {
  const option = taskPriorityOptions.find(opt => opt.value === priority)
  return option ? option.label : '未知'
}

// 獲取進度狀態
const getProgressStatus = (progress: number) => {
  if (progress === 100) return 'success'
  if (progress >= 80) return 'warning'
  return ''
}

// 檢查階段是否可以開始
const canStartStage = (taskId: number, stageId: number) => {
  return taskStore.canStartStage(taskId, stageId)
}

// 處理階段操作
const handleStageAction = async (taskId: number, stage: any) => {
  if (stage.status === 'processing') {
    await taskStore.updateStageStatus(taskId, stage.id, 'completed', 100)
  } else {
    await taskStore.updateStageStatus(taskId, stage.id, 'processing', 0)
  }
}

// 處理進度更新
const handleUpdateProgress = (taskId: number, stage: any) => {
  emit('updateProgress', { taskId, stage })
}
</script>

<style scoped>
.task-list {
  margin-top: 20px;
}

.stage-list {
  padding: 20px;
}

.mx-1 {
  margin: 0 5px;
}
</style> 