<template>
  <div class="task-list">
    <el-table :data="props.tasks" style="width: 100%" border>
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="progress-steps">
            <el-steps :active="getActiveStageIndex(row)" align-center class="custom-steps">
              <el-step 
                v-for="stage in row.stages" 
                :key="stage.id"
                :title="stage.name"
                :description="getStageDescription(stage)"
                :status="getStepStatus(stage)"
              >
                <template #icon>
                  <div class="step-content">
                    <el-tag :type="getStatusType(stage.status)" size="small" class="step-tag">
                      {{ stage.progress }}%
                    </el-tag>
                    <div class="step-buttons">
                      <el-button 
                        v-if="stage.status !== 'completed'"
                        type="success" 
                        size="small"
                        :disabled="!canCompleteStage(row, stage)"
                        @click="handleCompleteStage(row, stage)"
                      >
                        完成
                      </el-button>
                      <el-button 
                        v-else
                        type="warning" 
                        size="small"
                        @click="handleRestartStage(row, stage)"
                      >
                        重新開始
                      </el-button>
                    </div>
                  </div>
                </template>
              </el-step>
            </el-steps>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="標題" min-width="200">
        <template #default="{ row }">
          {{ row.title }} - {{ formatDate(row.dueDate) }}
        </template>
      </el-table-column>
      <el-table-column label="狀態" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="進度" width="200">
        <template #default="{ row }">
          <el-progress 
            :percentage="row.progress"
            :status="getProgressStatus(row)"
            :stroke-width="15"
            class="custom-progress"
          />
        </template>
      </el-table-column>
      <el-table-column label="優先級" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="getPriorityType(row.priority)" size="small">
            {{ getPriorityText(row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right" align="center">
        <template #default="{ row }">
          <el-button-group>
            <el-button size="small" type="info" plain @click="$emit('view', row)">
              查看
            </el-button>
            <el-button size="small" type="primary" plain @click="$emit('edit', row)">
              編輯
            </el-button>
            <el-button size="small" type="danger" plain @click="$emit('delete', row)">
              刪除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { taskStatusOptions, taskPriorityOptions } from '@/types/task'
import type { Task } from '@/types/task'
import { formatDate } from '@/utils/date'
import { useTaskStore } from '@/stores/task'
import { useUserStore } from '@/stores/user'

const taskStore = useTaskStore()
const userStore = useUserStore()

defineEmits(['edit', 'delete', 'view'])

const props = defineProps<{
  tasks: Task[]
}>()

// 獲取活動的階段索引
const getActiveStageIndex = (task: Task) => {
  const index = task.stages.findIndex(stage => stage.status === 'processing')
  return index === -1 ? task.stages.findIndex(stage => stage.status === 'completed') + 1 : index + 1
}

// 獲取步驟狀態
const getStepStatus = (stage: any) => {
  const statusMap: Record<string, string> = {
    pending: 'wait',
    processing: 'process',
    completed: 'finish',
    cancelled: 'error'
  }
  return statusMap[stage.status] || 'wait'
}

// 檢查是否可以完成階段
const canCompleteStage = (task: Task, stage: any) => {
  const stageIndex = task.stages.findIndex(s => s.id === stage.id)
  // 檢查前面的階段是否都已完成
  for (let i = 0; i < stageIndex; i++) {
    if (task.stages[i].status !== 'completed') {
      return false
    }
  }
  return stage.status === 'processing'
}

// 處理完成階段
const handleCompleteStage = async (task: Task, stage: any) => {
  try {
    await taskStore.updateStageProgress(task.id, stage.id, 100)
    // 如果還有下一個階段，將其狀態設為進行中
    const nextStage = task.stages[task.stages.findIndex(s => s.id === stage.id) + 1]
    if (nextStage) {
      await taskStore.updateStageProgress(task.id, nextStage.id, 0)
    }
  } catch (error) {
    console.error('更新階段狀態失敗：', error)
  }
}

// 處理重新開始階段
const handleRestartStage = async (task: Task, stage: any) => {
  try {
    // 將當前階段設為進行中，進度重置為0
    await taskStore.updateStageProgress(task.id, stage.id, 0)
    // 將後續階段都設為待處理
    const currentIndex = task.stages.findIndex(s => s.id === stage.id)
    for (let i = currentIndex + 1; i < task.stages.length; i++) {
      await taskStore.updateStageProgress(task.id, task.stages[i].id, 0)
    }
  } catch (error) {
    console.error('重新開始階段失敗：', error)
  }
}

// 獲取狀態類型
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'info',
    processing: 'primary',
    completed: 'success',
    cancelled: 'danger'
  }
  return map[status] || 'info'
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
    medium: 'warning',
    high: 'danger'
  }
  return map[priority] || 'info'
}

// 獲取優先級文字
const getPriorityText = (priority: string) => {
  const option = taskPriorityOptions.find(opt => opt.value === priority)
  return option ? option.label : '未知'
}

// 獲取進度狀態
const getProgressStatus = (task: Task) => {
  if (task.progress >= 100) return 'success'
  if (task.status === 'cancelled') return 'exception'
  return ''
}

// 獲取階段描述（包含截止日期和負責人）
const getStageDescription = (stage: any) => {
  const assigneeNames = stage.assignee
    ?.map((userId: number) => userStore.getUserById(userId)?.name || '未知用戶')
    .join(', ') || '未指派'
  return `${formatDate(stage.endDate)}\n負責人: ${assigneeNames}`
}
</script>

<style scoped>
.task-list {
  margin-top: 20px;
}

.progress-steps {
  padding: 20px;
}

:deep(.custom-steps) {
  margin: 20px 0;
}

:deep(.custom-steps .el-step) {
  margin-bottom: 20px;
}

:deep(.custom-steps .el-step__line) {
  height: 8px;
  top: 15px;
  background-color: #e4e7ed;
}

:deep(.custom-steps .el-step__line.is-finish) {
  background-color: #67c23a;
}

:deep(.custom-steps .el-step__head.is-process .el-step__line) {
  background-color: #409eff;
}

:deep(.custom-steps .el-step__icon) {
  width: 120px;
  height: auto;
  border: none;
  background: transparent;
  z-index: 2;
}

.step-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-tag {
  font-size: 14px;
  padding: 4px 8px;
}

:deep(.el-step__title) {
  font-size: 14px;
  font-weight: bold;
  margin-top: 8px;
}

:deep(.el-step__description) {
  font-size: 12px;
  margin-top: 4px;
}

:deep(.el-button--small) {
  padding: 6px 12px;
  font-size: 12px;
}

.step-buttons {
  display: flex;
  gap: 8px;
}

:deep(.custom-progress) {
  margin: 8px 0;
}

:deep(.custom-progress .el-progress-bar__outer) {
  border-radius: 4px;
}

:deep(.custom-progress .el-progress-bar__inner) {
  border-radius: 4px;
  transition: all 0.3s ease;
}

:deep(.el-progress-bar__innerText) {
  font-size: 13px;
  font-weight: bold;
}
</style> 