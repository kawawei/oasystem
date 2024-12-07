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
              backgroundImage: note.coverStyle ? `url(${coverStyles[note.coverStyle - 1]?.image})` : null
            }"
          >
            <img 
              v-if="coverTemplates[note.template - 1]?.pattern && !note.coverStyle"
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
            <div 
              class="template-preview"
              :style="{ 
                backgroundImage: `url(${cover.image})`
              }"
            ></div>
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
            <div 
              class="template-preview"
              :style="{ 
                backgroundImage: `url(${cover.image})`
              }"
            ></div>
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
import api from '@/utils/api'

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
    pattern: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="200" height="280" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 0, 0, 0.1)" stroke-width="1"/>
            <path d="M 0 20 L 20 20 20 0" fill="none" stroke="rgba(0, 0, 0, 0.1)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="200" height="280" fill="url(#grid)"/>
      </svg>
    `)
  },
  { 
    id: 3, 
    name: '橫線', 
    pattern: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="200" height="280" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="lines" width="200" height="20" patternUnits="userSpaceOnUse">
            <path d="M 0 19 L 200 19" fill="none" stroke="rgba(0, 0, 0, 0.1)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="200" height="280" fill="url(#lines)"/>
      </svg>
    `)
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
    image: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="200" height="280" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="leather" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M1 1h1v1h-1z" fill="rgba(0,0,0,0.1)"/>
          </pattern>
        </defs>
        <rect width="200" height="280" fill="#D4C5AF"/>
        <rect width="200" height="280" fill="url(#leather)"/>
        <rect x="15" y="15" width="170" height="250" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>
      </svg>
    `)
  },
  { 
    id: 2, 
    name: '復古牛皮',
    image: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="200" height="280" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="suede" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M0 0l8 8M8 0L0 8" stroke="rgba(255,255,255,0.1)" stroke-width="1" fill="none"/>
          </pattern>
        </defs>
        <rect width="200" height="280" fill="#806043"/>
        <rect width="200" height="280" fill="url(#suede)"/>
        <rect x="20" y="20" width="160" height="240" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
        <path d="M60 140h80" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <text x="100" y="130" font-family="serif" font-size="16" fill="rgba(255,255,255,0.4)" text-anchor="middle">NOTEBOOK</text>
      </svg>
    `)
  },
  { 
    id: 3, 
    name: '布面精裝',
    image: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="200" height="280" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="fabric" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M0 0l4 4M4 0L0 4" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" fill="none"/>
          </pattern>
        </defs>
        <rect width="200" height="280" fill="#2C487A"/>
        <rect width="200" height="280" fill="url(#fabric)"/>
        <rect x="10" y="10" width="180" height="260" fill="none" stroke="gold" stroke-width="1"/>
        <path d="M20 20h40v40h-40z" fill="gold" opacity="0.3"/>
        <text x="100" y="140" font-family="serif" font-size="16" fill="gold" text-anchor="middle">NOTEBOOK</text>
      </svg>
    `)
  }
]

// 獲取筆記本列表
const fetchNotes = async () => {
  try {
    const response = await api.get('/api/notes');
    notes.value = response.data.data;
  } catch (error) {
    console.error('Fetch notes error:', error);
    ElMessage.error('獲取筆記本列表失敗');
  }
}

const showCreateNoteDialog = () => {
  createDialogVisible.value = true
  newNoteTitle.value = ''
  selectedCover.value = 1
  selectedCoverStyle.value = 1
}

const createNote = async () => {
  try {
    if (!newNoteTitle.value?.trim()) {
      ElMessage.warning('請輸入筆記本名稱');
      return;
    }

    const noteData = {
      title: newNoteTitle.value.trim(),
      coverStyle: selectedCoverStyle.value,
      template: selectedCover.value,
      paperColor: selectedColor.value
    };

    console.log('Creating note:', noteData);

    const response = await api.post('/api/notes', noteData);

    if (response.data.success) {
      createDialogVisible.value = false;
      ElMessage.success('創建成功');
      await fetchNotes(); // 重新獲取筆記列表
    } else {
      throw new Error(response.data.message || '創建失敗');
    }
  } catch (error) {
    console.error('Create note error:', error);
    ElMessage.error(error.response?.data?.message || '創建失敗，請稍後重試');
  }
};

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
    // 檢查標題是否為空
    if (newNoteTitle.value?.trim()) {
      console.log('Saving note style and title:', {
        title: newNoteTitle.value,
        coverStyle: selectedCoverStyle.value,
        template: selectedCover.value,
        paperColor: selectedColor.value
      });

      const response = await api.put(
        `/api/notes/${selectedNote.value.id}`,
        {
          title: newNoteTitle.value.trim(),
          coverStyle: selectedCoverStyle.value,
          template: selectedCover.value,
          paperColor: selectedColor.value
        }
      );

      if (response.data.success) {
        editStyleVisible.value = false;
        await fetchNotes(); // 重新獲取列表
        ElMessage.success('更新成功');
      } else {
        throw new Error(response.data.message || '更新失敗');
      }
    } else {
      ElMessage.warning('筆記本名稱不能為空');
    }
  } catch (error) {
    console.error('Update style error:', error);
    ElMessage.error(error.response?.data?.message || '更新失敗，請稍後重試');
  }
};

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
    await api.delete(`/api/notes/${selectedNote.value.id}`);
    
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
  selectedNote.value = note;
  selectedCoverStyle.value = note.coverStyle;
  selectedCover.value = note.template;
  selectedColor.value = note.paperColor;
  newNoteTitle.value = note.title;
  editStyleVisible.value = true;

  // 添加日誌
  console.log('Opening edit dialog:', {
    note,
    selectedCoverStyle: selectedCoverStyle.value,
    selectedCover: selectedCover.value,
    selectedColor: selectedColor.value,
    newNoteTitle: newNoteTitle.value
  });
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
}

.cover-option .template-preview {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: all 0.3s ease;
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
  transition: all 0.3s ease;
  display: block;
  background-size: cover;
  background-position: center;
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
  transition: opacity 0.3s ease;
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