<template>
  <div class="notes-container">
    <div class="notes-grid">
      <div class="note-add-card" @click="showCreateNoteDialog">
        <div class="add-icon">
          <el-icon><Plus /></el-icon>
        </div>
        <span>新增筆記本</span>
      </div>

      <div 
        v-for="note in notes" 
        :key="note.id" 
        class="note-card"
        @click="handleNoteClick(note)"
        @contextmenu.prevent="handleContextMenu(note)"
      >
        <div class="note-preview">
          <div 
            class="template-preview"
            :style="{ 
              backgroundColor: note.paperColor,
              backgroundImage: `url(${coverStyles[note.coverStyle - 1]?.image})`
            }"
          >
            <img 
              v-if="coverTemplates[note.template - 1]?.pattern"
              :src="coverTemplates[note.template - 1].pattern" 
              class="pattern-overlay"
            >
          </div>
        </div>
        <div class="note-info">
          <h3>{{ note.title }}</h3>
          <p>{{ formatDate(note.updatedAt) }}</p>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="createDialogVisible"
      title="新增筆記本"
      width="800px"
      custom-class="create-note-dialog"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="create-note-form">
        <h3 class="form-title">選擇封面</h3>
        <div class="cover-select">
          <div 
            v-for="cover in coverStyles" 
            :key="cover.id"
            :class="['cover-option', { active: selectedCoverStyle === cover.id }]"
            @click="selectedCoverStyle = cover.id"
          >
            <img :src="cover.image" :alt="cover.name">
            <span class="cover-name">{{ cover.name }}</span>
          </div>
        </div>

        <h3 class="form-title">選擇模板</h3>
        <div class="cover-select">
          <div 
            v-for="cover in coverTemplates" 
            :key="cover.id"
            :class="['cover-option', { active: selectedCover === cover.id }]"
            @click="selectedCover = cover.id"
          >
            <div 
              class="template-preview"
              :style="{ backgroundColor: selectedColor }"
            >
              <img 
                v-if="cover.pattern" 
                :src="cover.pattern" 
                :alt="cover.name"
                class="pattern-overlay"
              >
            </div>
            <span class="cover-name">{{ cover.name }}</span>
          </div>
        </div>

        <h3 class="form-title">選擇紙張顏色</h3>
        <div class="color-select">
          <div class="color-grid">
            <div
              v-for="color in paperColors"
              :key="color.id"
              :class="['color-option', { active: selectedColor === color.value }]"
              :style="{ backgroundColor: color.value }"
              @click="selectedColor = color.value"
            >
              <el-icon v-if="selectedColor === color.value"><Check /></el-icon>
            </div>
          </div>
        </div>

        <h3 class="form-title">筆記本名稱</h3>
        <el-input
          v-model="newNoteTitle"
          placeholder="輸入筆記本名稱"
          maxlength="50"
          class="title-input"
          show-word-limit
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button 
            class="cancel-btn" 
            @click="createDialogVisible = false"
          >
            取消
          </el-button>
          <el-button 
            class="confirm-btn" 
            type="primary" 
            @click="createNote"
          >
            創建
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-if="editStyleVisible"
      v-model="editStyleVisible"
      title="修改筆記本樣式"
      width="800px"
      class="edit-style-dialog"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="create-note-form">
        <h3 class="form-title">選擇封面</h3>
        <div class="cover-select">
          <div 
            v-for="cover in coverStyles" 
            :key="cover.id"
            :class="['cover-option', { active: selectedCoverStyle === cover.id }]"
            @click="selectedCoverStyle = cover.id"
          >
            <img :src="cover.image" :alt="cover.name">
            <span class="cover-name">{{ cover.name }}</span>
          </div>
        </div>

        <h3 class="form-title">選擇模板</h3>
        <div class="cover-select">
          <div 
            v-for="cover in coverTemplates" 
            :key="cover.id"
            :class="['cover-option', { active: selectedCover === cover.id }]"
            @click="selectedCover = cover.id"
          >
            <div 
              class="template-preview"
              :style="{ backgroundColor: selectedColor }"
            >
              <img 
                v-if="cover.pattern" 
                :src="cover.pattern" 
                :alt="cover.name"
                class="pattern-overlay"
              >
            </div>
            <span class="cover-name">{{ cover.name }}</span>
          </div>
        </div>

        <h3 class="form-title">選擇紙張顏色</h3>
        <div class="color-select">
          <div class="color-grid">
            <div
              v-for="color in paperColors"
              :key="color.id"
              :class="['color-option', { active: selectedColor === color.value }]"
              :style="{ backgroundColor: color.value }"
              @click="selectedColor = color.value"
            >
              <el-icon v-if="selectedColor === color.value"><Check /></el-icon>
            </div>
          </div>
        </div>

        <h3 class="form-title">筆記本名稱</h3>
        <el-input
          v-model="newNoteTitle"
          placeholder="輸入筆記本名稱"
          maxlength="50"
          class="title-input"
          show-word-limit
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <div class="left-buttons">
            <el-button 
              class="delete-btn" 
              type="danger" 
              @click="confirmDelete"
            >
              <el-icon><Delete /></el-icon>
              刪除筆記
            </el-button>
          </div>
          <div class="right-buttons">
            <el-button 
              class="cancel-btn" 
              @click="editStyleVisible = false"
            >
              取消
            </el-button>
            <el-button 
              class="confirm-btn" 
              type="primary" 
              @click="saveNoteStyle"
            >
              保存
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Check, Edit, Brush, Delete } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import axios from 'axios'
import { useRouter } from 'vue-router'

// 創建 axios 實例
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000
})

const router = useRouter()
const notes = ref([])
const createDialogVisible = ref(false)
const newNoteTitle = ref('')
const selectedCover = ref(1)
const selectedColor = ref('#FFFFFF')
const selectedCoverStyle = ref(1)
const defaultCover = '/images/default-note-cover.png'
const editStyleVisible = ref(false)
const selectedNote = ref(null)

const coverTemplates = [
  { 
    id: 1, 
    name: '空白', 
    pattern: null
  },
  { 
    id: 2, 
    name: '方格', 
    pattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ibGluZXMiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDIwIEwgMjAwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMCwgMCwgMCwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgZmlsbD0idXJsKCNsaW5lcykiLz48L3N2Zz4='
  },
  { 
    id: 3, 
    name: '橫線', 
    pattern: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ibGluZXMiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDIwIEwgMjAwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMCwgMCwgMCwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgZmlsbD0idXJsKCNsaW5lcykiLz48L3N2Zz4='
  }
]

const paperColors = [
  { id: 1, name: '白色', value: '#FFFFFF' },
  { id: 2, name: '米色', value: '#F5F5DC' },
  { id: 3, name: '淺黃', value: '#FFF8DC' },
  { id: 4, name: '淺藍', value: '#F0F8FF' },
  { id: 5, name: '淺粉', value: '#FFF0F5' },
  { id: 6, name: '淺綠', value: '#F0FFF0' },
  { id: 7, name: '淺灰', value: '#F8F9FA' },
  { id: 8, name: '淺紫', value: '#F8F0FC' }
]

const coverStyles = [
  { 
    id: 1, 
    name: '經典牛皮',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgZmlsbD0iI0Q0QzVBRiIvPjwvc3ZnPg=='
  },
  { 
    id: 2, 
    name: '復牛皮',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic3VlZGUiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0wIDBsOCA4TTggMEwwIDgiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiBmaWxsPSIjODA2MDQzIi8+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyODAiIGZpbGw9InVybCgjc3VlZGUpIi8+PHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iMTYwIiBoZWlnaHQ9IjI0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMykiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik02MCAxNDBoODAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjQpIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSIxMDAiIHk9IjEzMCIgZm9udC1mYW1pbHk9InNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuNCkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5PVEVCT09LPC90ZXh0Pjwvc3ZnPg=='
  },
  { 
    id: 3, 
    name: '布面精裝',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZmFicmljIiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNMCAwbDQgNE00IDBMMCA0IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIwLjUiIGZpbGw9Im5vbmUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiBmaWxsPSIjMkM0ODdBIi8+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyODAiIGZpbGw9InVybCgjZmFicmljKSIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIyNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iZ29sZCIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTTIwIDIwaDQwdjQwaC00MHoiIGZpbGw9ImdvbGQiIG9wYWNpdHk9IjAuMyIvPjx0ZXh0IHg9IjEwMCIgeT0iMTQwIiBmb250LWZhbWlseT0ic2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9ImdvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5PVEVCT09LPC90ZXh0Pjwvc3ZnPg=='
  }
]

// 獲取筆記本列表
const fetchNotes = async () => {
  try {
    const response = await api.get('/api/notes', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    notes.value = response.data.data
  } catch (error) {
    console.error('Fetch notes error:', error)
    ElMessage.error('獲取筆記本列表失敗')
  }
}

const showCreateNoteDialog = () => {
  createDialogVisible.value = true
  newNoteTitle.value = ''
  selectedCover.value = 1
  selectedCoverStyle.value = 1
}

const createNote = async () => {
  if (!newNoteTitle.value.trim()) {
    ElMessage.warning('請輸入筆記本名稱')
    return
  }
  
  try {
    const noteData = {
      title: newNoteTitle.value,
      coverStyle: selectedCoverStyle.value,
      template: selectedCover.value,
      paperColor: selectedColor.value
    }
    
    await api.post('/api/notes', noteData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    createDialogVisible.value = false
    await fetchNotes()  // 重新獲取列表
    ElMessage.success('筆記本創建成功')
  } catch (error) {
    console.error('Create note error:', error)
    ElMessage.error('創建失敗')
  }
}

const openNote = (note) => {
  router.push(`/notes/${note.id}`)
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY/MM/DD HH:mm')
}

// 處理筆記本點擊
const handleNoteClick = (note) => {
  openNote(note)
}

// 編輯筆記
const editNote = () => {
  editStyleVisible.value = false
  openNote(selectedNote.value)
}

// 顯示修改樣式對話框
const showEditStyleDialog = () => {
  editStyleVisible.value = true
}

// 保存筆記樣式
const saveNoteStyle = async () => {
  try {
    await api.put(`/api/notes/${selectedNote.value.id}`, {
      coverStyle: selectedCoverStyle.value,
      template: selectedCover.value,
      paperColor: selectedColor.value
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    editStyleVisible.value = false
    await fetchNotes()  // 重新獲取列表
    ElMessage.success('樣式更新成功')
  } catch (error) {
    console.error('Update style error:', error)
    ElMessage.error('更新失敗')
  }
}

// 確認刪除
const confirmDelete = () => {
  ElMessageBox.confirm(
    '確定要刪除這個筆記本嗎？此操作不可恢復。',
    '警告',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    deleteNote()
  }).catch(() => {})
}

// 刪除筆記本
const deleteNote = async () => {
  try {
    await api.delete(`/api/notes/${selectedNote.value.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    editStyleVisible.value = false
    await fetchNotes()  // 重新獲取列表
    ElMessage.success('刪除成功')
  } catch (error) {
    console.error('Delete note error:', error)
    ElMessage.error('刪除失敗')
  }
}

// 在組件掛載時獲取筆記本列表
onMounted(() => {
  fetchNotes()
})

const handleContextMenu = (note) => {
  selectedNote.value = note
  selectedCoverStyle.value = note.coverStyle
  selectedCover.value = note.template
  selectedColor.value = note.paperColor
  newNoteTitle.value = note.title
  editStyleVisible.value = true
}
</script>

<style scoped>
.notes-container {
  padding: 2rem;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.note-card, .note-add-card {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  aspect-ratio: 3/4;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.note-card:hover, .note-add-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.note-add-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(0, 122, 255, 0.3);
  background: rgba(255, 255, 255, 0.5);
}

.add-icon {
  font-size: 2rem;
  color: #007AFF;
  margin-bottom: 1rem;
}

.note-preview {
  width: 100%;
  height: 70%;
  overflow: hidden;
}

.note-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.note-info {
  padding: 1rem;
}

.note-info h3 {
  margin: 0;
  font-size: 1rem;
  color: #1d1d1f;
}

.note-info p {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: #86868b;
}

.create-note-dialog {
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-dialog__header) {
  padding: 24px 32px;
  margin: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  position: relative;
}

:deep(.el-dialog__title) {
  font-size: 1.4rem;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.5px;
}

:deep(.el-dialog__body) {
  padding: 32px;
  background: rgba(255, 255, 255, 0.3);
}

:deep(.el-dialog__footer) {
  padding: 24px 32px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.form-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #1d1d1f;
  margin: 0 0 1rem;
  letter-spacing: -0.3px;
}

.cover-select {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12px;
  margin-bottom: 2rem;
}

.cover-option {
  aspect-ratio: 3/4;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  min-height: 280px;
  width: 100%;
}

.cover-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.cover-option.active {
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
}

.cover-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: rgba(255, 255, 255, 0.95);
  font-size: 0.9rem;
  text-align: center;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  font-weight: 500;
  letter-spacing: -0.3px;
}

.title-input {
  margin-top: 0.5rem;
}

:deep(.el-input__wrapper) {
  box-shadow: none;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  background: rgba(0, 0, 0, 0.05);
}

:deep(.el-input__wrapper.is-focus) {
  background: #fff;
  box-shadow: 0 0 0 2px #007AFF;
}

.cancel-btn {
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: #1d1d1f;
  padding: 14px 32px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 1rem;
  height: auto;
}

.cancel-btn:hover {
  background: rgba(0, 0, 0, 0.08);
}

.confirm-btn {
  border: none;
  background: #007AFF;
  color: #fff;
  padding: 14px 32px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 1rem;
  height: auto;
}

.confirm-btn:hover {
  background: #0066CC;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

.left-buttons {
  display: flex;
  gap: 1rem;
}

.right-buttons {
  display: flex;
  gap: 1rem;
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #ff3b30;
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 1rem;
  height: auto;
  
  &:hover {
    background: #ff453a;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(255, 59, 48, 0.3);
  }
  
  &:active {
    background: #d70015;
    transform: translateY(0);
    box-shadow: none;
  }

  .el-icon {
    font-size: 16px;
    color: white;
  }
}

.color-select {
  margin-bottom: 2rem;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.color-option {
  aspect-ratio: 1;
  border-radius: 12px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.3);
}

.color-option.active {
  border-color: #007AFF;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 0 0 2px rgba(0, 122, 255, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.3);
}

.color-option :deep(.el-icon) {
  font-size: 1.2rem;
  color: rgba(0, 0, 0, 0.6);
}

/* 調整封面預覽的過渡效果 */
.cover-option img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.template-preview {
  width: 100%;
  height: 100%;
  position: relative;
  transition: background-color 0.3s ease;
  display: block;
}

.pattern-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  display: block;
}

/* 添加棋盤格背景，讓淺色更容易辨識 */
.color-grid::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(45deg, #666 25%, transparent 25%),
    linear-gradient(-45deg, #666 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #666 75%),
    linear-gradient(-45deg, transparent 75%, #666 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  opacity: 0.03;
  border-radius: 12px;
  z-index: 0;
}

.color-grid {
  position: relative;
}

:deep(.el-dialog__close) {
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

:deep(.el-dialog__close:hover) {
  background: rgba(0, 0, 0, 0.05);
  transform: scale(1.05);
}

.edit-style-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
    overflow: hidden;
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.8) !important;
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.5);
    min-width: 800px;
  }

  :deep(.el-dialog__body) {
    padding: 32px;
    background: rgba(255, 255, 255, 0.3);
  }
}

.form-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #1d1d1f;
  margin: 0 0 1rem;
  letter-spacing: -0.3px;
}
</style> 