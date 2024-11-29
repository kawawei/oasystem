// 引入必要的函數
import { defineStore } from 'pinia'
import { ref } from 'vue'

// 定義用戶狀態存儲
export const useUserStore = defineStore('user', () => {
  // 用戶信息
  const userInfo = ref<{name: string} | null>(null)
  // token
  const token = ref<string | null>(null)

  // 初始化狀態
  const initState = () => {
    // 從 localStorage 獲取數據
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken) token.value = savedToken
    if (savedUser) userInfo.value = JSON.parse(savedUser)
  }

  // 設置登入狀態
  const setLoginState = (tokenValue: string, user: {name: string}) => {
    token.value = tokenValue
    userInfo.value = user
    // 保存到 localStorage
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('user', JSON.stringify(user))
  }

  // 登出
  const logout = () => {
    token.value = null
    userInfo.value = null
    // 清除 localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    userInfo,
    token,
    initState,
    setLoginState,
    logout
  }
}) 