import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'light'
  }),
  actions: {
    setTheme(theme) {
      this.theme = theme
    }
  }
}) 