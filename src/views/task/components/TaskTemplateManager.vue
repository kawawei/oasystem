<template>
  <el-dialog
    :title="mode === 'use' ? '選擇任務模板' : '管理任務模板'"
    v-model="dialogVisible"
    width="60%"
  >
    <!-- 使用模式：選擇模板 -->
    <div v-if="mode === 'use'" class="template-select">
      <el-table :data="templates" style="width: 100%">
        <el-table-column prop="name" label="模板名稱" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" @click="handleSelect(row)">使用</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 管理模式：管理模板 -->
    <div v-else class="template-manage">
      <div class="manage-header">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增模板
        </el-button>
      </div>

      <el-table :data="templates" style="width: 100%">
        <el-table-column prop="name" label="模板名稱" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="priority" label="優先級" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" @click="handleEdit(row)">編輯</el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">刪除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 模板表單對話框 -->
    <el-dialog
      v-model="formVisible"
      :title="formType === 'add' ? '新增模板' : '編輯模板'"
      append-to-body
      width="50%"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="名稱">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
        <el-form-item label="優先級">
          <el-select v-model="form.priority">
            <el-option
              v-for="priority in taskPriorities"
              :key="priority"
              :label="getPriorityText(priority)"
              :value="priority"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="階段">
          <div class="stages-list">
            <div v-for="(stage, index) in form.stages" :key="index" class="stage-item">
              <el-input v-model="stage.name" placeholder="階段名稱" />
              <el-input v-model="stage.description" placeholder="階段描述" />
              <el-button type="danger" @click="handleRemoveStage(index)">刪除</el-button>
            </div>
          </div>
          <el-button type="primary" @click="handleAddStage">添加階段</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">確定</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { TaskTemplate } from '@/types/task'
import { TaskPriority } from '@/types/task'
import { taskPriorities } from '@/constants/task'

const props = defineProps<{
  visible: boolean
  mode: 'use' | 'manage'
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'select', template: TaskTemplate): void
}>()

// 模板數據
const templates = ref<TaskTemplate[]>([])

// 表單控制
const formVisible = ref(false)
const formType = ref<'add' | 'edit'>('add')
const form = ref({
  name: '',
  description: '',
  priority: TaskPriority.MEDIUM,
  stages: [] as { name: string; description: string }[]
})

// 將 dialogVisible 改為使用 props
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

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

// 處理選擇模板
const handleSelect = (template: TaskTemplate) => {
  emit('select', template)
}

// 處理添加模板
const handleAdd = () => {
  formType.value = 'add'
  form.value = {
    name: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    stages: []
  }
  formVisible.value = true
}

// 處理編輯模板
const handleEdit = (template: TaskTemplate) => {
  formType.value = 'edit'
  form.value = {
    name: template.name,
    description: template.description,
    priority: template.priority,
    stages: template.stages.map(stage => ({
      name: stage.name,
      description: stage.description || ''
    }))
  }
  formVisible.value = true
}

// 處理刪除模板
const handleDelete = async (template: TaskTemplate) => {
  try {
    await ElMessageBox.confirm('確定要刪除此模板嗎？', '警告', {
      type: 'warning'
    })
    // TODO: 調用刪除API
    const index = templates.value.findIndex(t => t.id === template.id)
    if (index > -1) {
      templates.value.splice(index, 1)
    }
    ElMessage.success('刪除成功')
  } catch {
    // 用戶取消或刪除失敗
  }
}

// 處理添加階段
const handleAddStage = () => {
  form.value.stages.push({
    name: '',
    description: ''
  })
}

// 處理刪除階段
const handleRemoveStage = (index: number) => {
  form.value.stages.splice(index, 1)
}

// 處理保存
const handleSave = async () => {
  // TODO: 調用保存API
  formVisible.value = false
  ElMessage.success('保存成功')
}
</script>

<style scoped>
.manage-header {
  margin-bottom: 20px;
}

.stages-list {
  margin-bottom: 10px;
}

.stage-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
</style> 