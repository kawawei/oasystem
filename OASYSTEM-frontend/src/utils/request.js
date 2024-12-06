import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

// 創建 axios 實例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000', // API 的基礎URL
  timeout: 15000, // 請求超時時間
  headers: {
    'Content-Type': 'application/json'
  }
})

// 請求攔截器
service.interceptors.request.use(
  config => {
    // 從 localStorage 獲取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 響應攔截器
service.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('Response error:', error)
    const message = error.response?.data?.message || '請求失敗'
    
    // 如果是 401 錯誤，可能是未登入或 token 過期
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // 如果不是在登入頁面，則跳轉到登入頁
      if (window.location.pathname !== '/login') {
        router.push('/login')
      }
    }
    
    ElMessage({
      message,
      type: 'error',
      duration: 3000
    })
    return Promise.reject(error)
  }
)

export default service 