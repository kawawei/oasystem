<template>
  <div class="app-selector-overlay" @click="$emit('close')">
    <div class="app-selector" @click.stop>
      <div class="selector-header">
        <h3>應用啟動器</h3>
        <button class="close-button" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="apps-grid">
        <div 
          v-for="app in apps" 
          :key="app.id"
          class="app-item"
          @click="launchApp(app)"
        >
          <div class="app-icon" :style="{ background: app.color }">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path :d="app.icon"/>
            </svg>
          </div>
          <div class="app-info">
            <span class="app-name">{{ app.name }}</span>
          </div>
        </div>

        <div class="app-item add-app" @click="handleAddApp">
          <div class="app-icon add-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
          <div class="app-info">
            <span class="app-name">添加應用</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const emit = defineEmits(['close'])

const apps = [
  {
    id: 'dashboard',
    name: '儀表板',
    description: '查看數據統計和概覽',
    icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
    color: 'linear-gradient(135deg, #4299E1, #667EEA)',
    path: '/dashboard'
  },
  {
    id: 'chat',
    name: '聊天室',
    description: '即時通訊和團隊協作',
    icon: 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z',
    color: 'linear-gradient(135deg, #48BB78, #38B2AC)',
    path: '/chat'
  },
  {
    id: 'tasks',
    name: '任務管理',
    description: '追蹤和管理項目進度',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    color: 'linear-gradient(135deg, #ED8936, #ED64A6)',
    path: '/tasks'
  }
]

const launchApp = (app) => {
  router.push(app.path)
  emit('close')
}

const handleAddApp = () => {
  console.log('添加應用')
}
</script>

<style scoped>
.app-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  animation: overlayShow 0.3s ease;
}

.app-selector {
  width: 90%;
  max-width: 800px;
  background: transparent;
  border-radius: 24px;
  overflow: hidden;
  animation: selectorShow 0.3s ease;
}

.selector-header {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selector-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.close-button {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.close-button svg {
  width: 20px;
  height: 20px;
  color: #666;
}

.apps-grid {
  padding: 32px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 24px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
}

.app-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
}

.app-item:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.app-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.app-icon svg {
  width: 32px;
  height: 32px;
  color: white;
}

.app-name {
  font-weight: 500;
  color: #1a1a1a;
  text-align: center;
}

.add-app .app-icon {
  background: rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.add-app:hover .app-icon {
  background: rgba(0, 0, 0, 0.2);
}

body.dark .selector-header {
  background: rgba(45, 55, 72, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

body.dark .apps-grid {
  background: rgba(45, 55, 72, 0.4);
}

body.dark .app-item {
  background: rgba(45, 55, 72, 0.5);
}

body.dark .app-item:hover {
  background: rgba(45, 55, 72, 0.7);
}

body.dark .app-name {
  color: #e2e8f0;
}

body.dark .selector-header h3 {
  color: #e2e8f0;
}

body.dark .close-button svg {
  color: #e2e8f0;
}

body.dark .add-app .app-icon {
  background: rgba(255, 255, 255, 0.1);
}

body.dark .add-app:hover .app-icon {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes overlayShow {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes selectorShow {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style> 