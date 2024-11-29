<template>
  <div class="task-comments">
    <!-- 評論列表 -->
    <div class="comments-list">
      <div 
        v-for="comment in comments" 
        :key="comment.id"
        class="comment-item"
      >
        <div class="comment-header">
          <span class="comment-user">{{ getUserName(comment.createdBy) }}</span>
          <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
        </div>
        <div class="comment-content">{{ comment.content }}</div>
        <div v-if="comment.attachments?.length" class="comment-attachments">
          <div 
            v-for="(file, index) in comment.attachments"
            :key="index"
            class="attachment-item"
          >
            <el-link type="primary" :href="file" target="_blank">
              <el-icon><Document /></el-icon>
              {{ getFileName(file) }}
            </el-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加評論 -->
    <div class="comment-form">
      <el-input
        v-model="form.content"
        type="textarea"
        rows="3"
        placeholder="請輸入評論內容"
      />
      <div class="form-footer">
        <div class="upload-area">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="5"
            multiple
          >
            <template #trigger>
              <el-button type="primary" link>
                <el-icon><Paperclip /></el-icon>添加附件
              </el-button>
            </template>
          </el-upload>
        </div>
        <el-button type="primary" @click="handleSubmit">發表評論</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Paperclip } from '@element-plus/icons-vue'
import type { UploadInstance, UploadFile } from 'element-plus'
import type { TaskComment } from '@/types/task'

const props = defineProps<{
  comments: TaskComment[]
}>()

const emit = defineEmits<{
  (e: 'add', data: { content: string; attachments: string[] }): void
}>()

// 上傳組件引用
const uploadRef = ref<UploadInstance>()

// 表單數據
const form = reactive({
  content: '',
  files: [] as UploadFile[]
})

// 模擬用戶列表
const userList = [
  { id: 1, name: '張三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
]

// 獲取用戶名稱
const getUserName = (userId: number) => {
  return userList.find(user => user.id === userId)?.name || '未知用戶'
}

// 格式化時間
const formatTime = (time: string) => {
  return new Date(time).toLocaleString()
}

// 獲取文件名
const getFileName = (path: string) => {
  return path.split('/').pop() || '未知文件'
}

// 處理文件變更
const handleFileChange = (file: UploadFile) => {
  form.files.push(file)
}

// 提交評論
const handleSubmit = async () => {
  if (!form.content.trim()) {
    ElMessage.warning('請輸入評論內容')
    return
  }

  // TODO: 實現文件上傳
  const attachments = form.files.map(file => URL.createObjectURL(file.raw!))

  emit('add', {
    content: form.content,
    attachments
  })

  // 重置表單
  form.content = ''
  form.files = []
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}
</script>

<style scoped>
.task-comments {
  margin-top: 20px;
}

.comments-list {
  margin-bottom: 20px;
}

.comment-item {
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
}

.comment-header {
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-user {
  font-weight: bold;
  color: #409eff;
}

.comment-time {
  color: #909399;
  font-size: 12px;
}

.comment-content {
  line-height: 1.5;
  margin-bottom: 8px;
}

.comment-attachments {
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.attachment-item {
  margin: 4px 0;
}

.comment-form {
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.form-footer {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-area {
  :deep(.el-upload-list) {
    margin: 0;
  }
}
</style> 