<template>
  <div class="dashboard-container">
    <!-- 側邊欄 -->
    <aside class="sidebar glass" :class="{ 'sidebar-hidden': !sidebarVisible }">
      <div class="logo">
        <h1>OA System</h1>
      </div>
      <!-- 菜單切換按鈕移到這裡 -->
      <button class="menu-toggle glass-light" @click="toggleSidebar">
        <i :class="['fas', sidebarVisible ? 'fa-chevron-left' : 'fa-chevron-right']"></i>
      </button>
      <nav class="nav-menu">
        <router-link to="/dashboard" class="nav-item" :class="{ active: $route.path === '/dashboard' }">
          <i class="fas fa-home"></i>
          <span>主頁</span>
        </router-link>
        <router-link to="/tasks" class="nav-item" :class="{ active: $route.path === '/tasks' }">
          <i class="fas fa-tasks"></i>
          <span>任務管理</span>
        </router-link>
        <router-link to="/team" class="nav-item" :class="{ active: $route.path === '/team' }">
          <i class="fas fa-users"></i>
          <span>團隊</span>
        </router-link>
        <router-link to="/settings" class="nav-item" :class="{ active: $route.path === '/settings' }">
          <i class="fas fa-cog"></i>
          <span>基礎設置</span>
        </router-link>
        <router-link to="/notes" class="nav-item" :class="{ active: $route.path === '/notes' }">
          <i class="fas fa-sticky-note"></i>
          <span>筆記</span>
        </router-link>
      </nav>
    </aside>

    <!-- 主要內容區 -->
    <main class="main-content" :class="{ 'content-expanded': !sidebarVisible }">
      <!-- 頂部欄 -->
      <header class="top-bar glass-light">
        <div class="search-box glass-light">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="搜尋...">
        </div>
        <div class="user-menu">
          <div class="notifications glass-light">
            <i class="fas fa-bell"></i>
            <span class="badge">3</span>
          </div>
          <div class="user-info glass-light">
            <img :src="userAvatar" alt="user avatar" class="avatar">
            <span class="username">{{ username }}</span>
            <button class="logout-btn" @click="handleLogout">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </header>

      <!-- 內容區域改為使用 router-view -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      username: '',
      email: '',
      userAvatar: 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff',
      sidebarVisible: true
    }
  },
  created() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      this.username = user.username;
      this.email = user.email;
      // 生成基於用戶名的頭像
      this.userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=0D8ABC&color=fff`;
    } else {
      this.$router.push('/login');
    }
  },
  methods: {
    handleLogout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/login');
    },
    toggleSidebar() {
      this.sidebarVisible = !this.sidebarVisible;
    }
  }
}
</script>
<style scoped>
/* 基礎樣式 */
.dashboard-container {
  display: flex;
  min-height: 100vh;
  overflow-x: hidden;
  background: linear-gradient(
    120deg,
    rgba(224, 242, 254, 0.5) 0%,
    rgba(186, 230, 253, 0.5) 25%,
    rgba(147, 197, 253, 0.3) 50%,
    rgba(196, 181, 253, 0.3) 75%,
    rgba(233, 213, 255, 0.5) 100%
  );
  position: relative;
  color: #1d1d1f;
}

/* 添加動態背景效果 */
.dashboard-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 255, 255, 0.4) 0%,
    rgba(255, 255, 255, 0.1) 100%
  );
  z-index: 0;
}

/* 確保內在背景之上 */
.sidebar, .main-content {
  position: relative;
  z-index: 1;
}

/* 毛玻璃效果基礎類 */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.glass-light {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}

/* 側邊欄樣式 */
.sidebar {
  width: 250px;
  padding: 1.5rem;
  margin: 1rem 0 1rem 1rem;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #007AFF, #5856D6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1rem;
  color: #86868b;
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.8);
  color: #007AFF;
  transform: translateX(5px);
}

.nav-item.active {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

/* 主要內容區域樣式 */
.main-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 0;
}

/* 頂部欄樣式 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  border-radius: 16px;
}

.search-box {
  position: relative;
  width: 300px;
  border-radius: 12px;
  overflow: hidden;
}

.search-box input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: none;
  background: transparent;
  font-size: 0.9rem;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #86868b;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notifications {
  position: relative;
  padding: 0.8rem;
  border-radius: 12px;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff3b30;
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  border-radius: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.username {
  font-weight: 500;
}

.logout-btn {
  background: none;
  border: none;
  color: #ff3b30;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 59, 48, 0.1);
  transform: rotate(360deg);
}

/* 內容區域樣式 */
.welcome {
  font-size: 1.8rem;
  font-weight: 500;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.card {
  padding: 1.5rem;
  border-radius: 16px;
  display: flex;
  gap: 1rem;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

.card-icon.success { background: rgba(52, 199, 89, 0.1); color: #34C759; }
.card-icon.warning { background: rgba(255, 149, 0, 0.1); color: #FF9500; }
.card-icon.info { background: rgba(88, 86, 214, 0.1); color: #5856D6; }

.card-info h3 {
  color: #86868b;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.count {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #007AFF, #5856D6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.trend {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.trend.up { color: #34C759; }
.trend.down { color: #ff3b30; }
.trend.neutral { color: #86868b; }

/* 最近活動樣式 */
.recent-activity {
  margin: 0 1rem;
  padding: 1.5rem;
  border-radius: 16px;
}

.recent-activity h3 {
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.activity-item:hover {
  transform: translateX(5px);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-details .activity-title {
  margin-bottom: 0.3rem;
  font-weight: 500;
}

.activity-details .activity-time {
  color: #86868b;
  font-size: 0.8rem;
}

/* 響應式設計 */
@media (max-width: 1024px) {
  .sidebar {
    width: 80px;
  }
  
  .nav-item span {
    display: none;
  }
  
  .logo h1 {
    display: none;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: auto;
    margin: 0.5rem 0 0.5rem 0.5rem;
    transform: translateX(-100%);
  }
  
  .nav-menu {
    flex-direction: row;
    justify-content: space-around;
  }
  
  .nav-item {
    padding: 0.5rem;
  }
  
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .search-box {
    display: none;
  }
  
  .top-bar {
    margin: 0.5rem;
  }
  
  .menu-toggle {
    top: 50%;
    right: -20px;
    width: 32px;
    height: 32px;
  }

  .menu-toggle:hover {
    transform: translateY(-50%) scale(1.1);
  }

  .content-expanded {
    padding-left: 2rem;
  }
}

/* 菜單切換按鈕樣式 */
.menu-toggle {
  position: absolute;
  top: 50%;
  right: -20px;
  transform: translateY(-50%);
  z-index: 11;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.menu-toggle:hover {
  transform: translateY(-50%) scale(1.1);
  background: rgba(255, 255, 255, 0.9);
}

/* 調整菜單按鈕圖標大小 */
.menu-toggle i {
  font-size: 1rem;
  color: #86868b;
  transition: transform 0.3s ease;
}

/* 當側邊欄隱藏時旋轉圖標 */
.sidebar-hidden .menu-toggle i {
  transform: rotate(180deg);
}

/* 側邊欄過渡效果 */
.sidebar {
  width: 250px;
  padding: 1.5rem;
  margin: 1rem 0 1rem 1rem;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.sidebar-hidden {
  margin-left: -230px;
}

/* 主內容區域過渡 */
.main-content {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-expanded {
  margin-left: 0;
  padding-left: 3rem;
}

/* 添加過渡效果的樣式 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

