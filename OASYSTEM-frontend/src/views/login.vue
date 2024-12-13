<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo-area">
        <h1>OA System</h1>
        <p class="subtitle">企業辦公系統</p>
      </div>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-user"></i>
            <input 
              type="text" 
              v-model="loginForm.username" 
              placeholder="用戶名"
              required
            >
          </div>
        </div>
        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-lock"></i>
            <input 
              :type="showPassword ? 'text' : 'password'"
              v-model="loginForm.password" 
              placeholder="密碼"
              required
            >
            <i 
              class="fas eye-icon" 
              :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
              @click="togglePassword"
            ></i>
          </div>
        </div>
        
        <div class="options-group">
          <label class="remember-me">
            <input 
              type="checkbox" 
              v-model="rememberMe"
            >
            <span>記住密碼</span>
          </label>
          <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">忘記密碼？</a>
        </div>

        <button type="submit" :disabled="isLoading">
          <span v-if="!isLoading">登入</span>
          <span v-else class="loading-spinner"></span>
        </button>
      </form>

      <div class="footer-text">
        <p>首次使用？<a href="#" @click.prevent="handleRegister">建立帳號</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authAPI } from '../api/auth'

const router = useRouter()
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const rememberMe = ref(false)

const loginForm = ref({
  username: '',
  password: ''
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.error('請輸入用戶名和密碼')
    return
  }

  isLoading.value = true
  try {
    const response = await authAPI.login({
      username: loginForm.value.username,
      password: loginForm.value.password
    })
    
    if (response.token) {
      localStorage.setItem('token', response.token)
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user))
      }
      ElMessage.success('登入成功')
      router.push('/dashboard')
    } else {
      throw new Error('登入失敗：未收到token')
    }
  } catch (error) {
    console.error('登入失敗:', error)
    ElMessage.error(error.response?.data?.message || '登入失敗，請檢查用戶名和密碼')
  } finally {
    isLoading.value = false
  }
}

const handleRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.login-box {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 3rem 2.5rem;
  border-radius: 20px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.logo-area {
  text-align: center;
  margin-bottom: 2.5rem;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #86868b;
  font-size: 1rem;
}

.input-group {
  margin-bottom: 1.2rem;
}

.input-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon i {
  position: absolute;
  left: 1rem;
  color: #86868b;
}

.input-icon .eye-icon {
  left: auto;
  right: 1rem;
  cursor: pointer;
}

input {
  width: 100%;
  padding: 1rem;
  padding-left: 2.8rem;
  border: none;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12px;
  font-size: 1rem;
  color: #1d1d1f;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  background: rgba(0, 0, 0, 0.05);
  box-shadow: 0 0 0 2px rgba(0, 125, 250, 0.6);
}

input::placeholder {
  color: #86868b;
}

.options-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #86868b;
  cursor: pointer;
}

.remember-me input[type="checkbox"] {
  width: auto;
  margin: 0;
  padding: 0;
}

.forgot-password {
  color: #007AFF;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-password:hover {
  text-decoration: underline;
}

button {
  width: 100%;
  padding: 1rem;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

button:hover:not(:disabled) {
  background: #0066d6;
  transform: translateY(-1px);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.footer-text {
  text-align: center;
  margin-top: 1.5rem;
  color: #86868b;
}

.footer-text a {
  color: #007AFF;
  text-decoration: none;
  margin-left: 0.5rem;
}

.footer-text a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-box {
    margin: 1rem;
    padding: 2rem 1.5rem;
  }
}

.error-message {
  color: #ff3b30;
  text-align: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: rgba(255, 59, 48, 0.1);
  border-radius: 8px;
}
</style>
  