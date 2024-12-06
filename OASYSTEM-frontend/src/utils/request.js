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
      switch (error.response.status) {
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
          ElMessage.error('服務器錯誤')
          break
        default:
          ElMessage.error(error.response.data.message || '未知錯誤')
      }
    }
    return Promise.reject(error)
  }
)

export default service 