<template>
  <el-dialog
    :title="type === 'add' ? '新增用戶' : '編輯用戶'"
    v-model="dialogVisible"
    width="500px"
    :destroy-on-close="true"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="用戶名" prop="username">
        <el-input 
          v-model="form.username" 
          :disabled="type === 'edit'"
          placeholder="請輸入用戶名"
        />
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input 
          v-model="form.name"
          placeholder="請輸入姓名"
        />
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select v-model="form.role" placeholder="請選擇">
          <el-option label="管理員" value="admin" />
          <el-option label="普通用戶" value="user" />
        </el-select>
      </el-form-item>
      <el-form-item label="郵箱" prop="email">
        <el-input 
          v-model="form.email"
          placeholder="請輸入郵箱"
        />
      </el-form-item>
      <el-form-item label="電話" prop="phone">
        <el-input 
          v-model="form.phone"
          placeholder="請輸入電話"
        />
      </el-form-item>
      <el-form-item 
        label="密碼" 
        prop="password"
        :rules="type === 'add' ? passwordRules : []"
      >
        <el-input 
          v-model="form.password"
          type="password"
          show-password
          placeholder="請輸入密碼"
        />
        <div class="form-tip" v-if="type === 'edit'">
          不修改密碼請留空
        </div>
      </el-form-item>
      <el-form-item label="狀態" prop="status">
        <el-switch
          v-model="form.status"
          :active-value="1"
          :inactive-value="0"
          active-text="啟用"
          inactive-text="禁用"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          確定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  type: 'add' | 'edit'
  formData: {
    username: string
    name: string
    role: string
    email: string
    phone: string
    password: string
    status: number
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表單數據
const form = reactive({
  username: '',
  name: '',
  role: '',
  email: '',
  phone: '',
  password: '',
  status: 1
})

// 監聽外部表單數據變化
watch(() => props.formData, (newVal) => {
  Object.assign(form, newVal)
}, { deep: true })

// 表單驗證規則
const rules = {
  username: [
    { required: true, message: '請輸入用戶名', trigger: 'blur' },
    { min: 3, message: '長度不能小於3個字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '請輸入姓名', trigger: 'blur' },
    { min: 2, message: '長度不能小於2個字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '請選擇角色', trigger: 'change' }
  ],
  email: [
    { required: true, message: '請輸入郵箱', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的郵箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '請輸入電話', trigger: 'blur' },
    { pattern: /^09\d{8}$/, message: '請輸入正確的手機號碼格式', trigger: 'blur' }
  ]
}

// 密碼驗證規則
const passwordRules = [
  { required: true, message: '請輸入密碼', trigger: 'blur' },
  { min: 6, message: '密碼長度不能小於6個字符', trigger: 'blur' }
]

// 計算屬性：對話框顯示狀態
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 取消
const handleCancel = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // TODO: 實現保存邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(props.type === 'add' ? '新增成功' : '更新成功')
    emit('success')
    formRef.value.resetFields()
  } catch (error) {
    console.error('表單驗證失敗：', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style> 