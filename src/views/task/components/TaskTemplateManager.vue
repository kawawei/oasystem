<template>
  <div class="template-manager">
    <!-- 頁面標題和操作按鈕 -->
    <div class="page-header">
      <h2>任務模板管理</h2>
      <el-button type="primary" @click="handleAddTemplate">
        <el-icon><Plus /></el-icon>新增模板
      </el-button>
    </div>

    <!-- 模板列表 -->
    <el-table :data="templates" style="width: 100%">
      <el-table-column prop="name" label="模板名稱" width="200" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="priority" label="優先級" width="120">
        <template #default="{ row }">
          <el-tag :type="getPriorityType(row.priority)">
            {{ getPriorityText(row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="階段數" width="120">
        <template #default="{ row }">
          {{ row.stages.length }}個階段
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button size="small" @click="handleEditTemplate(row)">
              編輯
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDeleteTemplate(row)"
            >
              刪除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 模板編輯對話框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增模板' : '編輯模板'"
      v-model="dialogVisible"
      width="800px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="模板名稱" prop="name">
          <el-input v-model="form.name" placeholder="請輸入模板名稱" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            rows="3"
            placeholder="請輸入模板描述" 
          />
        </el-form-item>
        <el-form-item label="優先級" prop="priority">
          <el-select v-model="form.priority" placeholder="請選擇">
            <el-option
              v-for="option in taskPriorityOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <!-- 階段管理 -->
        <div class="stages-section">
          <div class="stages-header">
            <h3>任務階段</h3>
            <el-button type="primary" link @click="handleAddStage">
              <el-icon><Plus /></el-icon>添加階段
            </el-button>
          </div>

          <el-form-item
            v-for="(stage, index) in form.stages"
            :key="index"
            :prop="`stages.${index}.name`"
            :rules="{ required: true, message: '請輸入階段名稱', trigger: 'blur' }"
          >
            <div class="stage-item">
              <div class="stage-header">
                <span class="stage-order">階段 {{ index + 1 }}</span>
                <el-button type="danger" link @click="handleRemoveStage(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>

              <el-form-item label="階段名稱">
                <el-input v-model="stage.name" placeholder="請輸入階段名稱" />
              </el-form-item>

              <el-form-item label="階段描述">
                <el-input
                  v-model="stage.description"
                  type="textarea"
                  rows="2"
                  placeholder="請輸入階段描述"
                />
              </el-form-item>

              <el-form-item label="依賴階段">
                <el-select 
                  v-model="stage.dependencies"
                  multiple
                  placeholder="請選擇依賴的階段"
                  :disabled="index === 0"
                >
                  <el-option
                    v-for="(s, i) in form.stages.slice(0, index)"
                    :key="i"
                    :label="`階段${i + 1}: ${s.name}`"
                    :value="i + 1"
                  />
                </el-select>
              </el-form-item>
            </div>
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">確定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { taskPriorityOptions, TaskPriority } from '@/types/task'
import type { TaskTemplate, TemplateCategory } from '@/types/task'

interface TaskTemplateStage {
  name: string
  description: string
  order: number
  dependencies: number[]
}

// 默認模板數據
const defaultTaskTemplates: TaskTemplate[] = [{
  id: 1,
  name: '基本任務模板',
  description: '簡單的任務流程模板',
  priority: TaskPriority.MEDIUM,
  category: 'general',
  stages: [] as TaskTemplateStage[]
}]

// 模板列表
const templates = ref([...defaultTaskTemplates])

// 對話框控制
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref()

// 表單數據
const form = reactive({
  id: 0,
  name: '',
  description: '',
  priority: TaskPriority.MEDIUM,
  category: 'general' as TemplateCategory,
  stages: [] as TaskTemplateStage[]
})

// 表單驗證規則
const rules = {
  name: [
    { required: true, message: '請輸入模板名稱', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '請選擇優先級', trigger: 'change' }
  ]
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

// 獲取優先級字
const getPriorityText = (priority: string) => {
  const option = taskPriorityOptions.find(opt => opt.value === priority)
  return option ? option.label : '未知'
}

// 新增模板
const handleAddTemplate = () => {
  dialogType.value = 'add'
  Object.assign(form, {
    id: 0,
    name: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    category: 'general',
    stages: []
  })
  dialogVisible.value = true
}

// 編輯模板
const handleEditTemplate = (template: TaskTemplate) => {
  dialogType.value = 'edit'
  Object.assign(form, template)
  dialogVisible.value = true
}

// 刪除模板
const handleDeleteTemplate = async (template: TaskTemplate) => {
  try {
    await ElMessageBox.confirm(
      '確定要刪除該模板嗎？',
      '警告',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const index = templates.value.findIndex(t => t.id === template.id)
    if (index > -1) {
      templates.value.splice(index, 1)
      ElMessage.success('刪除成功')
    }
  } catch {
    // 用戶取消操作
  }
}

// 添加階段
const handleAddStage = () => {
  form.stages.push({
    name: '',
    description: '',
    order: form.stages.length + 1,
    dependencies: []
  })
}

// 移除階段
const handleRemoveStage = (index: number) => {
  form.stages.splice(index, 1)
  // 更新剩餘階段的順序
  form.stages.forEach((stage, i) => {
    stage.order = i + 1
  })
}

// 提交表單
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    if (dialogType.value === 'add') {
      // 新增模板
      const newTemplate = {
        ...form,
        id: Date.now()
      }
      templates.value.push(newTemplate)
      ElMessage.success('新增成功')
    } else {
      // 更新模板
      const index = templates.value.findIndex(t => t.id === form.id)
      if (index > -1) {
        templates.value[index] = { ...form }
        ElMessage.success('更新成功')
      }
    }
    dialogVisible.value = false
  } catch (error) {
    console.error('表單驗證失敗：', error)
  }
}
</script>

<style scoped>
.template-manager {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stages-section {
  margin-top: 20px;
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.stages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stage-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stage-order {
  font-weight: bold;
  color: #409eff;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 