<template>
  <div class="home">
    <div class="search-container" :class="{ 'searching': isSearching }">
      <div class="empty-state">
        <h1 class="brand-name">Search</h1>
        <h1>探索無限可能</h1>
        <p>輸入關鍵字開始搜尋</p>
      </div>

      <div class="search-box" :class="{ 'searching': isSearching }">
        <input 
          type="text" 
          class="search-input" 
          v-model="searchText"
          placeholder="搜索你的需求..."
          @keyup.enter="startSearch"
        >
        <button 
          v-if="searchText" 
          class="clear-button" 
          @click="clearSearch"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 結果面板 -->
    <div class="results-panel" v-if="isSearching">
      <div class="results-content">
        <div class="result-item" v-for="i in 5" :key="i">
          <div class="result-title">搜索結果 {{i}}</div>
          <div class="result-desc">這是一個示例搜索結果的描述文字...</div>
        </div>
      </div>
    </div>

    <!-- 添加右上角按鈕組 -->
    <div class="top-right-buttons">
      <button class="theme-switcher" @click="toggleTheme" :aria-label="isDark ? '切換到亮色主題' : '切換到深色主題'">
        <svg class="sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="M4.93 4.93l1.41 1.41"></path>
          <path d="M17.66 17.66l1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="M6.34 17.66l-1.41 1.41"></path>
          <path d="M19.07 4.93l-1.41 1.41"></path>
        </svg>
        <svg class="moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
        </svg>
      </button>
      <button class="theme-switcher">
        <svg class="grid-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="7" height="7" rx="1"></rect>
          <rect x="14" y="3" width="7" height="7" rx="1"></rect>
          <rect x="14" y="14" width="7" height="7" rx="1"></rect>
          <rect x="3" y="14" width="7" height="7" rx="1"></rect>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const isDark = ref(false)
const searchText = ref('')
const isSearching = ref(false)

// 監聽搜索文字的變化
watch(searchText, (newValue) => {
  // 當文字被完全刪除且正在搜索狀態時，回到中間
  if (!newValue.trim() && isSearching.value) {
    isSearching.value = false
  }
})

const startSearch = () => {
  if (searchText.value.trim()) {
    isSearching.value = true
  }
}

const clearSearch = () => {
  searchText.value = ''
  isSearching.value = false
}

const toggleTheme = () => {
  document.body.classList.toggle('dark')
  isDark.value = !isDark.value
}
</script>

<style scoped>
.home {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
}

.search-container {
  text-align: center;
  padding: 0 20px;
  max-width: 600px;
  width: 100%;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.empty-state {
  margin-bottom: 32px;
  transition: opacity 0.3s ease;
  opacity: 1;
}

.search-container.searching .empty-state {
  opacity: 0;
  pointer-events: none;
}

.brand-name {
  font-size: 4rem;
  font-weight: 700;
  color: #0071e3;
  margin-bottom: 16px;
}

.empty-state h1:not(.brand-name) {
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.empty-state p {
  font-size: 1.2rem;
  color: var(--text-secondary);
}

/* 搜索框樣式 */
.search-box {
  position: relative;
  width: 100%;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-box.searching {
  position: fixed;
  left: 0;
  top: 0;
  width: 420px;
  padding: 20px;
  z-index: 10;
}

.search-input {
  width: 100%;
  padding: 0 16px;
  height: 48px;
  border: none;
  border-radius: 24px;
  background: var(--input-bg);
  font-size: 18px;
  color: var(--text-primary);
  transition: all 0.3s ease;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  padding-right: 50px;
}

/* 清除按鈕樣式 */
.clear-button {
  position: absolute;
  right: 25px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  opacity: 0.8;
  transition: all 0.2s ease;
  padding: 0;
}

.clear-button:hover {
  opacity: 1;
}

.clear-button svg {
  width: 20px;
  height: 20px;
}

/* 結果面板樣式 */
.results-panel {
  position: fixed;
  left: 0;
  top: 0;
  width: 420px;
  height: 100vh;
  padding: 90px 20px 20px;
  background: transparent;
  z-index: 5;
  overflow: hidden;
}

.results-content {
  height: 100%;
  overflow-y: auto;
}

.result-item {
  padding: 16px;
  margin-bottom: 1px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.result-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.result-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  opacity: 0.8;
}

/* 深色模式樣式 */
body.dark .search-input {
  background: var(--dark-input-bg);
  color: #e2e8f0;
}

body.dark .result-item {
  background: rgba(255, 255, 255, 0.05);
}

body.dark .result-title {
  color: #ffffff;
}

body.dark .result-desc {
  color: rgba(255, 255, 255, 0.8);
}

:root {
  --input-bg: rgba(255, 255, 255, 0.9);
  --dark-input-bg: rgba(17, 24, 39, 0.8);
}

/* 添加右上角按鈕樣式 */
.top-right-buttons {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
  z-index: 20; /* 確保按鈕在最上層 */
}

.theme-switcher {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background-color: var(--input-bg);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 
    0 12px 36px rgba(0, 0, 0, 0.25),
    0 8px 24px rgba(0, 0, 0, 0.2),
    0 4px 12px rgba(0, 0, 0, 0.15);
  color: var(--text-primary);
}

.theme-switcher:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.3),
    0 12px 36px rgba(0, 0, 0, 0.25),
    0 8px 24px rgba(0, 0, 0, 0.2);
}

.sun, 
.moon,
.grid-icon {
  width: 28px;
  height: 28px;
  fill: currentColor;
}

.sun {
  color: #d69e2e;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

.moon {
  display: none;
  color: #e2e8f0;
  fill: currentColor;
}

/* 深色模式下的按鈕樣式 */
body.dark .theme-switcher {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 
    0 12px 36px rgba(0, 0, 0, 0.5),
    0 8px 24px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

body.dark .sun {
  display: none;
}

body.dark .moon {
  display: block;
  color: #ffffff;
}

body.dark .grid-icon {
  color: #ffffff;
}

.grid-icon {
  color: var(--text-secondary);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
