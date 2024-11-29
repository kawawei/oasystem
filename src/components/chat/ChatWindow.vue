<template>
  <div class="chat-container" :class="{ 'chat-minimized': isMinimized }">
    <!-- 聊天室列表按鈕 -->
    <div class="chat-toggle" @click="toggleChatList">
      <el-badge :value="totalUnread" :hidden="totalUnread === 0">
        <el-button type="primary" size="large">
          <template #icon>
            <el-icon><ChatRound /></el-icon>
          </template>
          聊天
        </el-button>
      </el-badge>
    </div>

    <!-- 聊天室列表 -->
    <div v-show="showChatList" class="chat-list">
      <div class="chat-list-header">
        <span>聊天</span>
        <div class="header-actions">
          <el-button 
            type="primary" 
            link 
            @click="showNewChatDialog = true"
          >
            <el-icon><Plus /></el-icon>
          </el-button>
        </div>
      </div>
      <div class="chat-list-content">
        <div 
          v-for="room in chatStore.rooms" 
          :key="room.id"
          class="chat-item"
          :class="{ 'active': room.id === currentRoomId }"
          @click="openChat(room)"
        >
          <div class="avatar-container">
            <el-avatar :size="40" :src="room.avatar">
              {{ room.name.charAt(0) }}
            </el-avatar>
            <div 
              v-if="room.type === 'private'"
              class="status-indicator"
              :class="getUserStatus(room.members?.[0])"
            />
          </div>
          <div class="chat-info">
            <div class="chat-name">{{ room.name }}</div>
            <div class="chat-preview">
              {{ room.lastMessage?.content || '暫無消息' }}
            </div>
          </div>
          <div class="chat-meta">
            <el-badge 
              v-if="room.unreadCount" 
              :value="room.unreadCount" 
              type="danger"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 活動的聊天視窗 -->
    <div class="active-chats">
      <ChatBox 
        v-for="room in activeRooms"
        :key="room.id"
        :room="room"
        @close="closeChat(room.id)"
        @minimize="minimizeChat(room.id)"
      />
    </div>

    <!-- 新建聊天對話框 -->
    <el-dialog
      v-model="showNewChatDialog"
      title="發起聊天"
      width="400px"
    >
      <el-form :model="newChatForm">
        <el-form-item label="聊天類型">
          <el-radio-group v-model="newChatForm.type">
            <el-radio label="private">私聊</el-radio>
            <el-radio label="group">群聊</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="newChatForm.type === 'group'">
          <el-form-item label="群組名稱">
            <el-input v-model="newChatForm.name" placeholder="請輸入群組名稱" />
          </el-form-item>
        </template>

        <el-form-item label="選擇成員">
          <el-select
            v-model="newChatForm.members"
            multiple
            filterable
            placeholder="請選擇成員"
          >
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showNewChatDialog = false">取消</el-button>
          <el-button type="primary" @click="createNewChat">
            確定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ChatRound, Plus } from '@element-plus/icons-vue'
import { useChatStore } from '@/stores/chat'
import type { ChatRoom, ChatType } from '@/types/chat'
import ChatBox from './ChatBox.vue'

const chatStore = useChatStore()

// 控制狀態
const isMinimized = ref(false)
const showChatList = ref(false)
const showNewChatDialog = ref(false)
const activeRooms = ref<ChatRoom[]>([])
const currentRoomId = ref<number | null>(null)

// 新建聊天表單
const newChatForm = reactive({
  type: 'private' as ChatType,
  name: '',
  members: [] as number[]
})

// 模擬用戶列表
const userList = [
  { id: 1, name: '張三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
]

// 計算未讀消息總數
const totalUnread = computed(() => chatStore.totalUnread)

// 切換聊天列表顯示
const toggleChatList = () => {
  showChatList.value = !showChatList.value
}

// 打開聊天
const openChat = (room: ChatRoom) => {
  if (!activeRooms.value.find(r => r.id === room.id)) {
    activeRooms.value.push(room)
  }
  currentRoomId.value = room.id
  chatStore.setCurrentRoom(room.id)
  showChatList.value = false
}

// 關閉聊天
const closeChat = (roomId: number) => {
  activeRooms.value = activeRooms.value.filter(r => r.id !== roomId)
  if (currentRoomId.value === roomId) {
    currentRoomId.value = null
    chatStore.setCurrentRoom(null)
  }
}

// 最小化聊天
const minimizeChat = (roomId: number) => {
  // TODO: 實現最小化邏輯
}

// 創建新聊天
const createNewChat = async () => {
  try {
    const room = await chatStore.createRoom(
      newChatForm.type,
      newChatForm.type === 'group' ? newChatForm.name : '私聊',
      newChatForm.members
    )
    openChat(room)
    showNewChatDialog.value = false
    // 重置表單
    newChatForm.type = 'private'
    newChatForm.name = ''
    newChatForm.members = []
  } catch (error) {
    console.error('創建聊天失敗：', error)
  }
}

// 獲取用戶在線狀態
const getUserStatus = (userId?: number) => {
  if (!userId) return 'offline'
  return chatStore.getUserStatus(userId)
}

// 在組件掛載時請求通知權限
onMounted(async () => {
  await chatStore.requestNotificationPermission()
})

// 定期更新在線狀態
const updateInterval = setInterval(() => {
  chatStore.updateLastActive(1) // TODO: 使用實際的用戶 ID
}, 60000) // 每分鐘更新一次

// 組件卸載時清理
onUnmounted(() => {
  clearInterval(updateInterval)
})
</script>

<style scoped>
.chat-container {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
}

.chat-toggle {
  position: absolute;
  right: 0;
  bottom: 0;
}

.chat-list {
  position: absolute;
  right: 0;
  bottom: 80px;
  width: 300px;
  height: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.chat-list-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-list-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.chat-item:hover {
  background-color: #f5f7fa;
}

.chat-item.active {
  background-color: #ecf5ff;
}

.chat-info {
  flex: 1;
  margin-left: 10px;
  overflow: hidden;
}

.chat-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.chat-preview {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-meta {
  margin-left: 10px;
}

.active-chats {
  position: absolute;
  right: 0;
  bottom: 80px;
  display: flex;
  flex-direction: row-reverse;
  gap: 10px;
}

.chat-minimized .active-chats {
  display: none;
}

.avatar-container {
  position: relative;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-indicator.online {
  background-color: #67C23A;
}

.status-indicator.away {
  background-color: #E6A23C;
}

.status-indicator.offline {
  background-color: #909399;
}
</style> 