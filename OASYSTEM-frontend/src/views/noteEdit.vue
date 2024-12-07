<template>
  <div class="note-editor">
    <!-- 頂部工具欄 - 第一行 -->
    <div class="editor-toolbar primary-toolbar">
      <div class="left-tools">
        <el-button class="toolbar-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2 
          v-if="!isEditingTitle" 
          @click="startEditTitle"
          class="note-title"
        >
          {{ note.title }}
        </h2>
        <el-input
          v-else
          v-model="editingTitle"
          class="title-input"
          @blur="saveTitle"
          @keyup.enter="saveTitle"
          @keyup.esc="cancelEditTitle"
          ref="titleInputRef"
          placeholder="請輸入標題"
        />
      </div>

      <div class="center-tools">
        <div class="page-navigation">
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

    <!-- 頂部工具欄 - 第二行 -->
    <div class="editor-toolbar secondary-toolbar">
      <div class="format-tools">
        <!-- 文字顏色工具 -->
        <div class="text-color-tool">
          <div class="color-picker-wrapper" ref="colorPickerRef">
            <div 
              class="text-color-btn"
              @mousedown.prevent="handleColorPickerShow"
            >
              <span class="text-color-preview" :style="{ color: textColor }">A</span>
              <el-icon class="text-color-arrow"><ArrowDown /></el-icon>
            </div>
            
            <div 
              v-show="showColorPicker" 
              class="color-picker-panel"
            >
              <div class="preset-colors">
                <div 
                  v-for="color in presetColors" 
                  :key="color"
                  class="color-item"
                  :style="{ backgroundColor: color }"
                  @mousedown.prevent="applyTextColor(color)"
                />
              </div>
              
              <div class="color-divider">
                <span>自訂顏色</span>
              </div>

              <el-color-picker
                v-model="textColor"
                @change="applyTextColor"
                show-alpha
                class="custom-color-picker"
                @mousedown.stop
              />
            </div>
          </div>
        </div>

        <!-- 字體大小選擇器 -->
        <div class="font-size-tool">
          <div class="font-size-wrapper" ref="fontSizeRef">
            <div 
              class="font-size-btn"
              @mousedown.prevent="handleFontSizeShow"
            >
              <span class="font-size-preview">{{ fontSize }}px</span>
              <el-icon class="font-size-arrow"><ArrowDown /></el-icon>
            </div>
            
            <div 
              v-show="showFontSize" 
              class="font-size-panel"
            >
              <div 
                v-for="size in fontSizes" 
                :key="size"
                class="size-item"
                :class="{ active: fontSize === size }"
                @mousedown.prevent="applyFontSize(size)"
              >
                {{ size }}px
              </div>
            </div>
          </div>
        </div>
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
      <div
        ref="editorRef"
        class="rich-editor"
        contenteditable="true"
        @input="handleContentInput"
        @paste="handlePaste"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, ArrowRight, Plus, Check, ArrowDown } from '@element-plus/icons-vue';
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
const fontFamily = ref('Microsoft JhengHei');
const fontSize = ref('16');
const textColor = ref('#000000');
const isBold = ref(false);
const isItalic = ref(false);
const isUnderline = ref(false);

const fontSizes = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 48, 56, 64, 72
];
const highlightColors = ['#FFD700', '#90EE90', '#87CEFA', '#FFA07A', '#DDA0DD'];
const predefineColors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#808080', '#800000'
];

const editorRef = ref(null);

// 添加一個變量來保存選中範圍
const savedRange = ref(null);

// 添加一個變量來追踪當前使用的顏色
const currentTextColor = ref('#000000');

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
      setEditorContent(content.value);
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
    // 檢查是否內容需要保存
    if (content.value === undefined) {
      ElMessage.warning('沒有容需保存');
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
    console.error('保存:', error);
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
  // 檢查是否超出總頁數
  if (currentPage.value >= totalPages.value) {
    ElMessage.warning('已經是最後頁了，請使用新增頁面按鈕');
    return;
  }

  // 有未保存的更改，先保存
  if (hasUnsavedChanges.value) {
    await saveNote();
  }

  // 切換到下一頁
  currentPage.value++;
  await loadPageContent(currentPage.value);
};

// 新增頁面
const addNewPage = async () => {
  // 如果當前頁面有未保存的更改，先保存
  if (hasUnsavedChanges.value) {
    await saveNote();
  }

  // 增加總頁數並切換到新頁面
  totalPages.value++;
  currentPage.value = totalPages.value;
  content.value = ''; // 清空內容
  originalContent.value = ''; // 重置原始內容
  hasUnsavedChanges.value = false;

  // 提示用戶
  ElMessage.success(`已新增第 ${currentPage.value} 頁`);
};

// 監聽內容變化
const handleContentChange = (event) => {
  // 保存 HTML 內容而不是文本
  content.value = event.target.innerHTML;
  hasUnsavedChanges.value = content.value !== originalContent.value;
};

// 處理貼事件,只保留純文本
const handlePaste = (e) => {
  e.preventDefault();
  const text = e.clipboardData.getData('text/plain');
  document.execCommand('insertText', false, text);
};

// 添加載頁面內容的函數
const loadPageContent = async (page) => {
  try {
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
      setEditorContent(content.value);
      hasUnsavedChanges.value = false;
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
    case 2: // 格
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
    default: // 白
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
      throw new Error(response.data.message || '更新敗');
    }
  } catch (error) {
    console.error('Update title error:', error);
    ElMessage.error(error.response?.data?.message || '標題更新失敗');
    editingTitle.value = originalTitle.value;
    isEditingTitle.value = false;
  }
};

// 式化��
const toggleFormat = (type) => {
  switch (type) {
    case 'bold':
      isBold.value = !isBold.value;
      document.execCommand('bold', false, null);
      break;
    case 'italic':
      isItalic.value = !isItalic.value;
      document.execCommand('italic', false, null);
      break;
    case 'underline':
      isUnderline.value = !isUnderline.value;
      document.execCommand('underline', false, null);
      break;
  }
};

const applyHighlight = (color) => {
  document.execCommand('backColor', false, color);
};

// 監聽字體和顏色變化
watch(fontFamily, (newValue) => {
  document.execCommand('fontName', false, newValue);
});

// 修改字體大小選擇器的點擊處理
const handleFontSizeShow = (e) => {
  e.preventDefault();
  // 保存當前選取範圍
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    savedRange.value = selection.getRangeAt(0).cloneRange();
  }
  showFontSize.value = !showFontSize.value;
};

const applyFontSize = (size) => {
  fontSize.value = size;
  
  if (savedRange.value) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange.value);
    
    try {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText) {
        // 獲取選中的所有文本節點
        const nodes = [];
        const walker = document.createTreeWalker(
          range.commonAncestorContainer,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              return range.intersectsNode(node) ? 
                NodeFilter.FILTER_ACCEPT : 
                NodeFilter.FILTER_REJECT;
            }
          }
        );
        
        let node;
        while (node = walker.nextNode()) {
          nodes.push(node);
        }
        
        // 處理每個文本節點
        nodes.forEach(textNode => {
          const parent = textNode.parentElement;
          if (parent.tagName === 'SPAN') {
            // 如果已經在 span 中，直接修改大小
            parent.style.fontSize = `${size}px`;
          } else {
            // 如果不在 span 中，創建新的 span
            const span = document.createElement('span');
            span.style.fontSize = `${size}px`;
            textNode.parentNode.replaceChild(span, textNode);
            span.appendChild(textNode);
          }
        });
        
        // 更新選區
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } catch (error) {
      console.error('Error applying font size:', error);
      ElMessage.error('無法應用字體大小，請重新選擇文字');
    }
    
    savedRange.value = null;
  }
  
  showFontSize.value = false;
};

// 修改顏色選擇器的點擊處理
const handleColorPickerShow = (e) => {
  e.preventDefault();
  showColorPicker.value = !showColorPicker.value;
};

// 修改 watch fontSize
watch(fontSize, (newValue) => {
  // 不需要在這裡處理字體大小的改變
  // 因為已經在 applyFontSize 中處理了
});

watch(textColor, (newValue) => {
  document.execCommand('foreColor', false, newValue);
});

// 定義 handleClickOutside 函數
const handleClickOutside = (e) => {
  if (colorPickerRef.value && !colorPickerRef.value.contains(e.target)) {
    showColorPicker.value = false;
  }
  if (fontSizeRef.value && !fontSizeRef.value.contains(e.target)) {
    showFontSize.value = false;
  }
};

// 修改 onMounted
onMounted(async () => {
  try {
    const response = await axios.get(
      `http://localhost:3000/api/notes/${route.params.id}/pages/count`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (response.data.success) {
      totalPages.value = response.data.data;
    }
  } catch (error) {
    console.error('Get pages count error:', error);
  }

  await fetchNote();

  // 添加點擊外部關閉顏色選擇器的事件監聽
  document.addEventListener('mousedown', handleClickOutside);
  
  // 添加編輯器的 focus 事件監聽
  if (editorRef.value) {
    editorRef.value.addEventListener('focus', handleEditorFocus);
  }
});

// 修改 onUnmounted
onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  
  if (editorRef.value) {
    editorRef.value.removeEventListener('focus', handleEditorFocus);
  }
});

// 修改應用顏色的方法
const applyTextColor = (color) => {
  textColor.value = color;
  currentTextColor.value = color;
  
  if (!editorRef.value) return;
  
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    try {
      document.execCommand('foreColor', false, color);
    } catch (error) {
      console.error('Error applying color:', error);
      ElMessage.error('無法應用顏色，請重新選擇文字');
    }
  }
  
  showColorPicker.value = false;
};

// 修改 handleContentInput 函數
const handleContentInput = (event) => {
  handleContentChange(event);
  
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const container = range.startContainer;
    
    // 只處理文本節點
    if (container.nodeType === 3) {
      try {
        // 檢查是否是新輸入��文字
        const offset = range.startOffset;
        const newChar = container.textContent[offset - 1];
        
        if (newChar) {
          // 將文本節點分割成三部分：之前的文本、新字符、之後的文本
          const beforeText = container.textContent.slice(0, offset - 1);
          const afterText = container.textContent.slice(offset);
          
          // 創建新的 span 元素，使用當前字體大小
          const span = document.createElement('span');
          span.style.fontSize = `${fontSize.value}px`;
          span.textContent = newChar;
          
          // 保留原有的顏色
          if (textColor.value) {
            span.style.color = textColor.value;
          }
          
          // 更新原始文本節點的內容
          container.textContent = beforeText;
          
          // 創建後面的文本節點
          const afterNode = document.createTextNode(afterText);
          
          // 插入新的 span 和後面的文本
          const parent = container.parentNode;
          if (container.nextSibling) {
            parent.insertBefore(span, container.nextSibling);
            parent.insertBefore(afterNode, span.nextSibling);
          } else {
            parent.appendChild(span);
            parent.appendChild(afterNode);
          }
          
          // 將光標移動到正確的位置
          const newRange = document.createRange();
          newRange.setStartAfter(span);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } catch (error) {
        console.error('Error applying styles to new content:', error);
      }
    }
  }
};

// 添加編輯器的 focus 事件處理
const handleEditorFocus = () => {
  // 只保留顏色相關的設置
  if (textColor.value) {
    document.execCommand('foreColor', false, textColor.value);
  }
};

// 主題顏色
const themeColors = [
  '#000000', '#FFFFFF', '#E7E6E6', '#44546A', '#4472C4', 
  '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#70AD47'
];

// 標準顏色
const standardColors = [
  '#C00000', '#FF0000', '#FFC000', '#FFE699', '#92D050',
  '#00B050', '#00B0F0', '#0070C0', '#002060', '#7030A0'
];

// 添加控制顏色選擇器顯示的狀態
const showColorPicker = ref(false);

// 預設顏色
const presetColors = [
  '#000000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00',
  '#FFFFFF', '#0000FF', '#4B0082', '#9400D3', '#FF1493'
];

const colorPickerRef = ref(null);

// 修改 fetchNote 和 loadPageContent 中的容設置
const setEditorContent = (htmlContent) => {
  if (editorRef.value) {
    editorRef.value.innerHTML = htmlContent;
  }
};

// 添加一個輔助函數來轉換字體大小值
const getSizeValue = (px) => {
  // HTML 的 fontSize 命令使用 1-7 值
  // 這裡將 px 值映射相應的範圍
  const sizes = {
    12: 1,
    14: 2,
    16: 3,
    18: 4,
    20: 5,
    24: 6,
    28: 7
  };
  return sizes[px] || 3; // 默認返回 3 (16px)
};

// 添加新的響應式量
const showFontSize = ref(false);
const fontSizeRef = ref(null);

// 添加編輯器的 mouseup 事件處理
const handleEditorMouseUp = () => {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    savedRange.value = selection.getRangeAt(0).cloneRange();
  }
};
</script>

<style scoped>
.note-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f7;
}

.editor-toolbar {
  padding: 0.5rem 2rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1000;
}

.primary-toolbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  height: 56px;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: auto 1fr auto;  /* 修改為自動寬度 */
  align-items: center;
  gap: 1rem;
}

.secondary-toolbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  height: 48px;
  padding-top: 4px;
  padding-bottom: 4px;
  padding-left: 2rem;  /* 將內邊距移到這裡 */
}

.format-tools {
  display: flex;
  align-items: center;
  gap: 12px;  /* 調整間距 */
}

.left-tools {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;  /* 允許內容收縮 */
}

.editor-content {
  flex: 1;
  padding: 2rem;
  padding-top: 1rem;
  padding-left: 2rem;
  overflow-y: auto;
  background-color: #fff;
  background-repeat: repeat;
  background-position: 0 0;
  background-size: 32px 32px;
  position: relative;
  z-index: 1;
}

:deep(.el-textarea__inner),
:deep(.el-textarea__wrapper) {
  display: none;
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
  display: flex;
  justify-content: center;
  align-items: center;
}

.note-title {
  margin: 0;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
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

.page-navigation {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.03);
  padding: 2px;
  border-radius: 8px;
  margin: 0 auto;  /* 確保在中間 */
}

.page-indicator {
  min-width: 70px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  padding: 0 8px;
}

.page-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: #1d1d1f;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.06);
}

.page-separator {
  margin: 0 4px;
  color: #86868b;
}

.right-tools {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.color-tools {
  display: flex;
  align-items: center;
  gap: 4px;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.color-picker {
  margin-left: 15px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.color-picker:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 自定義色選擇器面板 */
:deep(.el-color-picker__panel) {
  border: none;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
}

/* 修改顏色選擇按鈕鈕大小 */
:deep(.el-color-picker__trigger) {
  width: 40px;
  height: 40px;
  padding: 4px;
  border: none;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
}

:deep(.el-color-picker__trigger:hover) {
  background: rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.02);
}

/* 修改顏色面板內部樣式 */
:deep(.el-color-picker__color) {
  border: none;
  border-radius: 6px;
}

:deep(.el-color-picker__empty) {
  color: #999;
  font-size: 14px;
}

:deep(.el-color-dropdown__link-btn) {
  color: #007AFF;
  border: none;
  font-weight: 500;
}

:deep(.el-color-dropdown__btns) {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 12px;
}

/* 顏色選擇按鈕式 */
.text-color-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 6px;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s ease;
}

.text-color-btn:hover {
  background: #eaeaea;
}

.text-color-preview {
  font-size: 20px;
  font-weight: bold;
  color: v-bind(textColor);
}

.text-color-arrow {
  font-size: 12px;
  color: #666;
}

/* Popover 內容樣式 */
:deep(.el-popover.el-popper) {
  padding: 12px;
  border-radius: 8px;
  border: none;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.98);
}

.color-picker-content {
  padding: 8px;
}

.preset-colors {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.color-item {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.color-item:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.color-divider {
  text-align: center;
  margin: 12px 0;
  position: relative;
}

.color-divider::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
}

.color-divider span {
  background: white;
  padding: 0 12px;
  color: #666;
  font-size: 14px;
  position: relative;
}

.custom-color-picker {
  width: 100%;
  margin-top: 12px;
}

/* 修改自訂顏色選擇器樣式 */
:deep(.el-color-picker) {
  width: 100%;
}

:deep(.el-color-picker__trigger) {
  width: 100%;
  height: 36px;
  padding: 4px;
  border: none;
  border-radius: 6px;
  background: #f5f5f5;
  transition: all 0.2s ease;
}

:deep(.el-color-picker__trigger:hover) {
  background: #eaeaea;
}

:deep(.el-color-picker__color) {
  border: none;
  border-radius: 4px;
  width: 100%;
  height: 100%;
}

/* 隱藏自訂顏色選擇器的箭頭圖標 */
:deep(.el-color-picker__icon) {
  display: none !important;
}

/* 修改顏色面板樣式 */
:deep(.el-color-picker__panel) {
  border: none;
  border-radius: 12px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
}

:deep(.el-color-dropdown__btns) {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding: 8px;
  text-align: center;
}

:deep(.el-color-dropdown__btn) {
  border: none;
  background: #f5f5f5;
  padding: 6px 12px;
  border-radius: 4px;
  color: #333;
  font-size: 14px;
  transition: all 0.2s ease;
}

:deep(.el-color-dropdown__btn:hover) {
  background: #eaeaea;
}

.rich-editor {
  width: 100%;
  min-height: 500px;
  outline: none;
  padding: 1rem;
  padding-left: 0;
  margin-left: -16px;
  font-size: 1.1rem;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
  position: relative;
  top: -30px;
  margin-bottom: -30px;
  cursor: text;
  caret-color: v-bind('textColor');
}

/* 移除的選取框透明樣式 */
.rich-editor::selection,
.rich-editor::-moz-selection,
.rich-editor span::selection,
.rich-editor span::-moz-selection {
  background: rgba(0, 122, 255, 0.2); /* 添加一個淺藍色的選取背景 */
}

/* 確保帶有顏色的文字正確顯示 */
.rich-editor span {
  display: inline;
  white-space: pre-wrap;
}

.color-picker-wrapper {
  position: relative;
  z-index: 1000;
}

.color-picker-panel {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 2000;
  min-width: 240px;
  max-height: 300px;  /* 添加最大高度 */
  overflow-y: auto;   /* 添加滾動條 */
}

/* 美化滾動條 */
.color-picker-panel::-webkit-scrollbar {
  width: 6px;
}

.color-picker-panel::-webkit-scrollbar-track {
  background: transparent;
}

.color-picker-panel::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.color-picker-panel::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}

/* 添加字體大小選擇器樣式 */
.font-size-tool {
  margin-left: 0;
}

.font-size-select {
  width: 80px;
}

:deep(.font-size-select .el-input__wrapper) {
  background: #f5f5f5;
  border: none;
  box-shadow: none !important;
  border-radius: 6px;
  padding: 0 4px;
}

:deep(.font-size-select .el-input__inner) {
  height: 32px;
  color: #1d1d1f;
  font-size: 14px;
  padding: 0 4px;
}

:deep(.font-size-select .el-select__caret) {
  color: #666;
  margin-left: 2px;
}

:deep(.font-size-select:hover .el-input__wrapper) {
  background: #eaeaea;
}

.font-size-wrapper {
  position: relative;
  z-index: 1000;
}

.font-size-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 12px;  /* 修改內邊距 */
  border-radius: 10px;  /* 修改圓角以匹配顏色選擇器 */
  background: rgba(0, 0, 0, 0.03);  /* 修改背景色以匹配顏色選擇器 */
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 70px;
  height: 40px;  /* 設置固定高度以配顏色選擇器 */
}

.font-size-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.02);
}

.font-size-preview {
  font-size: 16px;  /* 增加字體大小 */
  font-weight: 500;  /* 加粗 */
  color: #1d1d1f;
}

.font-size-arrow {
  font-size: 12px;
  color: #666;
  margin-left: 4px;  /* 增加箭頭的左邊距 */
}

.font-size-panel {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: white;
  border-radius: 8px;
  padding: 8px 0;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 2000;
  min-width: 100px;
  max-height: 300px;  /* 添加最大高度 */
  overflow-y: auto;   /* 添加滾動條 */
}

/* 美化滾動條 */
.font-size-panel::-webkit-scrollbar {
  width: 6px;
}

.font-size-panel::-webkit-scrollbar-track {
  background: transparent;
}

.font-size-panel::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.font-size-panel::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}

.size-item {
  padding: 6px 16px;  /* 稍微減小padding使選項更緊湊 */
  cursor: pointer;
  transition: all 0.2s ease;
  color: #1d1d1f;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.size-item:hover {
  background: #f5f5f5;
}

.size-item.active {
  color: #007AFF;
  background: rgba(0, 122, 255, 0.1);
}
</style> 