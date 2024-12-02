<template>
  <div class="task-detail">
    <!-- 任務詳情 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="task-status">
            <el-tag :type="getPriorityType(task.priority)">
              {{ getPriorityText(task.priority) }}
            </el-tag>
            <el-tag :type="getStatusType(task.status)">
              {{ getStatusText(task.status) }}
            </el-tag>
          </div>
          <div class="header-operations">
            <el-button-group>
              <el-button type="primary" @click="handleEdit">
                編輯
              </el-button>
              <el-button 
                type="danger" 
                @click="handleDelete"
                :disabled="task.status === 'completed' || task.status === 'cancelled'"
              >
                刪除
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <!-- 基本信息 -->
      <el-descriptions :column="2" border>
        <el-descriptions-item label="創建時間">
          {{ formatDateTime(task.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新時間">
          {{ formatDateTime(task.updatedAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="開始日期">
          {{ formatDate(task.startDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="結束日期">
          {{ formatDate(task.endDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="總進度" :span="2">
          <el-progress 
            :percentage="task.progress"
            :status="getProgressStatus(task.progress)"
          />
        </el-descriptions-item>
        <el-descriptions-item label="任務描述" :span="2">
          {{ task.description }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 階段列表 -->
      <div class="stages-section">
        <h3>任務階段</h3>
        <el-steps :active="getActiveStageIndex" finish-status="success">
          <el-step 
            v-for="stage in task.stages" 
            :key="stage.id"
            :title="stage.name"
            :description="getStageDescription(stage)"
          />
        </el-steps>

        <el-table :data="task.stages" style="margin-top: 20px">
          <el-table-column prop="name" label="階段名稱" width="150" />
          <el-table-column label="負責人" width="200">
            <template #default="{ row }">
              <el-tag 
                v-for="userId in row.assignee"
                :key="userId"
                class="mx-1"
              >
                {{ getUserName(userId) }}
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
          <el-table-column label="進度" width="200">
            <template #default="{ row }">
              <el-progress 
                :percentage="row.progress"
                :status="getProgressStatus(row.progress)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button-group>
                <el-button 
                  size="small"
                  :type="row.status === 'processing' ? 'success' : 'primary'"
                  :disabled="!canStartStage(task.id, row.id)"
                  @click="handleStageAction(task.id, row.id)"
                >
                  {{ row.status === 'processing' ? '完成' : '開始' }}
                </el-button>
                <el-button 
                  size="small"
                  @click="handleUpdateProgress(task.id, row)"
                >
                  更新進度
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 任務評論 -->
      <div class="comments-section">
        <h3>任務評論</h3>
        <TaskComments
          :comments="task.comments"
          @add="handleAddComment"
        />
      </div>
    </el-card>

    <!-- 進度更新對話框 -->
    <el-dialog
      title="更新進度"
      v-model="progressDialog.visible"
      width="400px"
    >
      <el-form :model="progressDialog.form">
        <el-form-item label="完成進度">
          <el-slider
            v-model="progressDialog.form.progress"
            :step="10"
            show-stops
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="progressDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleProgressSubmit">確定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 任務編輯對話框 -->
    <TaskDialog
      v-if="dialogVisible"
      v-model:visible="dialogVisible"
      type="edit"
      :initial-data="task"
      @submit="handleTaskSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTaskStore } from '@/stores/task'
import { taskStatusOptions, taskPriorityOptions } from '@/types/task'
import type { Task } from '@/types/task'
import TaskComments from './TaskComments.vue'
import TaskDialog from './TaskDialog.vue'
import { formatDate, formatDateTime } from '@/utils/dateUtils'

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  (e: 'update', task: Task): void
  (e: 'delete', taskId: number): void
}>()

const taskStore = useTaskStore()

// 對話框控制
const dialogVisible = ref(false)
const progressDialog = reactive({
  visible: false,
  form: {
    progress: 0
  },
  stageId: 0
})

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

// 獲取活動的階段索引
const getActiveStageIndex = computed(() => {
  return props.task.stages.findIndex(stage => stage.status === 'processing') + 1
})

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

// 檢查階段是否可以開始
const canStartStage = (taskId: number, stageId: number) => {
  return taskStore.canStartStage(taskId, stageId)
}

// 處理階段操作
const handleStageAction = async (taskId: number, stageId: number) => {
  try {
    const stage = props.task.stages.find(s => s.id === stageId)
    if (!stage) return
    
    if (stage.status === 'processing') {
      await taskStore.updateStageStatus(taskId, stageId, 'completed', 100)
      ElMessage.success('階段已完成')
    } else {
      await taskStore.updateStageStatus(taskId, stageId, 'processing', 0)
      ElMessage.success('階段已開始')
    }
  } catch (error) {
    console.error('Failed to update stage:', error)
    ElMessage.error('操作失敗')
  }
}

// 處理進度更新
const handleUpdateProgress = (taskId: number, stage: any) => {
  progressDialog.stageId = stage.id
  progressDialog.form.progress = stage.progress
  progressDialog.visible = true
}

// 處理進度提交
const handleProgressSubmit = async () => {
  await taskStore.updateStageStatus(
    props.task.id,
    progressDialog.stageId,
    'processing',
    progressDialog.form.progress
  )
  progressDialog.visible = false
  ElMessage.success('進度更新成功')
}

// 處理編輯
const handleEdit = () => {
  dialogVisible.value = true
}

// 處理刪除
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      '確定要刪除該任務嗎？',
      '警告',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    emit('delete', props.task.id)
  } catch {
    // 用戶取消操作
  }
}

// 處理評論添加
const handleAddComment = async (data: { content: string; attachments: string[] }) => {
  await taskStore.addComment(props.task.id, data.content, data.attachments)
  ElMessage.success('評論添加成功')
}

// 處理任務更新
const handleTaskSubmit = async (form: Task) => {
  try {
    const response = await taskStore.updateTask(props.task.id, form)
    if (response.data) {
      Object.assign(props.task, response.data)
      dialogVisible.value = false
      ElMessage.success('更新成功')
    }
  } catch (error) {
    console.error('Failed to update task:', error)
    ElMessage.error('更新失敗')
  }
}
</script>

<style scoped>
.task-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-status {
  display: flex;
  gap: 10px;
}

.stages-section,
.comments-section {
  margin-top: 30px;
}

h3 {
  margin-bottom: 20px;
  font-weight: bold;
  color: #303133;
}

.mx-1 {
  margin: 0 5px;
}
</style> 