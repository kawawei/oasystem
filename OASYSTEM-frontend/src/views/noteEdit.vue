<template>
  <div class="note-editor">
    <!-- 頂部工具欄 -->
    <div class="editor-toolbar">
      <div class="left-tools">
        <el-button class="toolbar-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-input
          v-if="isEditingTitle"
          v-model="editingTitle"
          class="title-input"
          @blur="saveTitle"
          @keyup.enter="saveTitle"
          @keyup.esc="cancelEditTitle"
          ref="titleInputRef"
          placeholder="請輸入標題"
        />
        <h2 
          v-else 
          @click="startEditTitle"
          class="note-title"
        >
          {{ note.title }}
        </h2>
      </div>
      <div class="center-tools">
        <el-button 
          class="page-btn" 
          :disabled="currentPage <= 1"
          @click="prevPage"
        >
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div class="page-indicator">
          <span>{{ currentPage }}</span>
          <span class="page-separator">/</span>
          <span>{{ totalPages }}</span>
        </div>
        <el-button 
          class="page-btn"
          @click="nextPage"
        >
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div class="right-tools">
        <el-button 
          class="toolbar-btn" 
          @click="addNewPage"
        >
          <el-icon><Plus /></el-icon>
          新增頁面
        </el-button>
        <el-button 
          class="toolbar-btn save-btn" 
          type="primary" 
          @click="saveNote"
        >
          <el-icon><Check /></el-icon>
          保存
        </el-button>
      </div>
    </div>

    <!-- 編輯區域 -->
    <div 
      class="editor-content"
      :style="{ 
        backgroundColor: note.paperColor,
        backgroundImage: getTemplateBackground(note.template)
      }"
    >
      <el-input
        :model-value="content"
        @update:model-value="handleContentChange"
        type="textarea"
        :rows="20"
        resize="none"
        placeholder="開始寫筆記..."
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, ArrowRight, Plus, Check } from '@element-plus/icons-vue';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const note = ref({});
const content = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const isEditingTitle = ref(false);
const titleInputRef = ref(null);
const hasUnsavedChanges = ref(false);
const originalContent = ref('');
const originalTitle = ref('');
const editingTitle = ref('');

// 獲取筆記內容
const fetchNote = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/api/notes/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.data.success) {
      note.value = response.data.data;
      content.value = note.value.content?.content || '';
      originalContent.value = content.value;
      console.log('Note fetched:', {
        note: note.value,
        content: content.value
      });
    } else {
      throw new Error(response.data.message || '獲取筆記失敗');
    }
  } catch (error) {
    console.error('獲取筆記失敗:', error);
    ElMessage.error(error.response?.data?.message || '獲取筆記失敗，請稍後重試');
  }
};

// 保存筆記
const saveNote = async () => {
  try {
    // 檢查是否有內容需要保存
    if (content.value === undefined) {
      ElMessage.warning('沒有內容需要保存');
      return;
    }

    const response = await axios.put(
      `http://localhost:3000/api/notes/${route.params.id}/content`, 
      {
        content: content.value,
        pageNumber: currentPage.value,
        noteId: route.params.id  // 添加筆記 ID
      }, 
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (response.data.success) {
      hasUnsavedChanges.value = false;
      originalContent.value = content.value;
      ElMessage.success('保存成功');
    } else {
      throw new Error(response.data.message || '保存失敗');
    }
  } catch (error) {
    console.error('保存失敗:', error);
    ElMessage.error(error.response?.data?.message || '保存失敗，請稍後重試');
  }
};

const goBack = async () => {
  if (hasUnsavedChanges.value) {
    try {
      await ElMessageBox.confirm(
        '您有未保存的更改，是否要保存？',
        '提示',
        {
          confirmButtonText: '保存',
          cancelButtonText: '不保存',
          type: 'warning',
          distinguishCancelAndClose: true,
          showClose: true,
          closeOnClickModal: false
        }
      );
      await saveNote();
      router.push('/notes');
    } catch (action) {
      if (action === 'cancel') {
        router.push('/notes');
      }
    }
  } else {
    router.push('/notes');
  }
};

// 切換到上一頁
const prevPage = async () => {
  if (currentPage.value > 1) {
    if (hasUnsavedChanges.value) {
      await saveNote();
    }
    currentPage.value--;
    await loadPageContent(currentPage.value);
  }
};

// 切換到下一頁
const nextPage = async () => {
  if (hasUnsavedChanges.value) {
    await saveNote();
  }
  currentPage.value++;
  if (currentPage.value > totalPages.value) {
    totalPages.value = currentPage.value;
  }
  await loadPageContent(currentPage.value);
};

// 新增頁面
const addNewPage = () => {
  totalPages.value++;
  currentPage.value = totalPages.value;
  // TODO: 建新頁面
};

// 監聽內容變化
const handleContentChange = (newValue) => {
  console.log('Content changed:', {
    newValue,
    originalContent: originalContent.value,
    currentPage: currentPage.value
  });
  content.value = newValue;
  hasUnsavedChanges.value = content.value !== originalContent.value;
};

// 添加載頁面內容的函數
const loadPageContent = async (page) => {
  try {
    console.log('Loading page content:', page);
    const response = await axios.get(
      `http://localhost:3000/api/notes/${route.params.id}/content/${page}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (response.data.success) {
      content.value = response.data.data?.content || '';
      originalContent.value = content.value;
      hasUnsavedChanges.value = false;
      console.log('Page content loaded:', content.value);
    } else {
      throw new Error(response.data.message || '加載頁面失敗');
    }
  } catch (error) {
    console.error('加載頁面失敗:', error);
    ElMessage.error(error.response?.data?.message || '加載頁面失敗，請稍後重試');
  }
};

const getTemplateBackground = (template) => {
  switch (template) {
    case 2: // 方格
      return `url('data:image/svg+xml;base64,${btoa(`
        <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(0, 0, 0, 0.1)" stroke-width="1"/>
          <path d="M 0 32 L 32 32 32 0" fill="none" stroke="rgba(0, 0, 0, 0.1)" stroke-width="1"/>
        </svg>
      `)}')`;
    case 3: // 橫線
      return `url('data:image/svg+xml;base64,${btoa(`
        <svg width="100%" height="32" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="32" x2="100%" y2="32" stroke="rgba(0, 0, 0, 0.1)" stroke-width="1"/>
        </svg>
      `)}')`;
    default: // 空白
      return 'none';
  }
};

// 開始編輯標題
const startEditTitle = () => {
  if (!isEditingTitle.value) {
    originalTitle.value = note.value.title;
    editingTitle.value = note.value.title;
    isEditingTitle.value = true;
    nextTick(() => {
      titleInputRef.value.focus();
    });
  }
};

// 取消編輯標題
const cancelEditTitle = () => {
  editingTitle.value = originalTitle.value;
  isEditingTitle.value = false;
};

// 保存標題
const saveTitle = async () => {
  try {
    if (!editingTitle.value?.trim()) {
      ElMessage.warning('標題不能為空');
      editingTitle.value = originalTitle.value;
      isEditingTitle.value = false;
      return;
    }

    console.log('Saving title:', {
      title: editingTitle.value,
      originalTitle: originalTitle.value
    });

    const response = await axios.put(
      `http://localhost:3000/api/notes/${route.params.id}`,
      {
        title: editingTitle.value.trim()
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (response.data.success) {
      note.value.title = editingTitle.value.trim();
      isEditingTitle.value = false;
      ElMessage.success('標題更新成功');
    } else {
      throw new Error(response.data.message || '更新失敗');
    }
  } catch (error) {
    console.error('Update title error:', error);
    ElMessage.error(error.response?.data?.message || '標題更新失敗');
    editingTitle.value = originalTitle.value;
    isEditingTitle.value = false;
  }
};

onMounted(() => {
  fetchNote();
});
</script>

<style scoped>
.note-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f7;
}

.editor-toolbar {
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.left-tools {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.editor-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background-color: #fff;
  background-repeat: repeat;
  background-position: 0 0;
  background-size: 32px 32px;
}

:deep(.el-textarea__inner) {
  background: transparent !important;
  border: none;
  font-size: 1.1rem;
  line-height: 32px;
  padding: 0;
  height: 100%;
  outline: none;
  box-shadow: none !important;
  position: relative;
  top: -30px;
  left: -16px;
}

:deep(.el-textarea__inner:focus) {
  box-shadow: none;
  outline: none;
}

:deep(.el-textarea__wrapper) {
  box-shadow: none !important;
  padding: 0;
  line-height: 32px;
}

.toolbar-btn {
  height: 40px;
  padding: 0 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: #1d1d1f;
}

.toolbar-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.toolbar-btn:active {
  transform: translateY(0);
}

.save-btn {
  background: #007AFF;
  color: #fff;
}

.save-btn:hover {
  background: #0066CC;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.center-tools {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.7);
  padding: 6px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.page-btn {
  height: 36px;
  width: 36px;
  padding: 0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(0, 0, 0, 0.04);
  color: #1d1d1f;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn:active:not(:disabled) {
  transform: translateY(0);
}

.page-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 36px;
  background: rgba(0, 0, 0, 0.02);
  font-weight: 500;
  color: #1d1d1f;
  font-size: 1rem;
  border-radius: 10px;
  padding: 0 12px;
}

.page-separator {
  margin: 0 6px;
  color: #86868b;
  font-weight: 300;
}

.right-tools {
  display: flex;
  gap: 1rem;
}

.note-title {
  margin: 0;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.note-title:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.title-input {
  width: 300px;
}

:deep(.title-input .el-input__wrapper) {
  box-shadow: none !important;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  padding: 4px 8px;
}

:deep(.title-input .el-input__inner) {
  font-size: 1.5rem;
  font-weight: 600;
  height: 32px;
  padding: 0;
  color: #1d1d1f;
}

:deep(.title-input .el-input__inner::placeholder) {
  color: #86868b;
  font-weight: 500;
}
</style>

<style>
/* 重新設計確認對話框，採用 Apple 風格 */
.el-message-box {
  padding: 0;
  border-radius: 12px;
  border: none;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.05),
    0 20px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  transform: translateY(-5%);
  animation: messageBoxIn 0.3s cubic-bezier(0.33, 1, 0.68, 1) forwards;
}

@keyframes messageBoxIn {
  to {
    transform: translateY(0);
  }
}

.el-message-box__header {
  padding: 18px 20px 14px;
  background: transparent;
  border: none;
  text-align: center;
}

.el-message-box__title {
  font-size: 13px;
  font-weight: 500;
  color: #86868b;
  margin: 0;
  padding: 0;
}

.el-message-box__content {
  padding: 0 20px 20px;
  font-size: 13px;
  color: #1d1d1f;
  line-height: 1.4;
  text-align: center;
}

.el-message-box__btns {
  padding: 0 20px 20px;
  border: none;
  background: transparent;
  display: flex;
  gap: 8px;
  justify-content: center;
}

.el-message-box__btns .el-button {
  flex: 1;
  margin: 0;
  padding: 4px 11px;
  height: 32px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.33, 1, 0.68, 1);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  min-width: 128px;
}

.el-message-box__btns .el-button--default {
  background: rgba(255, 255, 255, 0.8);
  color: #1d1d1f;
  backdrop-filter: blur(10px);
}

.el-message-box__btns .el-button--default:hover {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.el-message-box__btns .el-button--primary {
  background: #0071e3;
  color: #fff;
  box-shadow: none;
}

.el-message-box__btns .el-button--primary:hover {
  background: #0077ed;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 113, 227, 0.3);
}

.el-message-box__btns .el-button:active {
  transform: scale(0.98);
}

.el-message-box__close {
  display: none;
}

.el-message-box__status {
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 20px;
  color: #ff9500;
}

.el-overlay {
  backdrop-filter: blur(5px);
  background: rgba(0, 0, 0, 0.15);
  animation: overlayIn 0.3s ease forwards;
}

@keyframes overlayIn {
  from {
    backdrop-filter: blur(0);
    background: rgba(0, 0, 0, 0);
  }
  to {
    backdrop-filter: blur(5px);
    background: rgba(0, 0, 0, 0.15);
  }
}
</style> 