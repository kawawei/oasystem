<template>
  <div class="dashboard">
    <div class="stats-grid">
      <!-- 統計卡片 -->
      <div class="stat-card">
        <h3>待處理任務</h3>
        <div class="stat-value">{{ stats.pendingTasks }}</div>
      </div>
      <div class="stat-card">
        <h3>進行中任務</h3>
        <div class="stat-value">{{ stats.inProgressTasks }}</div>
      </div>
      <div class="stat-card">
        <h3>已完成任務</h3>
        <div class="stat-value">{{ stats.completedTasks }}</div>
      </div>
    </div>

    <!-- 最近任務列表 -->
    <div class="recent-tasks">
      <h2>最近任務</h2>
      <div class="task-list">
        <div v-for="task in recentTasks" :key="task.id" class="task-item">
          <div class="task-title">{{ task.title }}</div>
          <div class="task-status" :class="task.status">{{ getStatusText(task.status) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '@/services/api'

export default {
  name: 'Dashboard',
  setup() {
    const stats = ref({
      pendingTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0
    })
    const recentTasks = ref([])

    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard')
        console.log('Dashboard response:', response)
        stats.value = response.stats
        recentTasks.value = response.recentTasks
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    onMounted(fetchDashboardData)

    const intervalId = setInterval(fetchDashboardData, 30000)

    onUnmounted(() => {
      clearInterval(intervalId)
    })

    // 狀態文字映射
    const getStatusText = (status) => {
      const statusMap = {
        'pending': '待處理',
        'in_progress': '進行中',
        'completed': '已完成'
      }
      return statusMap[status] || status
    }

    return {
      stats,
      recentTasks,
      getStatusText
    }
  }
}
</script>

<style scoped>
.dashboard {
  background: var(--box-bg);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2, h3 {
  color: var(--heading-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow-color);
}

.stat-card h3 {
  color: var(--text-color);
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-color);
  margin-top: 0.5rem;
}

.recent-tasks {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow-color);
}

.recent-tasks h2 {
  color: var(--heading-color);
  margin-bottom: 1rem;
}

.task-list {
  margin-top: 1rem;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.task-title {
  color: var(--text-color);
}

.task-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  color: var(--status-text);
}

.task-status.pending {
  background: #ff9800;
  color: #ffffff;
}

.task-status.in_progress {
  background: #2196f3;
  color: #ffffff;
}

.task-status.completed {
  background: #4caf50;
  color: #ffffff;
}
</style> 