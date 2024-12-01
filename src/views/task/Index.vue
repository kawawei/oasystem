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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import TaskTemplateManager from './components/TaskTemplateManager.vue'
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
  } catch {
    // 用戶取消或刪除失敗
  }
}
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