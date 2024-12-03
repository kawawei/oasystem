<template>
  <div class="app-launcher-overlay" @click="$emit('close')">
    <div class="app-launcher" @click.stop>
      <div class="launcher-header">
        <h3>應用</h3>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="apps-grid">
        <div 
          v-for="app in apps" 
          :key="app.id"
          class="app-item"
          @click="launchApp(app.id)"
        >
          <div class="app-icon">
            <i class="fas" :class="app.icon"></i>
          </div>
          <span class="app-title">{{ app.title }}</span>
        </div>

        <!-- 添加應用按鈕 -->
        <div class="app-item add-app" @click="showStore">
          <div class="app-icon">
            <i class="fas fa-plus"></i>
          </div>
          <span class="app-title">獲取更多應用</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  emits: ['close'],
  
  setup(props, { emit }) {
    const apps = [
      {
        id: 'oa',
        title: 'OA 辦公系統',
        icon: 'fa-briefcase',
        description: '高效的辦公自動化系統',
        path: '/oa/dashboard'
      },
      {
        id: 'notes',
        title: '智能筆記',
        icon: 'fa-sticky-note',
        description: '智能筆記和知識管理',
        path: '/notes'
      },
      {
        id: 'calendar',
        title: '日曆',
        icon: 'fa-calendar',
        description: '行程管理和日程安排',
        path: '/calendar'
      }
    ]

    const router = useRouter()
    const launchApp = (appId) => {
      const app = apps.find(a => a.id === appId)
      if (app) {
        if (app.path) {
          router.push(app.path)
        }
        emit('close')
      }
    }

    const showStore = () => {
      // TODO: 實現應用商店
      console.log('打開應用商店')
    }

    return {
      apps,
      launchApp,
      showStore
    }
  }
}
</script>

<style scoped>
.app-launcher-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 1100;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 80px;
}

.app-launcher {
  width: 600px;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 24px var(--shadow-color);
  overflow: hidden;
}

.launcher-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  padding: 24px;
}

.app-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.app-item:hover {
  background: var(--hover-bg);
}

.app-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: white;
  border-radius: 12px;
  font-size: 24px;
}

.app-title {
  font-size: 14px;
  text-align: center;
}

.add-app {
  opacity: 0.7;
}

.add-app:hover {
  opacity: 1;
}

.add-app .app-icon {
  background: var(--border-color);
}
</style> 