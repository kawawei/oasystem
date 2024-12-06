import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 創建 axios 實例
const service = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 5000
})

// 請求攔截器
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 響應攔截器
service.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          ElMessage.error('請重新登錄')
          localStorage.removeItem('token')
          router.push('/login')
          break
        case 403:
          ElMessage.error('沒有權限')
          break
        case 404:
          ElMessage.error('請求的資源不存在')
          break
        case 500:
          const errorMessage = data.message || data.error || '服務器內部錯誤'
          ElMessage.error(errorMessage)
          console.error('服務器錯誤詳情:', error.response)
          break
        default:
          const defaultError = data.message || data.error || error.message || '未知錯誤'
          ElMessage.error(defaultError)
          console.error('請求錯誤詳情:', error.response)
      }
    } else if (error.request) {
      ElMessage.error('無法連接到服務器，請檢查網絡連接')
      console.error('網絡錯誤:', error.request)
    } else {
      ElMessage.error('請求配置錯誤')
      console.error('請求錯誤:', error.message)
    }
    return Promise.reject(error)
  }
)

export default service 