<template>
  <div class="task-list-container">
    <!-- 頂部操作欄 -->
    <div class="top-bar">
      <h1>任務管理</h1>
      <button class="add-task-btn" @click="showAddTaskModal = true">
        <i class="fas fa-plus"></i>
        新增任務
      </button>
    </div>

    <!-- 篩選器 -->
    <div class="filters">
      <div class="filter-group">
        <label>狀態：</label>
        <select v-model="filters.status">
          <option value="">全部</option>
          <option value="pending">待處理</option>
          <option value="in_progress">進行中</option>
          <option value="completed">已完成</option>
        </select>
      </div>
      <div class="filter-group">
        <label>優先級：</label>
        <select v-model="filters.priority">
          <option value="">全部</option>
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
      </div>
    </div>

    <!-- 任務列表 -->
    <div class="task-grid">
      <div v-for="task in filteredTasks" :key="task.id" class="task-card">
        <div class="task-header">
          <span class="task-status" :class="task.status">{{ getStatusText(task.status) }}</span>
          <span class="task-priority" :class="task.priority">{{ getPriorityText(task.priority) }}</span>
        </div>
        <h3 class="task-title">{{ task.title }}</h3>
        <p class="task-description">{{ task.description }}</p>
        <div class="task-footer">
          <span class="due-date">到期：{{ formatDate(task.dueDate) }}</span>
          <div class="task-actions">
            <button @click="editTask(task)" title="編輯">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteTask(task.id)" title="刪除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/編輯任務彈窗 -->
    <div v-if="showAddTaskModal" class="modal">
      <div class="modal-content">
        <h2>{{ isEditing ? '編輯任務' : '新增任務' }}</h2>
        <form @submit.prevent="submitTask">
          <div class="form-group">
            <label>標題</label>
            <input v-model="taskForm.title" required />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="taskForm.description"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>優先級</label>
              <select v-model="taskForm.priority">
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
            <div class="form-group">
              <label>到期日</label>
              <input type="date" v-model="taskForm.dueDate" />
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddTaskModal = false">取消</button>
            <button type="submit">確定</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

export default {
  name: 'TaskList',
  setup() {
    const tasks = ref([])
    const showAddTaskModal = ref(false)
    const isEditing = ref(false)
    const taskForm = ref({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: ''
    })
    const filters = ref({
      status: '',
      priority: ''
    })

    // 獲取任務列表
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks')
        tasks.value = response
      } catch (error) {
        console.error('Error fetching tasks:', error)
      }
    }

    // 初始化時獲取任務列表
    onMounted(() => {
      fetchTasks()
    })

    // 篩選任務
    const filteredTasks = computed(() => {
      return tasks.value.filter(task => {
        if (filters.value.status && task.status !== filters.value.status) return false
        if (filters.value.priority && task.priority !== filters.value.priority) return false
        return true
      })
    })

    // 格式化日期
    const formatDate = (date) => {
      if (!date) return '無'
      return new Date(date).toLocaleDateString()
    }

    // 提交任務後重新獲取列表
    const submitTask = async () => {
      try {
        if (isEditing.value) {
          await api.put(`/tasks/${taskForm.value.id}`, taskForm.value)
        } else {
          await api.post('/tasks', taskForm.value)
        }
        showAddTaskModal.value = false
        taskForm.value = {
          title: '',
          description: '',
          priority: 'medium',
          dueDate: ''
        }
        isEditing.value = false
        await fetchTasks()
      } catch (error) {
        console.error('Error submitting task:', error)
      }
    }

    // 編輯任務
    const editTask = (task) => {
      isEditing.value = true
      taskForm.value = { ...task }
      showAddTaskModal.value = true
    }

    // 刪除任務
    const deleteTask = async (taskId) => {
      if (!confirm('確定要除此任務嗎？')) return
      try {
        await api.delete(`/tasks/${taskId}`)
        await fetchTasks()
      } catch (error) {
        console.error('Error deleting task:', error)
      }
    }

    // 狀態文字映射
    const getStatusText = (status) => {
      const statusMap = {
        'pending': '待處理',
        'in_progress': '進行中',
        'completed': '已完成'
      }
      return statusMap[status] || status
    }

    // 優先級文字映射
    const getPriorityText = (priority) => {
      const priorityMap = {
        'high': '高',
        'medium': '中',
        'low': '低'
      }
      return priorityMap[priority] || priority
    }

    return {
      tasks,
      showAddTaskModal,
      isEditing,
      taskForm,
      filters,
      filteredTasks,
      formatDate,
      submitTask,
      editTask,
      deleteTask,
      getStatusText,
      getPriorityText
    }
  }
}
</script>

<style scoped>
.task-list-container {
  padding: 2rem;
}

/* 頂部操作欄 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.add-task-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--button-bg);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-task-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* 篩選器 */
.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background: var(--box-bg);
  color: var(--text-color);
}

/* 任務網格 */
.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.task-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px var(--shadow-color);
}

.task-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.task-title {
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.task-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.task-actions button {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.task-actions button:hover {
  color: var(--text-color);
  background: var(--hover-bg);
}

/* 狀態和優先級標籤 */
.task-status,
.task-priority {
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

.task-priority.high {
  background: #f44336;
}

.task-priority.medium {
  background: #3f51b5;
}

.task-priority.low {
  background: #009688;
}

/* 模態框樣式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--modal-bg);
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 20px var(--shadow-color);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--label-color);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--text-color);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.modal-actions button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-actions button[type="button"] {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

.modal-actions button[type="submit"] {
  background: var(--button-bg);
  border: none;
  color: white;
}

input::placeholder,
textarea::placeholder {
  color: var(--placeholder-color);
}

.top-bar h1 {
  color: var(--text-color);
}

.filter-group label {
  color: var(--text-color);
}

.filter-group select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background: var(--box-bg);
  color: var(--text-color);
}

.modal-content h2 {
  color: var(--text-color);
}

/* 狀態和優先級標籤的中文文字 */
.filter-group select option {
  color: var(--text-color);
  background: var(--modal-bg);
}

/* 任務卡片標題 */
.task-card h3 {
  color: var(--text-color);
}

/* 到期日文字 */
.task-footer .due-date {
  color: var(--text-secondary);
}

/* 模態框標題 */
.modal-content h2 {
  color: var(--text-color);
}
</style> 