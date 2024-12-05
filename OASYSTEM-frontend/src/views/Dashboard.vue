<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <div class="user-info">
        <h1>歡迎回來，{{ username }}</h1>
        <p>{{ email }}</p>
      </div>
      <button class="logout-btn" @click="handleLogout">
        <i class="fas fa-sign-out-alt"></i>
        登出
      </button>
    </header>
    
    <main class="dashboard-content">
      <!-- 這裡可以添加儀表板的主要內容 -->
      <div class="dashboard-cards">
        <div class="card">
          <h3>待辦事項</h3>
          <p class="count">0</p>
        </div>
        <div class="card">
          <h3>通知</h3>
          <p class="count">0</p>
        </div>
        <div class="card">
          <h3>消息</h3>
          <p class="count">0</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      username: '',
      email: ''
    }
  },
  created() {
    // 從 localStorage 獲取用戶信息
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      this.username = user.username;
      this.email = user.email;
    } else {
      // 如果沒有用戶信息，跳轉到登入頁
      this.$router.push('/login');
    }
  },
  methods: {
    handleLogout() {
      // 清除本地存儲
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 跳轉到登入頁
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.dashboard-header {
  background: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info h1 {
  font-size: 1.5rem;
  color: #1d1d1f;
  margin: 0;
}

.user-info p {
  color: #86868b;
  margin: 0.5rem 0 0;
}

.logout-btn {
  background: #ff3b30;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background: #dc352b;
}

.dashboard-content {
  padding: 2rem;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card h3 {
  color: #1d1d1f;
  margin: 0 0 1rem;
}

.count {
  font-size: 2rem;
  color: #007AFF;
  margin: 0;
  font-weight: 600;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .dashboard-cards {
    grid-template-columns: 1fr;
  }
}
</style>
