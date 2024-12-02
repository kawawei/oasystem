<template>
  <div class="register-container">
    <ThemeToggle />
    <div class="register-content">
      <div class="brand-section">
        <h1>Create Account</h1>
        <p class="subtitle">建立您的帳號以開始使用</p>
      </div>
      <div class="register-box">
        <form @submit.prevent="handleRegister">
          <div class="input-group">
            <input 
              type="text" 
              v-model="username" 
              placeholder="使用者名稱"
              required
            />
          </div>
          <div class="input-group">
            <input 
              type="email" 
              v-model="email" 
              placeholder="電子郵件"
              required
            />
          </div>
          <div class="input-group">
            <input 
              type="password" 
              v-model="password" 
              placeholder="密碼"
              required
            />
          </div>
          <div class="input-group">
            <input 
              type="password" 
              v-model="confirmPassword" 
              placeholder="確認密碼"
              required
            />
          </div>
          <button type="submit">註冊</button>
          <div class="divider">
            <span>或</span>
          </div>
          <div class="social-login">
            <button type="button" @click="handleGoogleRegister">
              <img src="@/assets/google-icon.svg" alt="Google" />
              <span>使用 Google 帳號註冊</span>
            </button>
          </div>
          <div class="links">
            <span>已經有帳號？</span>
            <router-link to="/login">返回登入</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useUserStore } from '@/stores/user'
import { authService } from '@/services/auth'

export default {
  components: {
    ThemeToggle
  },
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  },
  methods: {
    async handleRegister() {
      if (this.password !== this.confirmPassword) {
        alert('密碼不一致')
        return
      }
      try {
        const userData = {
          username: this.username,
          email: this.email,
          password: this.password
        }
        const response = await authService.register(userData)
        this.userStore.setUser(response.user)
        this.userStore.setToken(response.token)
        this.$router.push('/dashboard')
      } catch (error) {
        alert(error.response?.data?.message || '用戶名已存在')
      }
    },
    async handleGoogleRegister() {
      try {
        const token = 'google-token'
        const response = await authService.googleLogin(token)
        this.userStore.setUser(response.user)
        this.userStore.setToken(response.token)
        this.$router.push('/dashboard')
      } catch (error) {
        alert(error.response?.data?.message || 'Google 註冊失敗')
      }
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-gradient);
}

.register-container::before,
.register-container::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: linear-gradient(45deg, #0071e3, #40c8e0);
  filter: blur(60px);
  opacity: 0.4;
  animation: move 10s infinite alternate;
}

.register-container::before {
  top: -100px;
  left: -100px;
}

.register-container::after {
  bottom: -100px;
  right: -100px;
  background: linear-gradient(45deg, #40c8e0, #8e44ad);
}

@keyframes move {
  from {
    transform: translateY(0) rotate(0deg);
  }
  to {
    transform: translateY(50px) rotate(45deg);
  }
}

.register-content {
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.brand-section {
  margin-bottom: 2rem;
}

.brand-section h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.register-box {
  width: 100%;
  padding: 40px;
  text-align: center;
  position: relative;
  z-index: 100;
  background: var(--box-bg);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--border-color);
}

input {
  width: 100%;
  height: 36px;
  margin: 6px 0;
  border: none;
  background-color: var(--input-bg);
  border-radius: 4px;
  padding: 0 14px;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

input::placeholder {
  color: var(--text-secondary);
}

input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

button {
  width: 100%;
  height: 36px;
  margin-top: 24px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: 0.4s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-size: 1rem;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
}

button img {
  width: 20px;
  height: 20px;
  margin-left: 60px;
}

button span {
  flex: 1;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-color);
  margin-right: 60px;
}

button[type="submit"] {
  background: rgba(0, 113, 227, 0.8);
  color: white;
}

button[type="submit"]:hover {
  background: rgba(0, 113, 227, 0.9);
}

button[type="submit"] span {
  color: white;
}

.divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: calc(50% - 30px);
  height: 1px;
  background: var(--border-color);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  background: var(--box-bg);
  padding: 0 1rem;
  color: var(--text-secondary);
  backdrop-filter: blur(8px);
}

.social-login {
  margin-bottom: 1.5rem;
}

.links {
  margin-top: 1.5rem;
  color: var(--text-secondary);
}

.links a {
  color: var(--button-bg);
  text-decoration: none;
  margin-left: 0.5rem;
  font-weight: 500;
}

.links a:hover {
  text-decoration: underline;
}
</style> 