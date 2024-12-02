<template>
  <button class="theme-toggle" @click="themeStore.toggleTheme" :title="themeStore.isDark ? '切換至淺色模式' : '切換至深色模式'">
    <i class="fas" :class="themeStore.isDark ? 'fa-moon' : 'fa-sun'"></i>
  </button>
</template>

<script>
import { useThemeStore } from '@/stores/theme'

export default {
  setup() {
    const themeStore = useThemeStore()
    return { themeStore }
  },
  created() {
    this.themeStore.initTheme()
  },
  methods: {
    toggleTheme() {
      this.themeStore.toggleTheme()
    }
  }
}
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.theme-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.theme-toggle i {
  font-size: 1.2rem;
}

.theme-toggle i.fa-sun {
  color: #ffd700;
}

.theme-toggle i.fa-moon {
  color: #ffffff;
}

[data-theme="dark"] .theme-toggle {
  background: #000000;
}

[data-theme="dark"] .theme-toggle i.fa-moon {
  color: #ffffff;
}

[data-theme="dark"] .theme-toggle i.fa-sun {
  color: #ffd700;
}
</style> 