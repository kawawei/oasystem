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
      <div class="results-content custom-scrollbar">
        <!-- 載入中狀態 -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <span>搜尋中...</span>
        </div>
        
        <!-- 無結果狀態 -->
        <div v-else-if="searchResults.length === 0" class="no-results">
          <span>未找到相關結果</span>
        </div>
        
        <!-- 搜尋結果列表 -->
        <div v-else>
          <div class="results-stats">找到 {{ searchResults.length }} 個結果</div>
          <div 
            v-for="result in searchResults" 
            :key="result.id" 
            class="result-item"
            @click="openUrl(result.url)"
          >
            <div class="result-icon">{{ result.icon }}</div>
            <div class="result-content">
              <div class="result-title">{{ result.title }}</div>
              <div class="result-url">{{ result.url }}</div>
              <div class="result-desc">{{ result.description }}</div>
            </div>
          </div>
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
      <button class="theme-switcher" @click="toggleAppPanel">
        <svg class="grid-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="7" height="7" rx="1"></rect>
          <rect x="14" y="3" width="7" height="7" rx="1"></rect>
          <rect x="14" y="14" width="7" height="7" rx="1"></rect>
          <rect x="3" y="14" width="7" height="7" rx="1"></rect>
        </svg>
      </button>
      <button class="theme-switcher" @click="showSettings = !showSettings">
        <i class="fas fa-cog"></i>
      </button>
    </div>

    <!-- 應用選擇面板 -->
    <div class="app-panel" v-if="showAppPanel" @click.self="toggleAppPanel">
      <div class="app-grid">
        <button class="app-item" v-for="app in apps" :key="app.id">
          <div class="app-icon" :style="{ backgroundColor: app.color }">
            <i :class="app.icon"></i>
          </div>
          <span class="app-name">{{ app.name }}</span>
        </button>
      </div>
    </div>

    <!-- 添加網站按鈕 -->
    <button class="add-site-button" @click="showAddSite = true">
      <span>添加網站</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 5v14M5 12h14" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- 添加網站彈窗 -->
    <div v-if="showAddSite" class="modal-overlay" @click="showAddSite = false">
      <div class="modal-content" @click.stop>
        <h2>添加新網站到搜尋引擎</h2>
        <div class="input-group">
          <input 
            type="text" 
            v-model="newUrl"
            placeholder="輸入網站網址 (例如: https://example.com)"
            @keyup.enter="addNewUrl"
          >
          <button @click="addNewUrl" :disabled="!newUrl">添加</button>
        </div>
        <p class="hint">提示：請輸入完整的網址，包含 http:// 或 https://</p>
      </div>
    </div>

    <!-- 添加個人設置面板 -->
    <div class="settings-panel" v-if="showSettings">
      <h3>個人設置</h3>
      <div class="settings-item">
        <label>搜尋語言</label>
        <select v-model="userPreferences.language">
          <option value="zh">中文</option>
          <option value="en">English</option>
          <option value="all">All</option>
        </select>
      </div>
      <div class="settings-item">
        <label>每頁結果數</label>
        <input type="number" v-model="userPreferences.resultsPerPage">
      </div>
      <!-- 添加搜尋歷史 -->
      <div class="search-history">
        <h4>最近搜尋</h4>
        <div v-for="item in searchHistory" :key="item">
          {{ item }}
        </div>
      </div>
      <!-- 在設置面板中添加地區選擇 -->
      <div class="settings-item">
        <label>優先顯示地區</label>
        <select v-model="userPreferences.region">
          <option value="tw">台灣</option>
          <option value="cn">中國</option>
          <option value="global">全球</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const isDark = ref(false)
const searchText = ref('')
const isSearching = ref(false)
const showAppPanel = ref(false)
const searchResults = ref([])
const isLoading = ref(false)
const showSettings = ref(false)
const userPreferences = ref({
    language: 'zh',
    resultsPerPage: 20,
    region: 'tw'  // 默認台灣
})

// 添加搜尋果的介面定義
const searchItems = ref([
  {
    id: 1,
    title: '工作任務管理',
    description: '查看和管理所有工作任務',
    icon: '📋',
    link: '/tasks',
    keywords: ['任務', '工作', '待辦', 'todo']
  },
  {
    id: 2,
    title: '會議記錄',
    description: '歷史會議記錄和筆記',
    icon: '📝',
    link: '/meetings',
    keywords: ['會議', '記錄', '筆記', '歷史']
  },
  {
    id: 3,
    title: '專案文檔',
    description: '專案相關的所有文檔',
    icon: '📁',
    link: '/documents',
    keywords: ['文檔', '文件', '專案', '項目']
  },
  {
    id: 4,
    title: '個人設置',
    description: '修改個人信息和偏好設置',
    icon: '⚙️',
    link: '/settings',
    keywords: ['設置', '配置', '個人', '偏好']
  }
])

// 監聽搜索文字的變化
watch(searchText, (newValue) => {
  // 當文字被完全刪除且正在搜索狀態時，回到中間
  if (!newValue.trim() && isSearching.value) {
    isSearching.value = false
  }
})

// 修改搜尋功能
const startSearch = async () => {
  if (!searchText.value.trim()) return
  
  isSearching.value = true
  isLoading.value = true
  searchResults.value = []
  
  try {
    console.log("發送搜尋請求:", searchText.value)
    const response = await axios.post('http://localhost:8000/api/search', {
      query: searchText.value,
      preferences: userPreferences.value
    })
    
    console.log("收到搜尋結果:", response.data)
    searchResults.value = response.data.results.map(result => ({
      id: result.url,
      title: result.title,
      url: result.url,
      description: result.description,
      icon: '🌐'
    }))
    console.log("處理後的結果:", searchResults.value)
    
  } catch (error) {
    console.error('搜尋出錯:', error)
    searchResults.value = [{
      id: 'error',
      title: '搜尋出錯',
      description: error.response?.data?.detail || '請稍後再試',
      icon: '⚠️',
      url: '#'
    }]
  } finally {
    isLoading.value = false
  }
}

// 根據類型返回對應圖標
const getIconByType = (type) => {
  const icons = {
    task: '📋',
    default: '🔍'
  }
  return icons[type] || icons.default
}

const clearSearch = () => {
  searchText.value = ''
  isSearching.value = false
}

const toggleTheme = () => {
  document.body.classList.toggle('dark')
  isDark.value = !isDark.value
}

const toggleAppPanel = () => {
  showAppPanel.value = !showAppPanel.value
}

const apps = [
  { 
    id: 1, 
    name: 'OA 系統', 
    icon: 'fas fa-briefcase', 
    color: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)' // 深藍色
  },
  { 
    id: 2, 
    name: '筆記系統', 
    icon: 'fas fa-sticky-note', 
    color: 'linear-gradient(135deg, #92400E 0%, #B45309 100%)' // 深橙色
  },
  { 
    id: 3, 
    name: '設置', 
    icon: 'fas fa-cog', 
    color: 'linear-gradient(135deg, #374151 0%, #4B5563 100%)' // 深灰色
  },
  { 
    id: 4, 
    name: '添加應用', 
    icon: 'fas fa-plus', 
    color: 'linear-gradient(135deg, #065F46 0%, #047857 100%)' // 深綠色
  }
]

// 添加導航功能
const navigateToResult = (result) => {
  router.push(result.link)
}

// 添加搜尋歷史功能
const searchHistory = ref([])
const MAX_HISTORY_ITEMS = 5

const addToSearchHistory = (query) => {
  if (!query.trim()) return
  
  // 移除重複項
  searchHistory.value = searchHistory.value.filter(item => item !== query)
  
  // 添加到開頭
  searchHistory.value.unshift(query)
  
  // 限制歷史記錄數量
  if (searchHistory.value.length > MAX_HISTORY_ITEMS) {
    searchHistory.value = searchHistory.value.slice(0, MAX_HISTORY_ITEMS)
  }
  
  // 保存到 localStorage
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

// 在組件掛載時載入搜尋歷史
const loadSearchHistory = () => {
  const history = localStorage.getItem('searchHistory')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

// 在搜尋時保存歷史
const handleSearch = async () => {
  await startSearch()
  addToSearchHistory(searchText.value)
}

// 修改點擊處理函數
const openUrl = (url) => {
  window.open(url, '_blank')  // 在新標籤頁打開URL
}

const showAddSite = ref(false)
const newUrl = ref('')

const addNewUrl = async () => {
  if (!newUrl.value) return
  
  try {
    const response = await axios.post('http://localhost:8000/api/add-url', {
      url: newUrl.value
    })
    
    if (response.data.status === 'success') {
      alert('網站已成功添加到搜尋引擎！')
      newUrl.value = ''
      showAddSite.value = false
    }
  } catch (error) {
    console.error('添加網站失敗:', error)
    alert('添加失敗，請確認URL格式正確')
  }
}

// 在搜尋結果中顯示地區標記
const getRegionLabel = (region) => {
    const labels = {
        'tw': '🇹🇼',
        'cn': '🇨🇳',
        'global': '🌐'
    }
    return labels[region] || '🌐'
}
</script>

<style scoped>
.home {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: 
    radial-gradient(circle at 0% 0%, rgba(0, 113, 227, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(0, 113, 227, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 100% 0%, rgba(130, 200, 255, 0.12) 0%, transparent 45%),
    radial-gradient(circle at 0% 100%, rgba(130, 200, 255, 0.12) 0%, transparent 45%),
    linear-gradient(135deg, rgba(0, 113, 227, 0.08) 0%, transparent 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
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

/* 搜框樣式 */
.search-box {
  position: relative;
  width: 100%;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-box.searching {
  position: fixed;
  left: 0;
  top: 0;
  width: 260px;
  padding: 20px;
  padding-right: 12px;
  z-index: 10;
}

.search-box.searching .search-input {
  width: calc(100% - 8px);
  margin-right: 8px;
}

.search-box.searching .clear-button {
  right: 20px;
}

.search-input {
  width: 100%;
  padding: 0 16px;
  padding-right: 48px;
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
  line-height: 48px;
  vertical-align: middle;
}

.search-input::placeholder {
  line-height: 48px;
  vertical-align: middle;
  color: var(--text-secondary);
}

/* 清除按鈕樣式 */
.clear-button {
  position: absolute;
  right: 8px;
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
  width: 360px;  /* 增加寬度 */
  height: 100vh;
  padding: 90px 20px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  z-index: 5;
  overflow: hidden;
}

.results-content {
  height: 100%;
  overflow-y: auto;
  padding-right: 10px;
}

.results-stats {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 113, 227, 0.1);
}

.result-item {
  padding: 16px;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.result-item:hover {
  transform: translateX(4px);
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.08),
    0 3px 6px rgba(0, 0, 0, 0.08);
}

.result-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.result-url {
  font-size: 0.8rem;
  color: #0066cc;
  margin-bottom: 8px;
  opacity: 0.8;
}

.result-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* 深色模式適配 */
body.dark .result-item {
  background: rgba(255, 255, 255, 0.1);
}

body.dark .result-item:hover {
  background: rgba(255, 255, 255, 0.15);
}

body.dark .results-stats {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

/* 深色模式樣式 */
body.dark .search-input {
  background: var(--dark-input-bg);
  color: #e2e8f0;
}

body.dark .result-item {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.15);
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
  --bg-color: #ffffff;
}

/* 添加右上角按鈕樣式 */
.top-right-buttons {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
  z-index: 30; /* 確保按鈕始終在最上層 */
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

/* 深色模式下的背景 */
body.dark .home {
  background: 
    radial-gradient(circle at 0% 0%, rgba(0, 113, 227, 0.25) 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(0, 113, 227, 0.25) 0%, transparent 50%),
    radial-gradient(circle at 100% 0%, rgba(130, 200, 255, 0.2) 0%, transparent 45%),
    radial-gradient(circle at 0% 100%, rgba(130, 200, 255, 0.2) 0%, transparent 45%),
    linear-gradient(135deg, rgba(0, 113, 227, 0.15) 0%, transparent 100%),
    var(--bg-color);
}

/* 應用選擇面板樣式 */
.app-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px);
  z-index: 25; /* 確保在按鈕下方，但在其他內容上方 */
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-grid {
  display: flex;
  gap: 24px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.2),
    0 8px 24px rgba(0, 0, 0, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
  max-width: none;
  width: auto;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transform: translateY(0);
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 添加上滑動畫 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.app-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 100px;
}

.app-item:hover {
  transform: translateY(-2px) scale(1.05);
}

.app-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  font-size: 24px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.app-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.app-icon:hover::before {
  opacity: 1;
}

.app-icon i {
  position: relative;
  z-index: 1;
  color: #1A202C;
  filter: none;
}

.app-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 深色模式適配 */
body.dark .app-grid {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 8px 24px rgba(0, 0, 0, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.1);
}

body.dark .app-name {
  color: rgba(255, 255, 255, 0.9);
}

/* 深色模式下的陰影調整 */
body.dark .app-icon {
  background-color: rgba(255, 255, 255, 0.1);
}

body.dark .app-icon i {
  color: #FFFFFF;
}

/* 深色模式變量 */
body.dark {
  --bg-color: #1a202c;
}

/* 添加新的樣式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  color: var(--text-secondary);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(0, 113, 227, 0.3);
  border-radius: 50%;
  border-top-color: #0071e3;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.no-results {
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
}

.result-item {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.result-item:hover {
  transform: translateX(4px);
}

.result-icon {
  font-size: 24px;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 113, 227, 0.1);
  border-radius: 8px;
}

.result-content {
  flex: 1;
}

/* 深色模式適配 */
body.dark .result-icon {
  background: rgba(0, 113, 227, 0.2);
}

.result-url {
  font-size: 0.8rem;
  color: #0066cc;
  margin-bottom: 4px;
  word-break: break-all;
}

.result-item {
  cursor: pointer;
}

.result-item:hover {
  background: rgba(0, 113, 227, 0.1);
}

/* 自定義滾動條 */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 113, 227, 0.5) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(0, 113, 227, 0.5);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 113, 227, 0.7);
}

.add-site-button {
  position: fixed;
  right: 20px;
  bottom: 20px;
  padding: 12px 24px;
  border: none;
  border-radius: 24px;
  background: #0071e3;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);
  transition: all 0.3s ease;
}

.add-site-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 113, 227, 0.4);
}

.add-site-button svg {
  width: 20px;
  height: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-content h2 {
  margin: 0 0 16px;
  color: var(--text-primary);
}

.input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.input-group input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.input-group button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: #0071e3;
  color: white;
  font-size: 16px;
  cursor: pointer;
}

.input-group button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.hint {
  margin: 0;
  font-size: 14px;
  color: #666;
}

/* 深色模式適配 */
body.dark .modal-content {
  background: #1a202c;
}

body.dark .input-group input {
  background: #2d3748;
  border-color: #4a5568;
  color: white;
}

body.dark .hint {
  color: #a0aec0;
}

/* 個人設置面板樣式 */
.settings-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px);
  z-index: 25; /* 確保在按鈕下方，但在其他內容上方 */
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.settings-item label {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--text-primary);
}

.settings-item select,
.settings-item input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.search-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

.search-history h4 {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.search-history div {
  font-size: 1.1rem;
  color: var(--text-secondary);
}
</style>
