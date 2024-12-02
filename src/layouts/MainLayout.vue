<template>
  <div class="layout-container" :class="{ 'menu-collapsed': isCollapsed }">
    <!-- 側邊菜單 -->
    <aside class="sidebar">
      <div class="logo-container">
        <div class="logo">OA</div>
        <span class="logo-text" v-show="!isCollapsed">OA System</span>
      </div>
      
      <button class="collapse-btn" @click="toggleMenu">
        <i class="fas" :class="isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
      </button>

      <nav class="menu">
        <router-link to="/dashboard" class="menu-item" :title="isCollapsed ? '儀表板' : ''">
          <i class="fas fa-home"></i>
          <span v-show="!isCollapsed">儀表板</span>
        </router-link>
        
        <router-link to="/task" class="menu-item" :title="isCollapsed ? '任務管理' : ''">
          <i class="fas fa-tasks"></i>
          <span v-show="!isCollapsed">任務管理</span>
        </router-link>
        
        <router-link to="/chat" class="menu-item" :title="isCollapsed ? '聊天室' : ''">
          <i class="fas fa-comments"></i>
          <span v-show="!isCollapsed">聊天室</span>
        </router-link>

        <router-link to="/search" class="menu-item" :title="isCollapsed ? '搜尋' : ''">
          <i class="fas fa-search"></i>
          <span v-show="!isCollapsed">搜尋</span>
        </router-link>
      </nav>

      <div class="user-section">
        <div class="user-info" :title="isCollapsed ? username : ''">
          <img :src="avatar" :alt="username" class="avatar" />
          <div class="user-details" v-show="!isCollapsed">
            <span class="username">{{ username }}</span>
            <span class="role">{{ role }}</span>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout" :title="isCollapsed ? '登出' : ''">
          <i class="fas fa-sign-out-alt"></i>
          <span v-show="!isCollapsed">登出</span>
        </button>
      </div>
    </aside>

    <!-- 主要內容區域 -->
    <main class="main-content">
      <header class="top-bar">
        <div class="breadcrumb">
          {{ currentPath }}
        </div>
        <ThemeToggle />
      </header>
      <div class="content">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script>
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useUserStore } from '@/stores/user'

export default {
  name: 'MainLayout',
  components: {
    ThemeToggle
  },
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  data() {
    return {
      isCollapsed: false,
      avatar: 'https://ui-avatars.com/api/?name=使用者&background=0071e3&color=fff'
    }
  },
  computed: {
    username() {
      return this.userStore.username
    },
    role() {
      return this.userStore.userRole
    },
    currentPath() {
      return this.$route.name || '首頁'
    }
  },
  methods: {
    toggleMenu() {
      this.isCollapsed = !this.isCollapsed
    },
    handleLogout() {
      this.userStore.logout()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  background: var(--bg-gradient);
}

.sidebar {
  width: 260px;
  background: var(--box-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: relative;
}

.menu-collapsed .sidebar {
  width: 80px;
}

.logo-container {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  width: 32px;
  height: 32px;
  background: var(--button-bg);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
}

.collapse-btn {
  position: absolute;
  right: -12px;
  top: 20px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--box-bg);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-color);
  z-index: 100;
}

.menu {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: var(--text-color);
  text-decoration: none;
  transition: all 0.3s ease;
}

.menu-item:hover,
.menu-item.router-link-active {
  background: var(--button-bg);
  color: white;
}

.menu-item i {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.user-section {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 500;
  color: var(--text-color);
}

.role {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.logout-btn {
  width: 100%;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 8px;
  background: var(--box-bg);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #ff4d4f;
  color: white;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.top-bar {
  height: 64px;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--box-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border-color);
}

.breadcrumb {
  color: var(--text-color);
  font-weight: 500;
}

.content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style> 