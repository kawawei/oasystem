import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false
  }),
  
  actions: {
    toggleTheme() {
      this.isDark = !this.isDark
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
      document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light')
    },
    
    initTheme() {
      const theme = localStorage.getItem('theme')
      this.isDark = theme === 'dark'
      document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light')
    }
  }
}) 