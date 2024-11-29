<template>
  <div class="chat-box" :class="{ 'chat-minimized': isMinimized }">
    <!-- 聊天框標題欄 -->
    <div class="chat-header">
      <div class="header-info">
        <el-avatar :size="24" :src="room.avatar">
          {{ room.name.charAt(0) }}
        </el-avatar>
        <span class="chat-title">{{ room.name }}</span>
      </div>
      <div class="header-actions">
        <el-button-group>
          <el-button 
            type="primary" 
            link 
            @click="toggleMinimize"
          >
            <el-icon>
              <Minus v-if="!isMinimized" />
              <Plus v-else />
            </el-icon>
          </el-button>
          <el-button 
            type="primary" 
            link 
            @click="$emit('close')"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 聊天內容區 -->
    <div v-show="!isMinimized" class="chat-content">
      <div class="message-list" ref="messageListRef">
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="message-item"
          :class="{ 'message-own': message.isOwn }"
        >
          <el-avatar 
            v-if="!message.isOwn"
            :size="32" 
            :src="message.sender.avatar"
          >
            {{ message.sender.name.charAt(0) }}
          </el-avatar>
          <div class="message-content">
            <div 
              v-if="!message.isOwn" 
              class="message-sender"
            >
              {{ message.sender.name }}
            </div>
            <div class="message-bubble">
              <!-- 文本消息 -->
              <template v-if="message.type === 'text'">
                {{ message.content }}
              </template>
              <!-- 圖片消息 -->
              <template v-else-if="message.type === 'image'">
                <el-image 
                  :src="message.imageUrl" 
                  :preview-src-list="[message.imageUrl]"
                  fit="cover"
                  class="message-image"
                />
              </template>
              <!-- 文件消息 -->
              <template v-else-if="message.type === 'file'">
                <div class="file-message">
                  <el-icon><Document /></el-icon>
                  <span class="file-name">{{ message.fileName }}</span>
                  <span class="file-size">{{ formatFileSize(message.fileSize) }}</span>
                </div>
              </template>
            </div>
            <div class="message-time">
              {{ formatTime(message.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 輸入區域 -->
      <div class="chat-input">
        <div class="input-toolbar">
          <el-popover
            v-model:visible="showEmojiPicker"
            trigger="click"
            placement="top-start"
            :width="300"
          >
            <template #reference>
              <el-button type="primary" link>
                <el-icon><Sunny /></el-icon>
              </el-button>
            </template>
            <EmojiPicker @select="insertEmoji" />
          </el-popover>
          <el-upload
            class="upload-image"
            action="#"
            :show-file-list="false"
            :before-upload="handleImageUpload"
            accept="image/*"
          >
            <el-button type="primary" link>
              <el-icon><Picture /></el-icon>
            </el-button>
          </el-upload>
          <el-upload
            class="upload-file"
            action="#"
            :show-file-list="false"
            :before-upload="handleFileUpload"
          >
            <el-button type="primary" link>
              <el-icon><Folder /></el-icon>
            </el-button>
          </el-upload>
        </div>
        <div class="input-area">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="2"
            placeholder="輸入消息..."
            resize="none"
            @keydown.enter.prevent="sendMessage"
          />
          <el-button 
            type="primary" 
            :disabled="!inputMessage.trim()"
            @click="sendMessage"
          >
            發送
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { 
  Close, 
  Minus, 
  Plus, 
  Picture, 
  Document, 
  Folder, 
  Sunny 
} from '@element-plus/icons-vue'
import { useChatStore } from '@/stores/chat'
import type { ChatRoom, ExtendedMessage } from '@/types/chat'
import { formatTime } from '@/utils/dateUtils'
import EmojiPicker from './EmojiPicker.vue'
import { uploadService } from '@/services/upload'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  room: ChatRoom
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'minimize'): void
}>()

const chatStore = useChatStore()
const messageListRef = ref<HTMLElement>()
const inputMessage = ref('')
const isMinimized = ref(false)
const showEmojiPicker = ref(false)

// 獲取消息列表
const messages = computed(() => 
  chatStore.getExtendedMessages(props.room.id, 1) // TODO: 使用實際的用戶 ID
)

// 切換最小化
const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
  emit('minimize')
}

// 發送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return
  
  await chatStore.sendMessage(props.room.id, inputMessage.value)
  inputMessage.value = ''
  scrollToBottom()
}

// 處理圖片上傳
const handleImageUpload = async (file: File) => {
  try {
    // 驗證文件
    uploadService.validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
    })

    // 上傳圖片
    const imageUrl = await uploadService.uploadImage(file)
    
    // 發送圖片消息
    await chatStore.sendMessage(
      props.room.id, 
      '圖片消息', 
      'image',
      { imageUrl }
    )

    ElMessage.success('圖片發送成功')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '圖片上傳失敗')
  }
  return false
}

// 處理文件上傳
const handleFileUpload = async (file: File) => {
  try {
    // 驗證文件
    uploadService.validateFile(file, {
      maxSize: 20 * 1024 * 1024 // 20MB
    })

    // 上傳文件
    const fileInfo = await uploadService.uploadFile(file)
    
    // 發送文件消息
    await chatStore.sendMessage(
      props.room.id,
      '文件消息',
      'file',
      {
        fileUrl: fileInfo.url,
        fileName: fileInfo.name,
        fileSize: fileInfo.size
      }
    )

    ElMessage.success('文件發送成功')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '文件上傳失敗')
  }
  return false
}

// 格式化文件大小
const formatFileSize = (size?: number) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${size.toFixed(2)} ${units[index]}`
}

// 滾動到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

// 監聽新消息
onMounted(() => {
  scrollToBottom()
})

// 插入表情
const insertEmoji = (emoji: { char: string }) => {
  inputMessage.value += emoji.char
  showEmojiPicker.value = false
}
</script>

<style scoped>
.chat-box {
  width: 320px;
  height: 480px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.chat-minimized {
  height: auto;
}

.chat-header {
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-title {
  font-weight: bold;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  gap: 8px;
}

.message-own {
  flex-direction: row-reverse;
}

.message-content {
  max-width: 70%;
}

.message-sender {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.message-bubble {
  padding: 8px 12px;
  background: #f4f4f4;
  border-radius: 8px;
  word-break: break-word;
}

.message-own .message-bubble {
  background: #ecf5ff;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  text-align: right;
}

.message-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
}

.file-message {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #999;
}

.chat-input {
  padding: 10px;
  border-top: 1px solid #eee;
}

.input-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.input-area {
  display: flex;
  gap: 8px;
}

.input-area .el-textarea {
  flex: 1;
}
</style> 