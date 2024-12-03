<template>
  <router-view></router-view>
</template>

<script setup>
// 如果需要的話，可以添加其他邏輯
</script>

<style>
:root {
  --text-primary: #1a202c;
  --text-secondary: #4a5568;
  --input-bg: rgba(255, 255, 255, 0.9);
  --dark-input-bg: rgba(17, 24, 39, 0.8);
  --bg-color: #ffffff;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg-color);
  color: var(--text-primary);
}

body.dark {
  --text-primary: #f7fafc;
  --text-secondary: #a0aec0;
  --bg-color: #1a202c;
}
</style> 