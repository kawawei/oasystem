<template>
  <div class="task-container">
    <!-- 頁面標題和操作按鈕 -->
    <div class="page-header">
      <h2>任務管理</h2>
      <div class="header-operations">
        <el-button-group>
          <!-- 新增任務按鈕 -->
          <el-button type="primary" @click="handleAddTask">
            <el-icon><Plus /></el-icon>新增任務
          </el-button>
          <!-- 使用模板按鈕 -->
          <el-button type="success" @click="showTemplateManager = true">
            <el-icon><Document /></el-icon>使用模板
          </el-button>
          <!-- 管理模板按鈕 -->
          <el-button @click="handleManageTemplates">
            <el-icon><Setting /></el-icon>管理模板
          </el-button>
        </el-button-group>
      </div>
    </div>

<<<<<<< HEAD
    <!-- 篩選表單 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="狀態">
          <el-select v-model="filterForm.status" clearable>
            <el-option 
              v-for="option in taskStatusOptions" 
              :key="option.value" 
              :label="option.label" 
              :value="option.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="負責人">
          <el-select v-model="filterForm.assignee" clearable>
            <el-option 
              v-for="user in userList" 
              :key="user.id" 
              :label="user.name" 
              :value="user.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 批量操作工具栏 -->
    <div v-if="selection.length > 0" class="batch-toolbar">
      <span class="selection-info">已選擇 {{ selection.length }} 項</span>
      <div class="batch-actions">
        <el-button-group>
          <el-button @click="handleBatchUpdateStatus('completed')">標記完成</el-button>
          <el-button @click="handleBatchUpdateStatus('cancelled')">標記取消</el-button>
          <el-button type="danger" @click="handleBatchDelete">批量刪除</el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 任務列表 -->
    <el-card>
      <el-table 
        :data="filteredTasks"
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
              @click="handleUpdateProgress({ taskId: scope.row.id, stage: scope.row })"
              style="cursor: pointer"
=======
    <!-- 篩選區域 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="狀態">
          <el-select v-model="filterForm.status" clearable>
            <el-option
              v-for="status in taskStatuses"
              :key="status"
              :label="getStatusText(status)"
              :value="status"
>>>>>>> fff90013977063794b1581743f79d2c7030ca096
            />
          </el-select>
        </el-form-item>
        <el-form-item label="優先級">
          <el-select v-model="filterForm.priority" clearable>
            <el-option
              v-for="priority in taskPriorities"
              :key="priority"
              :label="getPriorityText(priority)"
              :value="priority"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">篩選</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 任務列表 -->
    <el-table
      v-loading="taskStore.loading"
      :data="filteredTasks"
      style="width: 100%"
    >
      <el-table-column prop="title" label="標題" />
      <el-table-column prop="status" label="狀態" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="優先級" width="100">
        <template #default="{ row }">
          <el-tag :type="getPriorityType(row.priority)">
            {{ getPriorityText(row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button size="small" @click="handleEdit(row)">編輯</el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDelete(row)"
            >刪除</el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 任務模板管理器 -->
    <TaskTemplateManager 
      v-model:visible="showTemplateManager"
      :mode="templateMode"
      @select="handleTemplateSelect"
    />

    <!-- 任務表單對話框 -->
    <TaskDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :initial-data="currentTask"
      @submit="handleTaskSubmit"
    />
<<<<<<< HEAD

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

    <!-- 進度更新對話框 -->
    <el-dialog
      v-model="progressDialog.visible"
      title="更新進度"
      width="30%"
    >
      <el-form>
        <el-form-item label="進度">
          <el-slider v-model="progressDialog.form.progress" :step="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="progressDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleProgressSubmit">確定</el-button>
      </template>
    </el-dialog>
=======
>>>>>>> fff90013977063794b1581743f79d2c7030ca096
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
<<<<<<< HEAD
import { Plus, TrendCharts, Upload } from '@element-plus/icons-vue'
import { useTaskStore } from '@/stores/task'
import { taskStatusOptions, taskPriorityOptions, type TaskStatus, type Task } from '@/types/task'
=======
import TaskTemplateManager from './components/TaskTemplateManager.vue'
>>>>>>> fff90013977063794b1581743f79d2c7030ca096
import TaskDialog from './components/TaskDialog.vue'
import { Plus, Document, Setting } from '@element-plus/icons-vue'
import type { Task, TaskTemplate, TaskForm, TaskStatus, TaskPriority } from '@/types/task'
import { useTaskStore } from '@/stores/task'
import { taskStatuses, taskPriorities } from '../../constants/task'

const taskStore = useTaskStore()

const showTemplateManager = ref(false)

// 對話框控制
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const currentTask = ref<Task | null>(null)

// 篩選表單
const filterForm = ref({
  status: '',
  priority: ''
})

// 篩選後的任務列表
const filteredTasks = computed(() => {
  const tasks = Array.isArray(taskStore.tasks) ? taskStore.tasks : []
  return tasks.filter(task => {
    if (filterForm.value.status && task.status !== filterForm.value.status) {
      return false
    }
    if (filterForm.value.priority && task.priority !== filterForm.value.priority) {
      return false
    }
    return true
  })
})

// 處理篩選
const handleFilter = () => {
  // 篩選邏輯已通過計算屬性實現
}

// 重置篩選
const resetFilter = () => {
  filterForm.value = {
    status: '',
    priority: ''
  }
}

// 在組件掛載時加載任務列表
onMounted(async () => {
  try {
    await taskStore.fetchTasks()
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    ElMessage.error('加載任務列表失敗')
  }
})

// 模板管理器模式
const templateMode = ref<'use' | 'manage'>('use')

// 處理管理模板
const handleManageTemplates = () => {
  templateMode.value = 'manage'
  showTemplateManager.value = true
}

// 處理使用模板
const handleTemplateSelect = (template: TaskTemplate) => {
  if (templateMode.value === 'use') {
    dialogType.value = 'add'
    currentTask.value = {
      id: 0,
      title: template.name,
      description: template.description,
      status: 'pending',
      priority: template.priority,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      progress: 0,
      createdBy: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stages: template.stages.map((stage, index) => ({
        ...stage,
        id: index + 1,
        taskId: 0,
        status: 'pending',
        assignee: [],
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        progress: 0
      }))
    }
    dialogVisible.value = true
  }
  showTemplateManager.value = false
}

// 處理新增任務
const handleAddTask = () => {
  dialogType.value = 'add'
  currentTask.value = null
  dialogVisible.value = true
}

// 處理任務提交
const handleTaskSubmit = async (form: TaskForm) => {
  try {
    const task: Task = {
      ...form,
      id: currentTask.value?.id || 0,
      status: currentTask.value?.status || 'pending',
      progress: currentTask.value?.progress || 0,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      createdBy: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stages: form.stages.map((stage, index) => ({
        ...stage,
        id: index + 1,
        taskId: currentTask.value?.id || 0,
        status: 'pending',
        progress: 0
      }))
    }

    if (dialogType.value === 'add') {
      await taskStore.addTask(task)
      await taskStore.fetchTasks()
      ElMessage.success('新增任務成功')
    } else {
      await taskStore.updateTask(currentTask.value?.id || 0, task)
      await taskStore.fetchTasks()
      ElMessage.success('更新任務成功')
    }
    dialogVisible.value = false
    currentTask.value = null
    dialogType.value = 'add'
  } catch (error) {
    console.error('Failed to submit task:', error)
    ElMessage.error('操作失敗，請稍後重試')
  }
}

// 狀態文本轉換
const getStatusText = (status: TaskStatus) => {
  const map: Record<TaskStatus, string> = {
    pending: '待處理',
    processing: '進行中',
    reviewing: '審核中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status]
}

// 優先級文本轉換
const getPriorityText = (priority: TaskPriority) => {
  const map: Record<TaskPriority, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '緊急'
  }
  return map[priority]
}

// 狀態類型映射
const getStatusType = (status: TaskStatus) => {
  const map: Record<TaskStatus, string> = {
    pending: 'info',
    processing: 'warning',
    reviewing: 'primary',
    completed: 'success',
    cancelled: 'danger'
  }
  return map[status]
}

// 優先級類型映射
const getPriorityType = (priority: TaskPriority) => {
  const map: Record<TaskPriority, string> = {
    low: 'info',
    medium: 'warning',
    high: 'danger',
    urgent: 'danger'
  }
  return map[priority]
}

// 處理編輯
const handleEdit = (task: Task) => {
  dialogType.value = 'edit'
  currentTask.value = task
  dialogVisible.value = true
}

// 處理刪除
const handleDelete = async (task: Task) => {
  try {
    await ElMessageBox.confirm('確定要刪除此任務嗎？', '警告', {
      type: 'warning'
    })
    await taskStore.deleteTask(task.id)
    ElMessage.success('刪除成功')
<<<<<<< HEAD
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
=======
>>>>>>> fff90013977063794b1581743f79d2c7030ca096
  } catch {
    // 用戶取消或刪除失敗
  }
}
<<<<<<< HEAD

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
const getStatusType = (status: string): 'success' | 'warning' | 'info' | 'danger' | 'primary' => {
  const map: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
    pending: 'info',
    processing: 'primary',
    reviewing: 'warning',
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
const getPriorityType = (priority: string): 'success' | 'warning' | 'info' | 'danger' | 'primary' => {
  const map: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
    low: 'info',
    medium: 'primary',
    high: 'warning',
    urgent: 'danger'
  }
  return map[priority] || 'info'
}

// 獲取優先級文字
const getPriorityText = (priority: string) => {
  const option = taskPriorityOptions.find(opt => opt.value === priority)
  return option ? option.label : '未知'
}

// 獲取進度狀態
const getProgressStatus = (progress: number): '' | 'success' | 'exception' | 'warning' => {
  if (progress === 100) return 'success'
  if (progress >= 80) return 'warning'
  if (progress >= 50) return ''
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
=======
>>>>>>> fff90013977063794b1581743f79d2c7030ca096
</script>

<style scoped>
.task-container {
  padding: 20px;
}

.filter-section {
  margin: 20px 0;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style> 