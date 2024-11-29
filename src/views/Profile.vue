<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <h3>個人資料</h3>
          <el-button type="primary" @click="handleEdit">編輯</el-button>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用戶名">
          {{ userStore.userInfo?.username }}
        </el-descriptions-item>
        <el-descriptions-item label="姓名">
          {{ userStore.userInfo?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="角色">
          {{ userStore.userInfo?.role === 'admin' ? '管理員' : '普通用戶' }}
        </el-descriptions-item>
        <el-descriptions-item label="創建時間">
          {{ userStore.userInfo?.createTime }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 修改密碼卡片 -->
    <el-card class="password-card">
      <template #header>
        <div class="card-header">
          <h3>修改密碼</h3>
        </div>
      </template>

      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原密碼" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
            placeholder="請輸入原密碼"
          />
        </el-form-item>
        <el-form-item label="新密碼" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            placeholder="請輸入新密碼"
          />
        </el-form-item>
        <el-form-item label="確認密碼" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            placeholder="請再次輸入新密碼"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handlePasswordSubmit" :loading="submitting">
            確認修改
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 編輯對話框 -->
    <el-dialog
      title="編輯個人資料"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用戶名" prop="username">
          <el-input v-model="formData.username" disabled />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            確定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import type { FormInstance } from 'element-plus'

const userStore = useUserStore()

// 表單相關
const formRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const submitting = ref(false)
const dialogVisible = ref(false)

// 表單數據
const formData = reactive({
  username: '',
  name: ''
})

// 密碼表單
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表單驗證規則
const rules = {
  name: [
    { required: true, message: '請輸入姓名', trigger: 'blur' },
    { min: 2, message: '長度不能小於2個字符', trigger: 'blur' }
  ]
}

// 密碼表單驗證規則
const passwordRules = {
  oldPassword: [
    { required: true, message: '請輸入原密碼', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '請輸入新密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度不能小於6個字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '請再次輸入新密碼', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('兩次輸入的密碼不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 編輯個人資料
const handleEdit = () => {
  Object.assign(formData, {
    username: userStore.userInfo?.username || '',
    name: userStore.userInfo?.name || ''
  })
  dialogVisible.value = true
}

// 提交編輯
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    // TODO: 實現更新邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('更新成功')
    dialogVisible.value = false
  } catch (error) {
    console.error('表單驗證失敗：', error)
  } finally {
    submitting.value = false
  }
}

// 修改密碼
const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    submitting.value = true
    // TODO: 實現修改密碼邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('密碼修改成功')
    // 清空表單
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordFormRef.value.resetFields()
  } catch (error) {
    console.error('表單驗證失敗：', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.profile-card {
  margin-bottom: 20px;
}

.password-card {
  max-width: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 