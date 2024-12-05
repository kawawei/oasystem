<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo-area">
        <h1>OA System</h1>
        <p class="subtitle">註冊新帳號</p>
      </div>
      <form @submit.prevent="handleRegister">
        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-user"></i>
            <input 
              type="text" 
              v-model="username" 
              placeholder="用戶名"
              required
            >
          </div>
        </div>
        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-envelope"></i>
            <input 
              type="email" 
              v-model="email" 
              placeholder="電子郵件"
              required
            >
          </div>
        </div>
        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-lock"></i>
            <input 
              :type="showPassword ? 'text' : 'password'"
              v-model="password" 
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
        <div class="input-group">
          <div class="input-icon">
            <i class="fas fa-lock"></i>
            <input 
              :type="showPassword ? 'text' : 'password'"
              v-model="confirmPassword" 
              placeholder="確認密碼"
              required
            >
          </div>
        </div>

        <button type="submit" :disabled="isLoading">
          <span v-if="!isLoading">註冊</span>
          <span v-else class="loading-spinner"></span>
        </button>
      </form>

      <div class="footer-text">
        <p>已有帳號？<a href="#" @click.prevent="goToLogin">返回登入</a></p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      isLoading: false
    }
  },
  methods: {
    async handleRegister() {
      if (!this.username || !this.email || !this.password || !this.confirmPassword) {
        return
      }

      if (this.password !== this.confirmPassword) {
        alert('兩次輸入的密碼不一致')
        return
      }
      
      this.isLoading = true
      try {
        console.log('註冊資訊：', {
          username: this.username,
          email: this.email,
          password: this.password
        })
        // 這裡添加實際的註冊邏輯
        await new Promise(resolve => setTimeout(resolve, 1000)) // 模擬API請求
        this.$router.push('/login')
      } catch (error) {
        console.error('註冊失敗：', error)
      } finally {
        this.isLoading = false
      }
    },
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    goToLogin() {
      this.$router.push('/login')
    }
  }
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
</style> 