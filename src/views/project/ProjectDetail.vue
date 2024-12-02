<template>
  <div class="project-detail">
    <!-- 頂部資訊 -->
    <div class="project-header">
      <div class="project-info">
        <h1>{{ project.title }}</h1>
        <span class="project-status" :class="project.status">
          {{ getStatusText(project.status) }}
        </span>
      </div>
      <div class="project-actions">
        <button @click="editProject" title="編輯">
          <i class="fas fa-edit"></i>
          編輯專案
        </button>
      </div>
    </div>

    <!-- 專案進度 -->
    <div class="progress-section">
      <div class="progress-bar">
        <div class="progress" :style="{ width: project.progress + '%' }"></div>
      </div>
      <span class="progress-text">總進度: {{ project.progress }}%</span>
    </div>

    <!-- 專案階段 -->
    <div class="phases-section">
      <h2>專案階段</h2>
      <div class="phase-timeline">
        <div class="phase-list">
          <div v-for="phase in project.phases" 
               :key="phase.id" 
               class="phase-card"
               :class="{ active: phase.status === 'in_progress' }">
            <div class="phase-header">
              <span class="phase-number">{{ phase.order + 1 }}</span>
              <h3>{{ phase.title }}</h3>
              <span class="phase-status" :class="phase.status">
                {{ getPhaseStatusText(phase.status) }}
              </span>
            </div>
            <p class="phase-description">{{ phase.description }}</p>
            <div class="phase-progress">
              <div class="progress-bar">
                <div class="progress" :style="{ width: phase.progress + '%' }"></div>
              </div>
              <span class="progress-text">{{ phase.progress }}%</span>
            </div>
            <div class="phase-footer">
              <div class="phase-info">
                <span>負責人: 
                  <select v-model="phase.assignedTo" @change="updatePhase(phase)">
                    <option value="">未指派</option>
                    <option v-for="user in users" 
                            :key="user.id" 
                            :value="user.id">
                      {{ user.username }}
                    </option>
                  </select>
                </span>
                <span>到期日: {{ formatDate(phase.dueDate) }}</span>
              </div>
              <button @click="editPhase(phase)" class="edit-phase-btn">
                <i class="fas fa-edit"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

export default {
  name: 'ProjectDetail',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const project = ref({})
    const users = ref([])

    // 獲取專案詳情
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${props.id}`)
        project.value = response
        // 計算進度
        if (project.value.phases?.length > 0) {
          const completedPhases = project.value.phases.filter(p => p.status === 'completed').length
          const progress = (completedPhases / project.value.phases.length) * 100
          document.querySelector('.phase-list').style.setProperty('--phase-progress', `${progress}%`)
        }
      } catch (error) {
        console.error('Error fetching project:', error)
        router.push('/projects')
      }
    }

    // 獲取用戶列表
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users')
        users.value = response
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    // 格式化日期
    const formatDate = (date) => {
      if (!date) return '未設定'
      return new Date(date).toLocaleDateString()
    }

    // 狀態文字映射
    const getStatusText = (status) => {
      const statusMap = {
        'planning': '規劃中',
        'in_progress': '進行中',
        'completed': '已完成'
      }
      return statusMap[status] || status
    }

    // 階段狀態文字映射
    const getPhaseStatusText = (status) => {
      const statusMap = {
        'pending': '待處理',
        'in_progress': '進行中',
        'completed': '已完成'
      }
      return statusMap[status] || status
    }

    // 更新階段
    const updatePhase = async (phase) => {
      try {
        await api.put(`/phases/${phase.id}`, {
          assignedTo: phase.assignedTo
        })
        await fetchProject()  // 重新獲取專案資料
      } catch (error) {
        console.error('Error updating phase:', error)
      }
    }

    onMounted(() => {
      fetchProject()
      fetchUsers()
    })

    return {
      project,
      users,
      formatDate,
      getStatusText,
      getPhaseStatusText,
      updatePhase
    }
  }
}
</script>

<style scoped>
.project-detail {
  padding: 2rem;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.project-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.project-info h1 {
  color: var(--heading-color);
  margin: 0;
}

.project-status {
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  color: white;
}

.project-status.planning {
  background: #ff9800;
}

.project-status.in_progress {
  background: #2196f3;
}

.project-status.completed {
  background: #4caf50;
}

.project-actions button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: var(--button-bg);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.project-actions button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* 進度條樣式 */
.progress-section {
  margin-bottom: 2rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: var(--button-bg);
  transition: width 0.3s ease;
}

.progress-text {
  display: block;
  margin-top: 0.5rem;
  color: var(--text-secondary);
}

/* 階段列表樣式 */
.phases-section h2 {
  color: var(--heading-color);
  margin-bottom: 1.5rem;
}

.phase-list {
  display: grid;
  gap: 1.5rem;
  position: relative;
}

/* 連接線樣式 */
.phase-list::before {
  content: '';
  position: absolute;
  left: calc(1.5rem + 16px);  /* 考慮 padding 和圓圈的一半 */
  top: 16px;   /* 第一個階段的中心點 */
  bottom: 16px; /* 最後一個階段的中心點 */
  width: 3px;  /* 加粗連接線 */
  background: linear-gradient(to bottom, 
    #4caf50 0%,  /* 已完成部分用綠色 */
    #4caf50 var(--phase-progress, 0%),
    #2196f3 var(--phase-progress, 0%),  /* 未完成部分用藍色 */
    #2196f3 100%
  );
  opacity: 0.3;  /* 降低透明度 */
  border-radius: 2px;  /* 圓角連接線 */
}

.phase-card {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
  position: relative;
  z-index: 1;
  margin-left: 1rem;  /* 為連接線留出空間 */
}

.phase-card.active {
  border: 2px solid var(--button-bg);
}

.phase-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.phase-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--box-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--text-color);
  border: 2px solid #2196f3;  /* 使用藍色邊框 */
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);  /* 添加陰影 */
}

.phase-card.active .phase-number {
  border-color: var(--button-bg);
  background: var(--button-bg);
  color: white;
}

.phase-card.completed .phase-number {
  background: #4caf50;
  color: white;
  transform: scale(1.1);  /* 完成時稍微放大 */
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);  /* 綠色陰影 */
}

.phase-header h3 {
  color: var(--heading-color);
  margin: 0;
  flex: 1;
}

.phase-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.phase-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.phase-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: var(--text-secondary);
}

.edit-phase-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-phase-btn:hover {
  color: var(--text-color);
  background: var(--hover-bg);
}
</style> 