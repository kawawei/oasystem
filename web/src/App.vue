<template>
  <router-view></router-view>
</template>

<style>
:root {
  --primary-color: #007AFF;
  --background-color: #F5F5F7;
  --text-color: #1D1D1F;
  --error-color: #FF3B30;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body {
  background-color: var(--background-color);
  color: var(--text-color);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.button:hover {
  opacity: 0.9;
}

.input {
  width: 100%;
  padding: 12px;
  border: 1px solid #D1D1D6;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: var(--primary-color);
}
</style> 