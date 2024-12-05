<template>
  <div class="content">
    <h2 class="welcome">任務管理</h2>
    
    <!-- 過濾和搜索區域 -->
    <div class="filter-section glass">
      <div class="search-wrapper glass-light">
        <i class="fas fa-search"></i>
        <input
          v-model="searchQuery"
          placeholder="搜索任務..."
          class="search-input"
          @input="handleSearch"
        >
      </div>

      <div class="status-filter">
        <button 
          v-for="status in statusButtons" 
          :key="status.value"
          class="status-btn glass-light"
          :class="{ active: statusFilter === status.value }"
          @click="handleStatusChange(status.value)"
        >
          <i :class="status.icon"></i>
          <span>{{ status.label }}</span>
          <span class="task-count">{{ getTaskCount(status.value) }}</span>
        </button>
      </div>

      <button class="create-task-btn glass-light" @click="handleCreateTask">
        <i class="fas fa-plus"></i>
        <span>新增任務</span>
      </button>
    </div>

    <!-- 任務列表 -->
    <div class="task-grid">
      <div v-for="task in filteredTasks" 
           :key="task.id" 
           class="task-card glass-light"
           :class="{ 'task-completed': task.status === 'completed' }"
      >
        <div class="task-progress-bar" :class="getStatusType(task.status)"></div>
        
        <div class="task-content">
          <div class="task-header">
            <span class="task-id">Task #{{ task.id }}</span>
            <div class="task-actions">
              <button class="action-btn edit" @click="handleEdit(task)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn delete" @click="handleDelete(task)">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <h3 class="task-title">{{ task.title }}</h3>
          
          <div class="task-description">
            這是任務的詳細描述，展示更多相關信息...
          </div>
          
          <div class="task-meta">
            <div class="info-group">
              <div class="info-item">
                <i class="fas fa-calendar"></i>
                <span>截止日期</span>
                <strong>{{ task.deadline }}</strong>
              </div>
              <div class="info-item">
                <i class="fas fa-user"></i>
                <span>負責人</span>
                <strong>{{ task.assignee }}</strong>
              </div>
            </div>
            
            <div class="tags-group">
              <span class="status-tag" :class="getStatusType(task.status)">
                {{ getStatusLabel(task.status) }}
              </span>
              <span class="priority-tag" :class="getPriorityType(task.priority)">
                {{ task.priority }}優先級
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 狀態按鈕配置
const statusButtons = [
  { 
    label: '待完成', 
    value: 'pending',
    icon: 'fas fa-hourglass-start'
  },
  { 
    label: '進行中', 
    value: 'in_progress',
    icon: 'fas fa-spinner'
  },
  { 
    label: '已完成', 
    value: 'completed',
    icon: 'fas fa-check'
  }
]

// 響應式數據
const searchQuery = ref('')
const statusFilter = ref('')
const tasks = ref([
  {
    id: 1,
    title: '完成首頁設計',
    status: 'in_progress',
    priority: '高',
    deadline: '2024-12-10',
    assignee: '張三'
  },
  {
    id: 2,
    title: '實現用戶認證',
    status: 'pending',
    priority: '中',
    deadline: '2024-12-15',
    assignee: '李四'
  }
])

// 計算屬性：過濾後的任務列表
const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !statusFilter.value || task.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

// 方法
const handleSearch = () => {
  // 實現搜索邏輯
}

const handleStatusChange = (status) => {
  statusFilter.value = statusFilter.value === status ? '' : status
}

const handleCreateTask = () => {
  // 實現創任務邏輯
}

const handleEdit = (task) => {
  // 實現編輯任務邏輯
}

const handleDelete = (task) => {
  // 實現刪除任務邏輯
}

// 輔助方法
const getStatusType = (status) => {
  return status
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '待處理',
    in_progress: '進行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return labels[status]
}

const getPriorityType = (priority) => {
  return priority.toLowerCase()
}

// 獲取每個狀態的任務數量
const getTaskCount = (status) => {
  return tasks.value.filter(task => task.status === status).length
}
</script>

<style scoped>
.content {
  padding: 0 1rem;
}

.welcome {
  font-size: 1.8rem;
  font-weight: 500;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #007AFF, #5856D6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.filter-section {
  padding: 1.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-wrapper {
  flex: 1;
  min-width: 300px;
  display: flex;
  align-items: center;
  padding: 0.8rem 1.2rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.search-wrapper:focus-within {
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.3);
  transform: translateY(-1px);
}

.search-wrapper i {
  color: #007AFF;
  font-size: 1rem;
  margin-right: 0.8rem;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: #1d1d1f;
  padding: 0;
}

.search-input::placeholder {
  color: #86868b;
}

.search-input:focus {
  outline: none;
}

.status-filter {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.status-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  color: #86868b;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.status-btn i {
  font-size: 0.9rem;
}

.status-btn .task-count {
  background: rgba(0, 0, 0, 0.06);
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.status-btn.active {
  background: #007AFF;
  color: white;
}

.status-btn.active .task-count {
  background: rgba(255, 255, 255, 0.2);
}

.create-task-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 12px;
  background: #34C759;
  color: white;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-task-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: #32BE56;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-wrapper {
    width: 100%;
  }

  .status-filter {
    justify-content: center;
  }
}

/* 任務網格 */
.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 0.5rem;
}

.task-card {
  position: relative;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.3) inset;
}

.task-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
}

.task-progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, rgba(0, 122, 255, 0.5), rgba(0, 122, 255, 0.8));
}

.task-progress-bar.completed {
  background: linear-gradient(90deg, rgba(52, 199, 89, 0.5), rgba(52, 199, 89, 0.8));
}

.task-progress-bar.pending {
  background: linear-gradient(90deg, rgba(88, 86, 214, 0.5), rgba(88, 86, 214, 0.8));
}

.task-progress-bar.in_progress {
  background: linear-gradient(90deg, rgba(255, 149, 0, 0.5), rgba(255, 149, 0, 0.8));
}

.task-content {
  padding: 1.5rem;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
}

.task-id {
  font-size: 0.9rem;
  color: #86868b;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.task-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1d1d1f;
  line-height: 1.4;
}

.task-description {
  font-size: 0.95rem;
  color: #86868b;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.info-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.info-item i {
  font-size: 1rem;
  color: #007AFF;
}

.info-item span {
  font-size: 0.8rem;
  color: #86868b;
}

.info-item strong {
  font-size: 0.95rem;
  color: #1d1d1f;
  font-weight: 500;
}

.tags-group {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.status-tag, .priority-tag {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 完成狀態的特殊樣式 */
.task-completed {
  background: rgba(255, 255, 255, 0.5);
}

.task-completed .task-title {
  color: #86868b;
}

/* 動畫效果 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.task-card {
  animation: slideIn 0.5s ease-out;
}
</style>