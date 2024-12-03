<template>
  <div id="app" :class="theme">
    <!-- 主要內容區域 -->
    <router-view />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useThemeStore } from './stores/theme'

export default {
  name: 'App',
  setup() {
    const themeStore = useThemeStore()

    return {
      theme: computed(() => themeStore.theme)
    }
  }
}
</script>

<style>
:root {
  /* 亮色主题变量 */
  --bg-color: #ffffff;
  --text-primary: #1a202c;
  --text-secondary: #4a5568;
  --input-bg: rgba(255, 255, 255, 0.9);
}

/* 深色主题变量 */
body.dark {
  --bg-color: #1a202c;
  --text-primary: #f7fafc;
  --text-secondary: #a0aec0;
  --input-bg: rgba(17, 24, 39, 0.8);
}
</style> 