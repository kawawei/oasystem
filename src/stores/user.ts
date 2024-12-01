import { defineStore } from 'pinia'

// 定義用戶狀態存儲
export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as { id: number; name: string } | null,
    token: null as string | null,
    users: [] as { id: number; name: string }[]
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.userInfo?.id === 1 // 假設 ID 為 1 的用戶是管理員
  },

  actions: {
    initState() {
      // 從 localStorage 獲取數據
      const savedToken = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      
      if (savedToken) this.token = savedToken
      if (savedUser) this.userInfo = JSON.parse(savedUser)

      // 初始化測試用戶數據
      this.users = [
        { id: 1, name: '張三' },
        { id: 2, name: '李四' },
        { id: 3, name: '王五' }
      ]
    },

    setLoginState(tokenValue: string, user: { id: number; name: string }) {
      this.token = tokenValue
      this.userInfo = user
      // 保存到 localStorage
      localStorage.setItem('token', tokenValue)
      localStorage.setItem('user', JSON.stringify(user))
    },

    logout() {
      this.token = null
      this.userInfo = null
      // 清除 localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    getUserById(id: number) {
      return this.users.find(user => user.id === id)
    }
  }
}) 