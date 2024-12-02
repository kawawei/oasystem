<template>
  <div class="home-container">
    <header class="header">
      <div class="search-section">
        <SearchBar />
      </div>
      <div class="user-section">
        <div class="user-info">
          <img src="https://ui-avatars.com/api/?name=使用者&background=0071e3&color=fff" class="avatar" />
          <span>{{ username }}</span>
        </div>
        <button @click="logout" class="logout-button">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </header>
    
    <main class="main-content">
      <h1 class="welcome-text">歡迎回來，{{ username }}</h1>
      <div class="tools-grid">
        <div class="tool-card" @click="navigateTo('/task')">
          <div class="tool-icon">
            <i class="fas fa-tasks"></i>
          </div>
          <h3>任務管理</h3>
          <p>管理您的工作任務</p>
        </div>
        <div class="tool-card" @click="navigateTo('/chat')">
          <div class="tool-icon">
            <i class="fas fa-comments"></i>
          </div>
          <h3>聊天室</h3>
          <p>與團隊即時溝通</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import SearchBar from '@/components/Search/SearchBar.vue'

export default {
  components: {
    SearchBar
  },
  data() {
    return {
      username: '使用者'
    }
  },
  methods: {
    navigateTo(path) {
      this.$router.push(path)
    },
    logout() {
      // TODO: 實現登出邏輯
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(145deg, #fbfbfd 0%, #f5f5f7 100%);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  box-shadow: 0 1px 0 rgba(0,0,0,0.05);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.welcome-text {
  font-size: 2rem;
  color: #1d1d1f;
  margin-bottom: 2rem;
  font-weight: 600;
}

.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.tool-card {
  background: rgba(255, 255, 255, 0.8);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: all 0.3s ease;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0,0,0,0.12);
}

.tool-icon {
  width: 48px;
  height: 48px;
  background: #0071e3;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.tool-icon i {
  color: white;
  font-size: 1.5rem;
}

.tool-card h3 {
  font-size: 1.2rem;
  color: #1d1d1f;
  margin-bottom: 0.5rem;
}

.tool-card p {
  color: #86868b;
  font-size: 0.9rem;
}

.logout-button {
  background: none;
  border: none;
  cursor: pointer;
}
</style> 