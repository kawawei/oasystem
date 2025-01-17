<template>
  <div class="home-container">
    <header class="header">
      <div class="header-content">
        <h1>Dashboard</h1>
        <button @click="handleLogout" class="button logout-button">
          Log Out
        </button>
      </div>
    </header>

    <main class="main-content">
      <div class="welcome-section">
        <h2>Welcome to OA System</h2>
        <p>Your workplace management solution</p>
      </div>

      <div class="quick-actions">
        <div class="action-card">
          <h3>Tasks</h3>
          <p>0 pending tasks</p>
        </div>
        <div class="action-card">
          <h3>Messages</h3>
          <p>0 unread messages</p>
        </div>
        <div class="action-card">
          <h3>Calendar</h3>
          <p>No upcoming events</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()

    const handleLogout = () => {
      localStorage.removeItem('token')
      router.push('/login')
    }

    return {
      handleLogout
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: var(--background-color);
}

.header {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  font-size: 20px;
  font-weight: 600;
}

.logout-button {
  background-color: transparent;
  color: var(--primary-color);
  padding: 8px 16px;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 20px 40px;
}

.welcome-section {
  margin-bottom: 40px;
}

.welcome-section h2 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 8px;
}

.welcome-section p {
  color: #6E6E73;
  font-size: 18px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.action-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.action-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.action-card p {
  color: #6E6E73;
}

@media (max-width: 768px) {
  .welcome-section h2 {
    font-size: 24px;
  }
  
  .welcome-section p {
    font-size: 16px;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style> 