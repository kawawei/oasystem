<template>
  <div class="dashboard">
    <!-- 過濾器 -->
    <DashboardFilter
      :dashboardData="{
        taskStats,
        projectStats,
        taskTrends,
        taskPriorityStats
      }"
      @filter-change="handleFilterChange"
    />

    <!-- 統計卡片 -->
    <div class="stat-cards">
      <div class="stat-card">
        <h3>任務統計</h3>
        <div class="stat-numbers">
          <div class="stat-item">
            <span class="number">{{ taskStats.pending || 0 }}</span>
            <span class="label">待處理</span>
          </div>
          <div class="stat-item">
            <span class="number">{{ taskStats.in_progress || 0 }}</span>
            <span class="label">進行中</span>
          </div>
          <div class="stat-item">
            <span class="number">{{ taskStats.completed || 0 }}</span>
            <span class="label">已完成</span>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <h3>專案統計</h3>
        <div class="stat-numbers">
          <div class="stat-item">
            <span class="number">{{ projectStats.planning || 0 }}</span>
            <span class="label">規劃中</span>
          </div>
          <div class="stat-item">
            <span class="number">{{ projectStats.in_progress || 0 }}</span>
            <span class="label">進行中</span>
          </div>
          <div class="stat-item">
            <span class="number">{{ projectStats.completed || 0 }}</span>
            <span class="label">已完成</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 圖表區域 -->
    <div class="chart-section">
      <div class="chart-grid">
        <!-- 任務趨勢圖表 -->
        <TaskTrendChart 
          v-if="taskTrendData.labels.length > 0"
          :taskData="taskTrendData" 
        />
        <!-- 專案進度圖表 -->
        <ProjectProgressChart
          :projectData="projectStats"
        />
        <!-- 任務優先級圖表 -->
        <TaskPriorityChart
          :taskData="taskPriorityData"
        />
        <!-- 用戶活動圖表 -->
        <UserActivityChart
          v-if="userActivityData.dates.length > 0"
          :activityData="userActivityData"
        />
      </div>
    </div>

    <!-- 最近的專案 -->
    <div class="recent-projects">
      <h3>最近的專案</h3>
      <div class="project-list">
        <div v-for="project in recentProjects" 
             :key="project.id" 
             class="project-card"
             @click="viewProject(project)">
          <h4>{{ project.title }}</h4>
          <div class="project-info">
            <span class="status" :class="project.status">
              {{ getStatusText(project.status) }}
            </span>
            <span class="phase-count">
              {{ project.phases.length }} 個階段
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import TaskTrendChart from '@/components/charts/TaskTrendChart.vue'
import ProjectProgressChart from '@/components/charts/ProjectProgressChart.vue'
import TaskPriorityChart from '@/components/charts/TaskPriorityChart.vue'
import UserActivityChart from '@/components/charts/UserActivityChart.vue'
import DashboardFilter from '@/components/dashboard/DashboardFilter.vue'

export default {
  components: {
    TaskTrendChart,
    ProjectProgressChart,
    TaskPriorityChart,
    UserActivityChart,
    DashboardFilter
  },
  setup() {
    const router = useRouter()
    const taskStats = ref({})
    const projectStats = ref({})
    const recentProjects = ref([])
    const taskTrends = ref([])
    const taskPriorityStats = ref([])
    const userActivities = ref({
      taskActivities: [],
      projectActivities: []
    })

    // 處理趨勢數據
    const taskTrendData = computed(() => {
      const dates = [...new Set(taskTrends.value.map(t => t.date))].sort()
      const data = {
        labels: dates,
        pending: [],
        inProgress: [],
        completed: []
      }
      
      dates.forEach(date => {
        const dayData = taskTrends.value.filter(t => t.date === date)
        data.pending.push(dayData.find(d => d.status === 'pending')?.count || 0)
        data.inProgress.push(dayData.find(d => d.status === 'in_progress')?.count || 0)
        data.completed.push(dayData.find(d => d.status === 'completed')?.count || 0)
      })
      
      return data
    })

    // 處理優先級數據
    const taskPriorityData = computed(() => {
      const data = {
        low: 0,
        medium: 0,
        high: 0
      }
      taskPriorityStats.value.forEach(stat => {
        data[stat.priority] = parseInt(stat.count)
      })
      return data
    })

    // 處理用戶活動數據
    const userActivityData = computed(() => {
      // 獲取所有日期
      const taskDates = userActivities.value.taskActivities.map(t => t.date)
      const projectDates = userActivities.value.projectActivities.map(p => p.date)
      const allDates = [...new Set([...taskDates, ...projectDates])].sort()
 
      // 填充數據
      const data = {
        dates: allDates,
        taskActivities: [],
        projectActivities: []
      }
 
      allDates.forEach(date => {
        data.taskActivities.push(
          userActivities.value.taskActivities.find(t => t.date === date)?.count || 0
        )
        data.projectActivities.push(
          userActivities.value.projectActivities.find(p => p.date === date)?.count || 0
        )
      })
 
      return data
    })

    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard')
        taskStats.value = response.taskStats
        projectStats.value = response.projectStats
        recentProjects.value = response.recentProjects
        taskTrends.value = response.taskTrends
        taskPriorityStats.value = response.taskPriorityStats
        userActivities.value = response.userActivities
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    const viewProject = (project) => {
      router.push(`/projects/${project.id}`)
    }

    const getStatusText = (status) => {
      const statusMap = {
        'planning': '規劃中',
        'in_progress': '進行中',
        'completed': '已完成'
      }
      return statusMap[status] || status
    }

    const handleFilterChange = async (filter) => {
      try {
        const response = await api.get('/dashboard', {
          params: {
            startDate: filter.startDate,
            endDate: filter.endDate
          }
        })
        taskStats.value = response.taskStats
        projectStats.value = response.projectStats
        taskTrends.value = response.taskTrends
        taskPriorityStats.value = response.taskPriorityStats
      } catch (error) {
        console.error('Error fetching filtered data:', error)
      }
    }

    onMounted(fetchDashboardData)

    return {
      taskStats,
      projectStats,
      recentProjects,
      taskTrendData,
      taskPriorityData,
      viewProject,
      getStatusText,
      handleFilterChange,
      userActivityData
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 2rem;
}

/* 統計卡片樣式 */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
  color: var(--heading-color);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.stat-numbers {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat-item {
  text-align: center;
}

.stat-item .number {
  display: block;
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.stat-item .label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* 最近專案樣式 */
.recent-projects {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow-color);
}

.recent-projects h3 {
  color: var(--heading-color);
  margin-bottom: 1rem;
}

.project-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.project-card {
  background: var(--box-bg);
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.project-card h4 {
  color: var(--text-color);
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.project-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.status.planning {
  background: #ff9800;
  color: white;
}

.status.in_progress {
  background: #2196f3;
  color: white;
}

.status.completed {
  background: #4caf50;
  color: white;
}

.phase-count {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .stat-cards {
    grid-template-columns: 1fr;
  }

  .project-list {
    grid-template-columns: 1fr;
  }
}

/* 圖表區域樣式 */
.chart-section {
  margin-bottom: 2rem;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 1200px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style> 