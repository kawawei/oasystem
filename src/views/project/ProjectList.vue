<template>
  <div class="project-list-container">
    <!-- 頂部操作欄 -->
    <div class="top-bar">
      <h1>專案管理</h1>
      <button class="add-project-btn" @click="showAddProjectModal = true">
        <i class="fas fa-plus"></i>
        新增專案
      </button>
    </div>

    <!-- 專案列表 -->
    <div class="project-grid">
      <div v-for="project in projects" :key="project.id" class="project-card">
        <div class="project-header">
          <h3>{{ project.title }}</h3>
          <span class="project-status" :class="project.status">
            {{ getStatusText(project.status) }}
          </span>
        </div>
        <p class="project-description">{{ project.description }}</p>
        <div class="project-progress">
          <div class="progress-bar">
            <div class="progress" :style="{ width: project.progress + '%' }"></div>
          </div>
          <span class="progress-text">{{ project.progress }}%</span>
        </div>
        <div class="project-footer">
          <div class="project-dates">
            <span>開始: {{ formatDate(project.startDate) }}</span>
            <span>結束: {{ formatDate(project.endDate) }}</span>
          </div>
          <div class="project-actions">
            <button @click="viewProject(project)" title="查看">
              <i class="fas fa-eye"></i>
            </button>
            <button @click="editProject(project)" title="編輯">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteProject(project.id)" title="刪除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/編輯專案彈窗 -->
    <div v-if="showAddProjectModal" class="modal">
      <div class="modal-content">
        <h2>{{ isEditing ? '編輯專案' : '新增專案' }}</h2>
        <form @submit.prevent="submitProject">
          <div class="form-group">
            <label>標題</label>
            <input 
              v-model="projectForm.title" 
              required 
              type="text"
              @input="e => projectForm.title = e.target.value"
            />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea 
              v-model="projectForm.description" 
              rows="3"
              @input="e => projectForm.description = e.target.value"
            ></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>開始日期</label>
              <input 
                type="date" 
                v-model="projectForm.startDate"
                @input="e => projectForm.startDate = e.target.value"
              />
            </div>
            <div class="form-group">
              <label>結束日期</label>
              <input 
                type="date" 
                v-model="projectForm.endDate"
                @input="e => projectForm.endDate = e.target.value"
              />
            </div>
          </div>
          <div class="form-group">
            <label>狀態</label>
            <select v-model="projectForm.status">
              <option value="planning">規劃中</option>
              <option value="in_progress">進行中</option>
              <option value="completed">已完成</option>
            </select>
          </div>
          <div class="form-group">
            <label>專案階段</label>
            <div class="phase-timeline">
              <div class="phase-steps">
                <div v-for="(phase, index) in projectForm.phases" 
                     :key="index" 
                     class="phase-step"
                     :class="{ active: selectedPhase === index }">
                  <div class="phase-number" @click="selectPhase(index)">{{ index + 1 }}</div>
                </div>
                <button type="button" @click="addPhase" class="add-phase-step">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
            
            <!-- 階段詳情表單 -->
            <div v-if="selectedPhase !== null" class="phase-details">
              <h3>第 {{ selectedPhase + 1 }} 階段</h3>
              <div class="phase-form-row">
                <div class="form-group">
                  <label>階段名稱</label>
                  <input v-model="projectForm.phases[selectedPhase].title" required />
                </div>
                <div class="form-group">
                  <label>負責人</label>
                  <select v-model="projectForm.phases[selectedPhase].assignedTo">
                    <option value="">選擇負責人</option>
                    <option v-for="user in users" 
                            :key="user.id" 
                            :value="user.id">
                      {{ user.username }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>描述</label>
                <textarea v-model="projectForm.phases[selectedPhase].description" rows="3"></textarea>
              </div>
              <div class="phase-form-row">
                <div class="form-group">
                  <label>完成日期</label>
                  <input type="date" v-model="projectForm.phases[selectedPhase].dueDate" />
                </div>
              </div>
              <div class="phase-actions">
                <button type="button" @click="removePhase(selectedPhase)" class="remove-phase-btn">
                  <i class="fas fa-trash"></i> 刪除此階段
                </button>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddProjectModal = false">取消</button>
            <button type="submit">確定</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import api from '@/services/api'

export default {
  name: 'ProjectList',
  setup() {
    const projects = ref([])
    const users = ref([])
    const showAddProjectModal = ref(false)
    const isEditing = ref(false)
    const selectedPhase = ref(null)
    const projectForm = ref({
      title: '',
      description: '',
      status: 'planning',
      startDate: '',
      endDate: '',
      phases: []
    })

    // 監聽表單變化
    watch(projectForm, (newVal) => {
      console.log('Form updated:', newVal)
    }, { deep: true })

    // 獲取專案列表
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects')
        console.log('Projects response:', response)
        projects.value = response
      } catch (error) {
        console.error('Error fetching projects:', error)
      }
    }

    // 獲取用戶列表
    const fetchUsers = async () => {
      try {
        const response = await api.get('/projects/users')
        console.log('Users response:', response)
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

    // 查看專案詳情
    const viewProject = (project) => {
      router.push({
        name: '專案詳情',
        params: { id: project.id }
      })
    }

    // 編輯專案
    const editProject = (project) => {
      isEditing.value = true
      projectForm.value = { ...project }
      showAddProjectModal.value = true
    }

    // 刪除專案
    const deleteProject = async (projectId) => {
      if (!confirm('確定要刪除此專案嗎？')) return
      try {
        await api.delete(`/projects/${projectId}`)
        await fetchProjects()
      } catch (error) {
        console.error('Error deleting project:', error)
      }
    }

    // 提交專案
    const submitProject = async () => {
      try {
        // 驗證表單
        if (!projectForm.value.title) {
          alert('請輸入專案標題')
          return
        }

        if (isEditing.value) {
          await api.put(`/projects/${projectForm.value.id}`, projectForm.value)
        } else {
          await api.post('/projects', projectForm.value)
        }
        showAddProjectModal.value = false
        projectForm.value = {
          title: '',
          description: '',
          status: 'planning',
          startDate: '',
          endDate: '',
          phases: []
        }
        isEditing.value = false
        await fetchProjects()
      } catch (error) {
        console.error('Error submitting project:', error)
        alert(error.response?.data?.message || '創建專案失敗')
      }
    }

    // 選擇階段
    const selectPhase = (index) => {
      selectedPhase.value = index
      // 更新進度條
      const progress = (index + 1) / projectForm.value.phases.length
      document.querySelector('.phase-steps').style.setProperty('--phase-progress', progress)
    }

    // 添加階段
    const addPhase = () => {
      projectForm.value.phases.push({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        order: projectForm.value.phases.length,
        progress: 0
      })
      selectPhase(projectForm.value.phases.length - 1)
    }

    // 移除階段
    const removePhase = (index) => {
      projectForm.value.phases.splice(index, 1)
      // 重新排序
      projectForm.value.phases.forEach((phase, idx) => {
        phase.order = idx
      })
      selectedPhase.value = null
    }

    onMounted(() => {
      fetchProjects()
      fetchUsers()
    })

    return {
      projects,
      users,
      showAddProjectModal,
      isEditing,
      projectForm,
      formatDate,
      getStatusText,
      viewProject,
      editProject,
      deleteProject,
      submitProject,
      selectedPhase,
      selectPhase,
      addPhase,
      removePhase
    }
  }
}
</script> 

<style scoped>
.project-list-container {
  padding: 2rem;
}

/* 頂部操作欄 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.top-bar h1 {
  color: var(--text-color);
}

.add-project-btn {
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

.add-project-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* 專案網格 */
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px var(--shadow-color);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.project-header h3 {
  color: var(--text-color);
  margin: 0;
}

.project-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  color: var(--status-text);
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

.project-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

/* 進度條 */
.project-progress {
  margin-bottom: 1.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress {
  height: 100%;
  background: var(--button-bg);
  transition: width 0.3s ease;
}

.progress-text {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* 專案底部 */
.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.project-dates {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.project-actions {
  display: flex;
  gap: 0.5rem;
}

.project-actions button {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.project-actions button:hover {
  color: var(--text-color);
  background: var(--hover-bg);
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
  overflow-y: auto;
  padding: 2rem;
}

.modal-content {
  background: var(--modal-bg);
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 4px 20px var(--shadow-color);
  margin: auto;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  color: var(--heading-color);
  margin-bottom: 1.5rem;
}

/* 表單樣式 */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--label-color);
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-color);
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: var(--button-bg);
  box-shadow: 0 0 0 2px rgba(0, 113, 227, 0.2);
  outline: none;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* 階段列表樣式 */
.phase-list {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  background: var(--box-bg);
}

.phase-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.phase-item input {
  flex: 1;
}

.remove-phase-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-phase-btn:hover {
  color: #f44336;
  background: var(--hover-bg);
}

.add-phase-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  width: 100%;
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-phase-btn:hover {
  color: var(--button-bg);
  border-color: var(--button-bg);
  background: var(--hover-bg);
}

/* 按鈕樣式 */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.modal-actions button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-actions button[type="button"] {
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-color);
}

.modal-actions button[type="submit"] {
  border: none;
  background: var(--button-bg);
  color: white;
}

.modal-actions button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--shadow-color);
}

/* 階段時間軸樣式 */
.phase-timeline {
  margin: 1rem 0;
  padding: 1rem 0;
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.phase-steps::before {
  content: '';
  position: absolute;
  left: 20%;
  right: 20%;
  top: 50%;
  height: 3px;
  background: var(--border-color);
  transform: translateY(-50%);
  z-index: 0;
}

.phase-steps {
  display: flex;
  align-items: center;
  position: relative;
  padding: 0 2rem;
  min-height: 50px;
  justify-content: center;
  gap: 4rem;
}

.phase-step {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.phase-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--box-bg);
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1;
  position: relative;
  box-shadow: 0 2px 4px var(--shadow-color);
}

.phase-step.active .phase-number {
  background: var(--button-bg);
  border-color: var(--button-bg);
  color: white;
  transform: scale(1.1);
}

.phase-progress-line {
  flex: 1;
  height: 2px;
  background: var(--border-color);
  margin: 0 0.5rem;
}

.phase-step:last-child .phase-progress-line {
  display: none;
}

.add-phase-step {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--box-bg);
  border: 2px dashed var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1;
  position: relative;
  margin-left: 2rem;
}

.add-phase-step:hover {
  border-color: var(--button-bg);
  color: var(--button-bg);
}

/* 修改連接線的位置 */
.phase-steps::before {
  left: 18px;  /* 第一個圓的中心點 */
  right: 18px; /* 最後一個圓的中心點 */
}

/* 階段詳情樣式 */
.phase-details {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--box-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px var(--shadow-color);
}

.phase-details h3 {
  color: var(--heading-color);
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.phase-actions {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
}

.phase-actions .remove-phase-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: transparent;
  color: #f44336;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.phase-actions .remove-phase-btn:hover {
  background: #ffebee;
  border-color: #f44336;
}

/* 表單行布局 */
.phase-form-row {
  display: grid;
  grid-template-columns: 2fr 1fr;  /* 標題欄位寬一點 */
  gap: 1rem;
  margin-bottom: 1rem;
}

.phase-form-row .form-group {
  margin-bottom: 0;
}

.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-color);
  transition: all 0.3s ease;
  appearance: none;  /* 移除原生樣式 */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8.825L1.175 4 2.238 2.938 6 6.7l3.763-3.763L10.825 4z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem;
}

/* 下拉選單選項樣式 */
.form-group select option {
  background: var(--modal-bg);
  color: var(--text-color);
  padding: 0.5rem;
}

/* Firefox 特定樣式 */
@-moz-document url-prefix() {
  .form-group select {
    color: var(--text-color);
    background-color: var(--input-bg);
  }
  .form-group select option {
    background-color: var(--modal-bg);
  }
}

/* Webkit (Chrome/Safari) 特定樣式 */
.form-group select::-webkit-scrollbar {
  width: 8px;
}

.form-group select::-webkit-scrollbar-track {
  background: var(--border-color);
  border-radius: 4px;
}

.form-group select::-webkit-scrollbar-thumb {
  background: var(--text-secondary);
  border-radius: 4px;
}
</style> 