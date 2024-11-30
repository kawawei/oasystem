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
        </el-button-group>
      </div>
    </div>

    <!-- 任務模板管理器 -->
    <TaskTemplateManager 
      v-model:visible="showTemplateManager"
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
import { ref } from 'vue'
import TaskTemplateManager from './components/TaskTemplateManager.vue'
import TaskDialog from './components/TaskDialog.vue'
import { Plus, Document } from '@element-plus/icons-vue'
import type { Task, TaskTemplate, TaskForm } from '@/types/task'
import { useTaskStore } from '@/stores/task'

const taskStore = useTaskStore()

const showTemplateManager = ref(false)

// 對話框控制
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const currentTask = ref<Task | null>(null)

// 處理模板選擇
const handleTemplateSelect = (template: TaskTemplate) => {
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

// 處理新增任務
const handleAddTask = () => {
  dialogType.value = 'add'
  currentTask.value = null
  dialogVisible.value = true
}

// 處理任務提交
const handleTaskSubmit = async (form: TaskForm) => {
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
  } else {
    await taskStore.updateTask(currentTask.value?.id || 0, task)
  }
  dialogVisible.value = false
}
</script> 