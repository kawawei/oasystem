<template>
  <div class="note-editor">
    <!-- 頂部工具欄 -->
    <div class="editor-toolbar">
      <div class="left-tools">
        <el-button class="toolbar-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>{{ note.title }}</h2>
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
        backgroundImage: note.template === 2 ? 'url(grid-pattern)' : 
                        note.template === 3 ? 'url(line-pattern)' : 'none'
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, ArrowRight, Plus, Check } from '@element-plus/icons-vue';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const note = ref({});
const content = ref('');
const currentPage = ref(1);
const totalPages = ref(1);

// 獲取筆記內容
const fetchNote = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/api/notes/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    note.value = response.data.data;
    content.value = note.value.content?.content || '';
    console.log('Fetched content:', content.value);
  } catch (error) {
    console.error('Fetch note error:', error);
    ElMessage.error('獲取筆記失敗');
  }
};

// 保存筆記
const saveNote = async () => {
  try {
    console.log('正在保存內容:', {
      content: content.value,
      pageNumber: currentPage.value
    });

    await axios.put(`http://localhost:3000/api/notes/${route.params.id}/content`, {
      content: content.value,
      pageNumber: currentPage.value
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    ElMessage.success('保存成功');
  } catch (error) {
    console.error('保存失敗:', error.response?.data || error);
    ElMessage.error('保存失敗');
  }
};

const goBack = () => {
  router.push('/notes');
};

// 切換到上一頁
const prevPage = async () => {
  if (currentPage.value > 1) {
    // 先保存當前頁面
    await saveNote();
    currentPage.value--;
    await loadPageContent(currentPage.value);
  }
};

// 切換到下一頁
const nextPage = async () => {
  // 先保存當前頁面
  await saveNote();
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
  // TODO: 創建新頁面
};

// 監聽內容變化
const handleContentChange = (newValue) => {
  console.log('Content changed:', newValue);
  content.value = newValue;
};

// 添加加載頁面內容的函數
const loadPageContent = async (page) => {
  try {
    console.log('加載頁面:', page);
    const response = await axios.get(
      `http://localhost:3000/api/notes/${route.params.id}/content/${page}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    content.value = response.data.data?.content || '';
  } catch (error) {
    console.error('加載頁面失敗:', error.response?.data || error);
    ElMessage.error('加載頁面失敗');
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
}

:deep(.el-textarea__inner) {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  line-height: 1.8;
  padding: 0;
  height: 100%;
  outline: none;
  box-shadow: none !important;
}

:deep(.el-textarea__inner:focus) {
  box-shadow: none;
  outline: none;
}

:deep(.el-textarea__wrapper) {
  box-shadow: none !important;
  padding: 0;
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
</style> 