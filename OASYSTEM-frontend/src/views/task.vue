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

    <el-dialog
      v-model="dialogVisible"
      :show-close="false"
      width="600px"
      class="task-dialog"
      top="5vh"
    >
      <div class="dialog-content">
        <el-button 
          class="close-btn" 
          circle 
          @click="dialogVisible = false"
        >
          <el-icon><Close /></el-icon>
        </el-button>

        <!-- 漸變背景標題區 -->
        <div class="dialog-header">
          <div class="header-content">
            <h2>{{ isEditing ? '編輯任務' : '新增任務' }}</h2>
            <p>{{ isEditing ? '修改任務信息' : '創建一個新的任務並設置相關信息' }}</p>
          </div>
        </div>

        <!-- 表單區域 -->
        <el-form
          ref="taskFormRef"
          :model="taskForm"
          :rules="rules"
          label-position="top"
          class="task-form"
        >
          <el-form-item 
            label="任務標題" 
            prop="title"
            class="form-item"
          >
            <el-input 
              v-model="taskForm.title"
              placeholder="輸入任務標題"
              class="custom-input"
            >
              <template #prefix>
                <el-icon><Edit /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item 
            label="任務描述" 
            prop="description"
            class="form-item"
          >
            <el-input
              v-model="taskForm.description"
              type="textarea"
              :rows="4"
              placeholder="詳細描述任務內容..."
              class="custom-textarea"
            />
          </el-form-item>

          <div class="form-row">
            <el-form-item 
              label="優先級" 
              prop="priority"
              class="form-item-half"
            >
              <el-select 
                v-model="taskForm.priority"
                placeholder="選擇優先級"
                class="custom-select"
              >
                <el-option
                  v-for="item in priorityOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  <div class="priority-option">
                    <div :class="['priority-dot', item.value]"></div>
                    {{ item.label }}
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item 
              label="負責人" 
              prop="assignee"
              class="form-item-half"
            >
              <el-select 
                v-model="taskForm.assignee"
                placeholder="選擇負責人"
                class="custom-select"
                filterable
              >
                <el-option
                  v-for="user in userOptions"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
                >
                  <div class="user-option">
                    <el-avatar 
                      :size="24" 
                      :src="user.avatar"
                      class="user-avatar"
                    >
                      {{ user.name.charAt(0) }}
                    </el-avatar>
                    <span>{{ user.name }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </div>

          <div class="form-row">
            <el-form-item 
              label="截止日期" 
              prop="dueDate"
              class="form-item"
            >
              <el-date-picker
                v-model="taskForm.dueDate"
                type="datetime"
                placeholder="選擇截止日期"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="custom-date-picker"
              />
            </el-form-item>
          </div>
        </el-form>

        <!-- 底部按鈕區 -->
        <div class="dialog-footer">
          <el-button 
            class="cancel-btn" 
            @click="dialogVisible = false"
          >
            取消
          </el-button>
          <el-button 
            type="primary" 
            class="submit-btn" 
            @click="submitTask"
          >
            {{ isEditing ? '更新任務' : '創建任務' }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, Close } from '@element-plus/icons-vue'
import { taskAPI } from '../api/tasks'
import { userAPI } from '../api/user'

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
const tasks = ref([])

// 添加表單相關的響應式數據
const dialogVisible = ref(false)
const taskFormRef = ref(null)
const taskForm = ref({
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
  assignee: ''
})

// 優先級選項
const priorityOptions = [
  { label: '高優先級', value: 'high' },
  { label: '中等優先級', value: 'medium' },
  { label: '低優先級', value: 'low' }
]

// 表單驗證規則
const rules = {
  title: [
    { required: true, message: '請輸入任務標題', trigger: 'blur' },
    { min: 2, max: 50, message: '長 2 到 50 個字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '請輸入任務描述', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '請選擇優先級', trigger: 'change' }
  ],
  dueDate: [
    { required: true, message: '請選擇截止日期', trigger: 'change' }
  ],
  assignee: [
    { required: true, message: '請選擇負責人', trigger: 'change' }
  ]
}

// 添加用戶選項的響應式數據
const userOptions = ref([])

// 在組件掛載時獲取任務數據
onMounted(async () => {
  await loadTasks()
  await loadUsers()
})

// 加載任務數據
const loadTasks = async () => {
  try {
    const response = await taskAPI.getAllTasks()
    tasks.value = response
  } catch (error) {
    console.error('獲取任務失敗:', error)
    // 這裡可以添加錯誤提示
  }
}

// 加載用戶列表
const loadUsers = async () => {
  try {
    const response = await userAPI.getAllUsers()
    userOptions.value = response
  } catch (error) {
    console.error('獲取用戶列表失敗:', error)
    ElMessage({
      message: '獲取用戶列表失敗',
      type: 'error',
      customClass: 'custom-message'
    })
  }
}

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
  // 搜索已通過 computed 屬性實現
}

const handleStatusChange = (status) => {
  statusFilter.value = statusFilter.value === status ? '' : status
}

const handleCreateTask = () => {
  isEditing.value = false
  currentTaskId.value = null
  dialogVisible.value = true
  taskForm.value = {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignee: ''
  }
}

const handleEdit = async (task) => {
  isEditing.value = true
  currentTaskId.value = task.id
  dialogVisible.value = true
  taskForm.value = {
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate,
    assignee: task.assignee
  }
}

const handleDelete = async (task) => {
  try {
    await taskAPI.deleteTask(task.id)
    await loadTasks()
  } catch (error) {
    console.error('刪除任務失敗:', error)
  }
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

const getTaskCount = (status) => {
  return tasks.value.filter(task => task.status === status).length
}

// 添加提交方法
const isEditing = ref(false)
const currentTaskId = ref(null)

const submitTask = async () => {
  if (!taskFormRef.value) return

  await taskFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEditing.value) {
          // 更新任務
          await taskAPI.updateTask(currentTaskId.value, taskForm.value)
          ElMessage({
            message: '任務更新成功',
            type: 'success',
            customClass: 'custom-message',
            duration: 3000,
            offset: 60,
            grouping: true,
            showClose: true
          })
        } else {
          // 創建新任務
          await taskAPI.createTask(taskForm.value)
          ElMessage({
            message: '任務創建成功',
            type: 'success',
            customClass: 'custom-message',
            duration: 3000,
            offset: 60,
            grouping: true,
            showClose: true
          })
        }
        dialogVisible.value = false
        await loadTasks()
      } catch (error) {
        ElMessage({
          message: isEditing.value ? '更新任務失敗' : '創建任務失敗',
          type: 'error',
          customClass: 'custom-message',
          duration: 3000,
          showClose: true
        })
        console.error(isEditing.value ? '更新任務失敗:' : '創建任務失敗:', error)
      }
    }
  })
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

/* 動效果 */
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

/* 添加新的樣式 */
.task-dialog :deep(.el-dialog) {
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.3) inset;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
}

.dialog-content {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
}

.dialog-content::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: 
    radial-gradient(
      circle at 0% 0%,
      rgba(10, 132, 255, 0.08) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 100% 100%,
      rgba(99, 102, 241, 0.08) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 50% 50%,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 50%
    );
  transform: rotate(-15deg);
  z-index: 0;
}

.dialog-content::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(
      45deg,
      transparent 0%,
      rgba(255, 255, 255, 0.08) 50%,
      transparent 100%
    );
  z-index: 0;
}

.dialog-header {
  background: linear-gradient(135deg, #0A84FF, #6C47FF);
  padding: 40px 48px 40px 40px;
  position: relative;
  overflow: hidden;
}

.header-content h2 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #fff;
  letter-spacing: -0.5px;
}

.header-content p {
  font-size: 16px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.95);
}

.task-form {
  padding: 40px;
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

:deep(.el-form-item__label) {
  padding-bottom: 12px;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 600;
  letter-spacing: -0.3px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.1);
}

.custom-input :deep(.el-input__wrapper),
.custom-select :deep(.el-input__wrapper),
.custom-date-picker :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.03),
    0 1px 2px rgba(0, 0, 0, 0.02),
    0 0 0 1px rgba(255, 255, 255, 0.3) inset;
}

.custom-input :deep(.el-input__inner),
.custom-select :deep(.el-input__inner) {
  font-size: 16px;
  color: #1d1d1f;
}

.custom-textarea :deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.03),
    0 1px 2px rgba(0, 0, 0, 0.02),
    0 0 0 1px rgba(255, 255, 255, 0.3) inset;
}

.custom-input :deep(.el-input__wrapper):hover,
.custom-textarea :deep(.el-textarea__inner):hover,
.custom-select :deep(.el-input__wrapper):hover,
.custom-date-picker :deep(.el-input__wrapper):hover {
  background: rgba(255, 255, 255, 0.5);
  border-color: rgba(10, 132, 255, 0.6);
}

.custom-input :deep(.el-input__wrapper).is-focus,
.custom-textarea :deep(.el-textarea__inner):focus,
.custom-select :deep(.el-input__wrapper).is-focus,
.custom-date-picker :deep(.el-input__wrapper).is-focus {
  background: rgba(255, 255, 255, 0.6);
  border-color: #0A84FF;
  box-shadow: 
    0 0 0 4px rgba(10, 132, 255, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(255, 255, 255, 0.3) inset;
}

.dialog-footer {
  padding: 32px 40px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.cancel-btn {
  padding: 12px 28px;
  font-size: 15px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(4px);
  color: #1d1d1f;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.submit-btn {
  padding: 12px 32px;
  font-size: 15px;
  border-radius: 14px;
  background: linear-gradient(135deg, 
    rgba(10, 132, 255, 0.9), 
    rgba(0, 102, 204, 0.9)
  );
  backdrop-filter: blur(4px);
  border: none;
  color: white;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.submit-btn:hover {
  background: linear-gradient(135deg, 
    rgba(0, 145, 255, 0.95), 
    rgba(0, 116, 229, 0.95)
  );
  transform: translateY(-1px);
  box-shadow: 
    0 4px 12px rgba(10, 132, 255, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.2) inset;
}

.priority-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  font-size: 15px;
}

.priority-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.form-item {
  margin-bottom: 28px;
}

.custom-input :deep(.el-input__prefix),
.custom-select :deep(.el-input__prefix),
.custom-date-picker :deep(.el-input__prefix) {
  font-size: 18px;
  margin-right: 8px;
  color: #0A84FF;
}

/* 關閉按鈕樣式優化 */
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.close-btn :deep(.el-icon) {
  font-size: 18px;
  color: white;
}

/* 自定義消息樣式 - Apple 風格 */
:deep(.custom-message) {
  padding: 12px 20px;
  border-radius: 16px;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 0 1px rgba(0, 0, 0, 0.1);
  font-size: 15px;
  font-weight: 500;
  min-width: 320px;
  display: flex;
  align-items: center;
  border: 0.5px solid rgba(255, 255, 255, 0.3);
}

/* 成功消息樣式 */
:deep(.custom-message.el-message--success) {
  background: rgba(255, 255, 255, 0.95);
  border: 0.5px solid rgba(52, 199, 89, 0.2);
}

/* 錯誤消息樣式 */
:deep(.custom-message.el-message--error) {
  background: rgba(255, 255, 255, 0.95);
  border: 0.5px solid rgba(255, 59, 48, 0.2);
}

/* 消息內容文字 */
:deep(.custom-message .el-message__content) {
  color: #1d1d1f;
  font-size: 15px;
  line-height: 1.4;
  font-weight: 500;
}

/* 關閉按鈕 */
:deep(.custom-message .el-message__closeBtn) {
  color: rgba(0, 0, 0, 0.4);
  font-size: 18px;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  transition: all 0.3s ease;
}

:deep(.custom-message .el-message__closeBtn:hover) {
  color: rgba(0, 0, 0, 0.6);
  transform: translateY(-50%) scale(1.1);
}

/* 圖標樣式 */
:deep(.custom-message .el-message__icon) {
  font-size: 20px;
  margin-right: 12px;
}

/* 成功圖標顏色 */
:deep(.custom-message.el-message--success .el-message__icon) {
  color: #34C759;
}

/* 錯誤圖標顏色 */
:deep(.custom-message.el-message--error .el-message__icon) {
  color: #FF3B30;
}

/* 消息動畫 */
:deep(.el-message) {
  top: 24px !important;
  animation: messageSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes messageSlideIn {
  0% {
    opacity: 0;
    transform: translateY(-16px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 用戶選項樣��� */
.user-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 4px;
}

.user-avatar {
  background: linear-gradient(135deg, #0A84FF, #6C47FF);
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 選擇器下拉面板樣式 */
:deep(.el-select-dropdown.el-popper) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.1),
    0 2px 6px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 8px;
}

:deep(.el-select-dropdown__item) {
  border-radius: 8px;
}

:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item:hover) {
  background: rgba(0, 122, 255, 0.1);
}

:deep(.el-select-dropdown__item.selected) {
  background: rgba(0, 122, 255, 0.15);
  color: #0A84FF;
  font-weight: 600;
}
</style>