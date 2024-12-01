import axios from 'axios'

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
})

// 添加請求攔截器
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const api = {
  get: <T>(url: string) => {
    return axiosInstance.get<ApiResponse<T>>(url)
  },
  post: <T>(url: string, data: any) => {
    return axiosInstance.post<ApiResponse<T>>(url, data)
  },
  put: <T>(url: string, data: any) => {
    return axiosInstance.put<ApiResponse<T>>(url, data)
  },
  delete: <T>(url: string) => {
    return axiosInstance.delete<ApiResponse<T>>(url)
  }
} 