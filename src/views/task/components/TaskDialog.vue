<template>
  <el-dialog
    :title="type === 'add' ? '新增任務' : '編輯任務'"
    v-model="dialogVisible"
    width="800px"
  >
    <!-- 任務創建方式選擇 -->
    <div v-if="type === 'add'" class="creation-method">
      <el-radio-group v-model="creationMethod">
        <el-radio value="template">使用模板</el-radio>
        <el-radio value="custom">自訂任務</el-radio>
      </el-radio-group>
    </div>

    <!-- 使用模板 -->
    <template v-if="type === 'add' && creationMethod === 'template'">
      <TaskTemplateList @use-template="handleTemplateSelect" />
    </template>

    <!-- 自訂任務表單 -->
    <template v-else>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <!-- 基本信息 -->
        <el-form-item label="任務標題" prop="title">
          <el-input id="task-title" v-model="form.title" placeholder="請輸入任務標題" />
        </el-form-item>

        <el-form-item label="任務描述" prop="description">
          <el-input 
            id="task-description"
            v-model="form.description" 
            type="textarea" 
            :rows="3"
            placeholder="請輸入任務描述" 
          />
        </el-form-item>

        <el-form-item label="優先級" prop="priority">
          <el-select 
            id="task-priority"
            v-model="form.priority" 
            placeholder="請選擇"
          >
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

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item 
                    :prop="`stages.${index}.name`"
                    label="階段名稱"
                  >
                    <el-input 
                      :id="`stage-${index}-name`"
                      v-model="stage.name" 
                      placeholder="請輸入階段名稱" 
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item 
                    :prop="`stages.${index}.assignee`"
                    label="負責人"
                  >
                    <el-select 
                      :id="`stage-${index}-assignee`"
                      v-model="stage.assignee" 
                      multiple 
                      placeholder="請選擇負責人"
                    >
                      <el-option
                        v-for="user in userList"
                        :key="user.id"
                        :label="user.name"
                        :value="user.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item 
                    :prop="`stages.${index}.startDate`"
                    label="開始日期"
                  >
                    <el-date-picker
                      :id="`stage-${index}-start-date`"
                      v-model="stage.startDate"
                      type="date"
                      placeholder="選擇開始日期"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item 
                    :prop="`stages.${index}.endDate`"
                    label="結束日期"
                  >
                    <el-date-picker
                      :id="`stage-${index}-end-date`"
                      v-model="stage.endDate"
                      type="date"
                      placeholder="選擇結束日期"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item 
                :prop="`stages.${index}.dependencies`"
                label="依賴階段"
              >
                <el-select 
                  :id="`stage-${index}-dependencies`"
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

              <el-form-item 
                :prop="`stages.${index}.description`"
                label="階段說明"
              >
                <el-input
                  :id="`stage-${index}-description`"
                  v-model="stage.description"
                  type="textarea"
                  :rows="2"
                  placeholder="請輸入階段說明"
                />
              </el-form-item>
            </div>
          </el-form-item>
        </div>
      </el-form>
    </template>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">確定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { taskPriorityOptions } from '@/types/task'
import type { TaskForm, TaskTemplate } from '@/types/task'
import TaskTemplateList from './TaskTemplateList.vue'
import { TaskPriority } from '@/types/task'

const props = defineProps<{
  visible: boolean
  type: 'add' | 'edit'
  initialData?: any
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', form: TaskForm): void
}>()

// 表單引用
const formRef = ref<FormInstance>()

// 對話框可見性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 創建方式
const creationMethod = ref('template')

// 模擬用戶列表
const userList = ref([
  { id: 1, name: '張三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
])

// 表單數據
const form = reactive<TaskForm>({
  title: '',
  description: '',
  priority: TaskPriority.MEDIUM,
  stages: []
})

// 表單驗證規則
const rules = {
  title: [
    { required: true, message: '請輸入任務標題', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '請選擇優先級', trigger: 'change' }
  ]
}

// 處理模板選擇
const handleTemplateSelect = (template: TaskTemplate) => {
  form.title = `${template.name} - ${new Date().toLocaleDateString()}`
  form.description = template.description
  form.priority = template.priority
  form.stages = template.stages.map(stage => ({
    name: stage.name,
    description: stage.description,
    order: stage.order,
    assignee: [],
    startDate: '',
    endDate: '',
    dependencies: stage.dependencies
  }))
  creationMethod.value = 'custom'
}

// 添加階段
const handleAddStage = () => {
  const newStage = {
    id: Date.now(),
    name: '',
    description: '',
    order: form.stages.length + 1,
    assignee: [],
    startDate: '',
    endDate: '',
    dependencies: []
  }
  form.stages.push(newStage)
}

// 移除階段
const handleRemoveStage = (index: number) => {
  form.stages.splice(index, 1)
  // 更新剩餘階段的序
  form.stages.forEach((stage, i) => {
    stage.order = i + 1
  })
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('submit', form)
  } catch (error) {
    console.error('表單驗證失敗：', error)
  }
}

// 監聽初始數據變化
watch(
  () => props.initialData,
  (data) => {
    if (data) {
      Object.assign(form, data)
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.creation-method {
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