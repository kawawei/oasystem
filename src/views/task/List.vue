<template>
  <div class="task-list">
    <!-- 頁面標題和操作按鈕 -->
    <div class="page-header">
      <h2>任務管理</h2>
      <div class="header-operations">
        <el-button-group>
          <el-button type="primary" @click="handleAddTask">
            <el-icon><Plus /></el-icon>新增任務
          </el-button>
          <el-button @click="showTemplateDialog">
            <el-icon><Files /></el-icon>使用模板
          </el-button>
          <el-button type="success" @click="$router.push('/task/report')">
            <el-icon><TrendCharts /></el-icon>統計報表
          </el-button>
        </el-button-group>
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
        <el-table-column label="操作" width="260">
          <template #default="scope">
            <el-button 
              size="small"
              type="info"
              plain
              @click="router.push(`/task/${scope.row.id}`)"
            >
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button 
              size="small" 
              type="primary"
              @click="handleEditTask(scope.row)"
            >
              <el-icon><Edit /></el-icon>
              編輯
            </el-button>
            <el-button 
              size="small"
              type="danger"
              @click="handleDeleteTask(scope.row)"
            >
              <el-icon><Delete /></el-icon>
              刪除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 對話框組件 -->
    <TaskDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :initial-data="currentTask"
      @submit="handleTaskSubmit"
    />

    <!-- 模板選擇對話框 -->
    <el-dialog
      v-model="templateDialog.visible"
      title="選擇任務模板"
      width="600px"
    >
      <el-table :data="templates" style="width: 100%">
        <el-table-column prop="name" label="模板名稱" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="category" label="分類">
          <template #default="{ row }">
            {{ getTemplateCategoryLabel(row.category) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small"
              @click="handleUseTemplate(row)"
            >
              使用
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, TrendCharts, Files, View, Edit, Delete } from '@element-plus/icons-vue'
import { useTaskStore } from '@/stores/task'
import { taskStatusOptions, templateCategoryOptions } from '@/types/task'
import type { Task, TaskTemplate } from '@/types/task'
import TaskDialog from './components/TaskDialog.vue'

const taskStore = useTaskStore()

const router = useRouter()

// 對話框控制
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const currentTask = ref<Task | null>(null)

// 選中的任務
const selection = ref<Task[]>([])

// 模板相關
const templateDialog = reactive({
  visible: false
})
const templates = ref<TaskTemplate[]>([])

// 處理方法
const handleAddTask = () => {
  dialogType.value = 'add'
  currentTask.value = null
  dialogVisible.value = true
}

const handleSelectionChange = (val: Task[]) => {
  selection.value = val
}

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

// 狀態處理方法
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

const getStatusText = (status: string) => {
  const option = taskStatusOptions.find(opt => opt.value === status)
  return option ? option.label : '未知'
}

// 顯示模板對話框
const showTemplateDialog = async () => {
  templates.value = await taskStore.getTemplates()
  templateDialog.visible = true
}

// 獲取模板分類標籤
const getTemplateCategoryLabel = (category: string) => {
  const option = templateCategoryOptions.find(opt => opt.value === category)
  return option ? option.label : '其他'
}

// 使用模板
const handleUseTemplate = async (template: TaskTemplate) => {
  try {
    await taskStore.createFromTemplate(template.id)
    ElMessage.success('創建成功')
    templateDialog.visible = false
  } catch (error) {
    ElMessage.error('創建失敗')
  }
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

// 加載數據
onMounted(async () => {
  try {
    await taskStore.fetchTasks()
    if (!taskStore.tasks.length) {
      ElMessage.warning('暫無任務數據')
    }
  } catch (error) {
    ElMessage.error('加載任務列表失敗')
  }
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-operations {
  display: flex;
  gap: 10px;
}
</style> 