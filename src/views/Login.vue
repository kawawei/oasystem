<template>
  <!-- 登入頁面容器 -->
  <div class="login-container">
    <!-- 登入卡片 -->
    <el-card class="login-card">
      <!-- 卡片標題 -->
      <template #header>
        <h2 class="login-title">OA 系統登入</h2>
      </template>
      
      <!-- 登入表單 -->
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
        <!-- 用戶名輸入框 -->
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username"
            placeholder="請輸入用戶名"
            prefix-icon="User"
          />
        </el-form-item>
        
        <!-- 密碼輸入框 -->
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password"
            type="password"
            placeholder="請輸入密碼"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <!-- 登入按鈕 -->
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" class="login-button">
            登入
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 引入必要的函數和類型
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'

// 初始化路由
const router = useRouter()
// 表單引用
const loginFormRef = ref<FormInstance>()
// 載入狀態
const loading = ref(false)

// 登入表單數據
const loginForm = reactive({
  username: '',
  password: ''
})

// 表單驗證規則
const rules = {
  username: [
    { required: true, message: '請輸入用戶名', trigger: 'blur' },
    { min: 3, message: '用戶名至少3個字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼至少6個字符', trigger: 'blur' }
  ]
}

// 使用 Pinia 存儲
const userStore = useUserStore()

// 處理登入邏輯
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    loading.value = true
    await loginFormRef.value.validate()
    
    const requestData = {
      username: loginForm.username,
      password: loginForm.password
    }
    console.log('Sending login request:', requestData)
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify(requestData)
    })

    const data = await response.json()
    console.log('Login response:', data)

    if (data.success) {
      userStore.setLoginState(data.token, data.user)
      router.push('/')
    } else {
      ElMessage.error(data.error || '登入失敗')
    }
  } catch (error) {
    console.error('Login error:', error)
    ElMessage.error('登入失敗')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 登入頁面容器樣式 */
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

/* 登入卡片樣式 */
.login-card {
  width: 400px;
}

/* 登入標題樣式 */
.login-title {
  text-align: center;
  color: #303133;
  margin: 0;
}

/* 登入按鈕樣式 */
.login-button {
  width: 100%;
}

/* 卡片標題樣式 */
:deep(.el-card__header) {
  padding: 20px;
}

/* 輸入框背景樣式 */
:deep(.el-input__wrapper) {
  background-color: #f5f7fa;
}
</style> 