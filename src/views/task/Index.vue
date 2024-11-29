<template>
  <div class="task-container">
    <!-- 頁面標題和操作按鈕 -->
    <div class="page-header">
      <h2>任務管理</h2>
      <div class="header-operations">
        <el-button-group>
          <el-button type="primary" @click="handleAddTask">
            <el-icon><Plus /></el-icon>新增任務
          </el-button>
          <el-button type="success" @click="router.push('/task/report')">
            <el-icon><TrendCharts /></el-icon>統計報表
          </el-button>
        </el-button-group>
        <el-dropdown @command="handleExport" split-button type="primary">
          匯出
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="json">匯出為 JSON</el-dropdown-item>
              <el-dropdown-item command="excel">匯出為 Excel</el-dropdown-item>
              <el-dropdown-item command="csv">匯出為 CSV</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-upload
          class="import-upload"
          :show-file-list="false"
          :before-upload="handleImport"
          accept=".json,.xlsx,.csv"
        >
          <el-button type="primary">
            <el-icon><Upload /></el-icon>匯入
          </el-button>
        </el-upload>
      </div>
    </div>

    <!-- 任務列表 -->
    <el-card>
      <el-table 
        :data="taskStore.tasks"
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="title" label="任務標題" min-width="200" />
        <el-table-column prop="status" label="狀態" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="優先級" width="100">
          <template #default="scope">
            <el-tag :type="getPriorityType(scope.row.priority)">
              {{ getPriorityText(scope.row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="進度" width="200">
          <template #default="scope">
            <el-progress 
              :percentage="scope.row.progress"
              :status="getProgressStatus(scope.row.progress)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="開始日期" width="120" />
        <el-table-column prop="endDate" label="結束日期" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button-group>
              <el-button 
                size="small" 
                @click="handleViewClick(scope.row)"
              >
                查看
              </el-button>
              <el-button 
                size="small" 
                type="primary"
                @click="handleEditTask(scope.row)"
              >
                編輯
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDeleteTask(scope.row)"
              >
                刪除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 任務表單對話框 -->
    <TaskDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :initial-data="currentTask"
      @submit="handleTaskSubmit"
    />

    <!-- 任務詳情對話框 -->
    <el-dialog
      v-model="detailVisible"
      :title="currentTask?.title"
      width="80%"
      class="task-detail-dialog"
    >
      <Detail 
        v-if="currentTask"
        :task="currentTask"
        @update="handleTaskUpdate"
        @delete="handleTaskDelete"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, TrendCharts, Upload } from '@element-plus/icons-vue'
import { useTaskStore } from '@/stores/task'
import { taskStatusOptions, taskPriorityOptions } from '@/types/task'
import type { Task } from '@/types/task'
import TaskDialog from './components/TaskDialog.vue'
import { ExportUtils } from '@/utils/exportUtils'
import { useRouter } from 'vue-router'
import Detail from './components/Detail.vue'

const taskStore = useTaskStore()
const router = useRouter()

// 對話框控制
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const currentTask = ref<Task | null>(null)

// 進度對話框
const progressDialog = reactive({
  visible: false,
  form: {
    progress: 0
  },
  taskId: 0,
  stageId: 0
})

// 篩選表單
const filterForm = reactive({
  status: '',
  priority: '',
  assignee: null as number | null
})

// 用戶列表
const userList = ref([
  { id: 1, name: '張三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
])

// 過濾後的任務列表
const filteredTasks = computed(() => {
  let tasks = taskStore.tasks
  if (filterForm.status) {
    tasks = tasks.filter(task => task.status === filterForm.status)
  }
  if (filterForm.priority) {
    tasks = tasks.filter(task => task.priority === filterForm.priority)
  }
  if (filterForm.assignee) {
    tasks = tasks.filter(task => 
      task.stages.some(stage => stage.assignee.includes(filterForm.assignee!))
    )
  }
  return tasks
})

// 新增任務
const handleAddTask = () => {
  dialogType.value = 'add'
  currentTask.value = null
  dialogVisible.value = true
}

// 編輯任務
const handleEditTask = (task: Task) => {
  dialogType.value = 'edit'
  currentTask.value = task
  dialogVisible.value = true
}

// 刪除任務
const handleDeleteTask = async (task: Task) => {
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
    await taskStore.deleteTask(task.id)
    ElMessage.success('刪除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('刪除失敗')
    }
  }
}

// 提交任務
const handleTaskSubmit = async (form: any) => {
  try {
    if (dialogType.value === 'add') {
      await taskStore.addTask(form)
      ElMessage.success('新增成功')
    } else {
      await taskStore.updateTask(currentTask.value!.id, form)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error('操作失敗')
  }
}

// 更新進度
const handleUpdateProgress = ({ taskId, stage }: { taskId: number; stage: any }) => {
  progressDialog.taskId = taskId
  progressDialog.stageId = stage.id
  progressDialog.form.progress = stage.progress
  progressDialog.visible = true
}

// 提交進度更新
const handleProgressSubmit = async () => {
  try {
    await taskStore.updateStageStatus(
      progressDialog.taskId,
      progressDialog.stageId,
      'processing',
      progressDialog.form.progress
    )
    progressDialog.visible = false
    ElMessage.success('進度更新成功')
  } catch (error) {
    ElMessage.error('更新失敗')
  }
}

// 搜索
const handleSearch = () => {
  // 使用計算屬性自動過濾
}

// 重置篩選
const resetFilter = () => {
  filterForm.status = ''
  filterForm.priority = ''
  filterForm.assignee = null
}

// 初始化
onMounted(() => {
  taskStore.init()
})

// 報表顯示控制
const showReport = ref(false)

// 選中的任務
const selection = ref<Task[]>([])

// 處理匯出
const handleExport = async (format: 'json' | 'excel' | 'csv') => {
  try {
    await ExportUtils.exportTasks(taskStore.tasks, format)
    ElMessage.success('匯出成功')
  } catch (error) {
    ElMessage.error('匯出失敗')
    console.error('Export error:', error)
  }
}

// 處理匯入
const handleImport = async (file: File) => {
  try {
    const tasks = await ExportUtils.importTasks(file)
    // TODO: 實現匯入預覽和確認
    await ElMessageBox.confirm(
      `確定要匯入 ${tasks.length} 條任務數據嗎？`,
      '確認匯入',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 執行匯入
    tasks.forEach(task => taskStore.addTask(task))
    ElMessage.success('匯入成功')
    return false // 阻止自動上傳
  } catch (error) {
    ElMessage.error('匯入失敗')
    console.error('Import error:', error)
    return false
  }
}

// 處理選擇變更
const handleSelectionChange = (val: Task[]) => {
  selection.value = val
}

// 批量更新狀態
const handleBatchUpdateStatus = async (status: TaskStatus) => {
  try {
    await ElMessageBox.confirm(
      `確定要將選中的 ${selection.value.length} 個任務標記為${status}嗎？`,
      '確認操作',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 執行批量更新
    for (const task of selection.value) {
      await taskStore.updateTaskStatus(task.id, status)
    }
    
    ElMessage.success('更新成功')
    selection.value = []
  } catch {
    // 用戶取消操作
  }
}

// 批量刪除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `確定要刪除選中的 ${selection.value.length} 個任務嗎？`,
      '警告',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 執行批量刪除
    for (const task of selection.value) {
      await taskStore.deleteTask(task.id)
    }
    
    ElMessage.success('刪除成功')
    selection.value = []
  } catch {
    // 用戶取消操作
  }
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

// 詳情對話框控制
const detailVisible = ref(false)

// 查看任務詳情
const handleViewTask = (task: Task) => {
  currentTask.value = task
  detailVisible.value = true
}

// 處理任務更新
const handleTaskUpdate = (updatedTask: Task) => {
  // 更新本地數據
  const index = taskStore.tasks.findIndex(t => t.id === updatedTask.id)
  if (index > -1) {
    taskStore.tasks[index] = updatedTask
  }
}

// 處理任務刪除
const handleTaskDelete = async (taskId: number) => {
  await taskStore.deleteTask(taskId)
  detailVisible.value = false
  ElMessage.success('刪除成功')
}

// 修改表格中的查看按鈕點擊事件
const handleViewClick = (row: Task) => {
  handleViewTask(row)
}
</script>

<style scoped>
.task-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.batch-toolbar {
  background-color: #f5f7fa;
  padding: 10px 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selection-info {
  color: #606266;
}

.import-upload {
  display: inline-block;
}

.task-detail-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}
</style> 