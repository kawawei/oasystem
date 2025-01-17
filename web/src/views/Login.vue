<template>
  <div class="login-container">
    <div class="login-box">
      <h1>Welcome Back</h1>
      <p class="subtitle">Please enter your credentials to continue</p>
      
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input 
            type="text" 
            id="username"
            v-model="username"
            class="input"
            placeholder="Enter your username"
            required
            @input="() => console.log('Username changed:', username)"
          >
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password"
            v-model="password"
            class="input"
            placeholder="Enter your password"
            required
            @input="() => console.log('Password changed')"
          >
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>
        
        <button 
          type="submit" 
          class="button login-button" 
          :disabled="loading"
        >
          {{ loading ? 'Logging in...' : 'Log In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const username = ref('')
    const password = ref('')
    const loading = ref(false)
    const error = ref('')

    const handleSubmit = async (event) => {
      console.log('Form submitted')
      console.log('Event:', event.type)
      await handleLogin()
    }

    const handleLogin = async () => {
      try {
        console.log('=== Login Process Started ===')
        console.log('Username:', username.value)
        console.log('Password length:', password.value.length)
        
        loading.value = true
        error.value = ''
        
        const apiUrl = `${import.meta.env.VITE_API_URL}/auth/login`
        console.log('API URL:', apiUrl)
        console.log('Environment variables:', import.meta.env)
        
        const requestBody = {
          username: username.value,
          password: password.value
        }

        console.log('Sending fetch request...')
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        })

        console.log('Response received:', {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText
        })

        const data = await response.json()
        console.log('Response data:', data)

        if (!response.ok) {
          throw new Error(data.message || 'Login failed')
        }

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/home')
      } catch (err) {
        console.error('Login error:', err)
        error.value = err.message || 'Login failed'
      } finally {
        loading.value = false
        console.log('=== Login Process Ended ===')
      }
    }

    return {
      username,
      password,
      loading,
      error,
      handleSubmit,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 400px;
}

h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.subtitle {
  color: #6E6E73;
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.login-button {
  width: 100%;
  margin-top: 16px;
}

.error-message {
  color: var(--error-color);
  margin-top: 16px;
  font-size: 14px;
}
</style> 