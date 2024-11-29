<template>
  <div class="task-detail">
    <!-- 頁面標題和操作按鈕 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>返回
        </el-button>
        <h2>{{ task?.title }}</h2>
      </div>
      <div class="header-operations">
        <el-button-group>
          <el-button type="primary" @click="handleEdit">
            編輯
          </el-button>
          <el-button 
            type="danger" 
            @click="handleDelete"
            :disabled="task?.status === 'completed' || task?.status === 'cancelled'"
          >
            刪除
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 任務詳情 -->
    <el-card v-if="task">
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
                  @click="handleStageAction(task.id, row)"
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useTaskStore } from '@/stores/task'
import { taskStatusOptions, taskPriorityOptions } from '@/types/task'
import type { Task } from '@/types/task'
import TaskComments from './components/TaskComments.vue'
import TaskDialog from './components/TaskDialog.vue'
import { formatDate, formatDateTime } from '@/utils/dateUtils'

const route = useRoute()
const router = useRouter()
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

// 獲取任務數據
const task = computed(() => {
  const taskId = parseInt(route.params.id as string)
  return taskStore.tasks.find(t => t.id === taskId)
})

// 獲取活動的階段索引
const getActiveStageIndex = computed(() => {
  if (!task.value) return 0
  return task.value.stages.findIndex(stage => stage.status === 'processing') + 1
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
const handleStageAction = async (taskId: number, stage: any) => {
  if (stage.status === 'processing') {
    await taskStore.updateStageStatus(taskId, stage.id, 'completed', 100)
    ElMessage.success('階段已完成')
  } else {
    await taskStore.updateStageStatus(taskId, stage.id, 'processing', 0)
    ElMessage.success('階段已開始')
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
    task.value!.id,
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
    await taskStore.deleteTask(task.value!.id)
    ElMessage.success('刪除成功')
    router.push('/task')
  } catch {
    // 用戶取消操作
  }
}

// 處理評論添加
const handleAddComment = async (data: { content: string; attachments: string[] }) => {
  await taskStore.addComment(task.value!.id, data.content, data.attachments)
  ElMessage.success('評論添加成功')
}

// 處理任務更新
const handleTaskSubmit = async (form: any) => {
  await taskStore.updateTask(task.value!.id, form)
  dialogVisible.value = false
  ElMessage.success('更新成功')
}

// 初始化
onMounted(() => {
  if (!task.value) {
    ElMessage.error('任務不存在')
    router.push('/task')
  }
})
</script>

<style scoped>
.task-detail {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-operations {
  display: flex;
  gap: 10px;
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