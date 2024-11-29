import { defineStore } from 'pinia'
import { storageService } from '@/services/storage'
import { reminderService } from '@/services/reminder'
import type { 
  ChatRoom, 
  ChatMessage, 
  ChatMember, 
  ChatType,
  MessageType,
  OnlineStatus,
  ExtendedMessage 
} from '@/types/chat'

const STORAGE_KEY = 'chat_data'

interface ChatState {
  rooms: ChatRoom[]
  messages: Record<number, ChatMessage[]>  // chatId -> messages
  members: Record<number, ChatMember[]>    // chatId -> members
  currentRoomId: number | null
  loading: boolean
  onlineUsers: Set<number>
  lastActiveTime: Record<number, string>  // 用戶最後活動時間
}

interface StorageData {
  rooms: ChatRoom[]
  messages: Record<number, ChatMessage[]>
  members: Record<number, ChatMember[]>
}

const defaultData: StorageData = {
  rooms: [],
  messages: {},
  members: {}
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    rooms: [],
    messages: {},
    members: {},
    currentRoomId: null,
    loading: false,
    onlineUsers: new Set(),
    lastActiveTime: {} as Record<number, string>  // 用戶最後活��時間
  }),

  getters: {
    // 獲取當前聊天室
    currentRoom: (state) => {
      return state.currentRoomId ? 
        state.rooms.find(room => room.id === state.currentRoomId) : 
        null
    },

    // 獲取當前聊天室的消息
    currentMessages: (state) => {
      return state.currentRoomId ? 
        state.messages[state.currentRoomId] || [] : 
        []
    },

    // 獲取當前聊天室的成員
    currentMembers: (state) => {
      return state.currentRoomId ? 
        state.members[state.currentRoomId] || [] : 
        []
    },

    // 獲取未讀消息總數
    totalUnread: (state) => {
      return state.rooms.reduce((sum, room) => sum + room.unreadCount, 0)
    },

    // 獲取用戶的所有聊天室
    getUserRooms: (state) => (userId: number) => {
      return state.rooms.filter(room => {
        if (room.type === 'private') {
          return room.members?.includes(userId)
        }
        return true
      })
    },

    // 獲取擴展的消息列表（包含發送者信息）
    getExtendedMessages: (state) => (chatId: number, currentUserId: number): ExtendedMessage[] => {
      const messages = state.messages[chatId] || []
      return messages.map(msg => ({
        ...msg,
        status: 'sent', // TODO: 實現真實的消息狀態
        sender: {
          id: msg.senderId,
          name: 'User Name', // TODO: 從用戶 store 獲取
          avatar: 'avatar.png' // TODO: 從用戶 store 獲取
        },
        isOwn: msg.senderId === currentUserId
      }))
    },

    // 獲取用戶在線狀態
    getUserStatus: (state) => (userId: number) => {
      if (state.onlineUsers.has(userId)) {
        return 'online'
      }
      
      const lastActive = state.lastActiveTime[userId]
      if (!lastActive) return 'offline'

      const timeDiff = Date.now() - new Date(lastActive).getTime()
      if (timeDiff < 5 * 60 * 1000) { // 5分鐘內
        return 'away'
      }
      return 'offline'
    }
  },

  actions: {
    // 初始化
    async init() {
      this.loading = true
      try {
        const data = storageService.get<StorageData>(STORAGE_KEY, defaultData)
        if (data) {
          this.rooms = data.rooms || defaultData.rooms
          this.messages = data.messages || defaultData.messages
          this.members = data.members || defaultData.members
        } else {
          this.rooms = defaultData.rooms
          this.messages = defaultData.messages
          this.members = defaultData.members
        }
      } finally {
        this.loading = false
      }
    },

    // 保存數據
    saveToStorage() {
      storageService.set(STORAGE_KEY, {
        rooms: this.rooms,
        messages: this.messages,
        members: this.members
      })
    },

    // 創建聊天室
    async createRoom(type: ChatType, name: string, members: number[]) {
      const room: ChatRoom = {
        id: Date.now(),
        type,
        name,
        members,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        unreadCount: 0
      }

      this.rooms.push(room)
      this.messages[room.id] = []
      this.members[room.id] = members.map(userId => ({
        userId,
        chatId: room.id,
        joinedAt: new Date().toISOString(),
        lastReadAt: new Date().toISOString(),
        status: 'offline'
      }))

      this.saveToStorage()
      return room
    },

    // 發送消息
    async sendMessage(
      chatId: number, 
      content: string, 
      type: MessageType = 'text',
      extras: Record<string, any> = {}
    ) {
      const message = {
        id: Date.now(),
        chatId,
        senderId: 1, // TODO: 從用戶 store 獲取當前用戶 ID
        content,
        type,
        createdAt: new Date().toISOString(),
        ...extras
      }

      // 添加消息
      if (!this.messages[chatId]) {
        this.messages[chatId] = []
      }
      this.messages[chatId].push(message)

      // 更新聊天室
      const room = this.rooms.find(r => r.id === chatId)
      if (room) {
        room.lastMessage = message
        room.updatedAt = message.createdAt

        // 發送提醒給其他成員
        room.members?.forEach(userId => {
          if (userId !== message.senderId) {
            room.unreadCount++
            // 發送桌面通知
            this.sendNotification(room, message)
          }
        })
      }

      this.saveToStorage()
      return message
    },

    // 標記消息為已讀
    async markAsRead(chatId: number, userId: number) {
      const room = this.rooms.find(r => r.id === chatId)
      if (room) {
        room.unreadCount = 0
        const member = this.members[chatId]?.find(m => m.userId === userId)
        if (member) {
          member.lastReadAt = new Date().toISOString()
        }
      }
      this.saveToStorage()
    },

    // 更新用戶在線狀態
    updateUserStatus(userId: number, status: OnlineStatus) {
      if (status === 'online') {
        this.onlineUsers.add(userId)
        this.lastActiveTime[userId] = new Date().toISOString()
      } else {
        this.onlineUsers.delete(userId)
      }

      // 更新所有相關聊天室的成員狀態
      Object.values(this.members).forEach(roomMembers => {
        const member = roomMembers.find(m => m.userId === userId)
        if (member) {
          member.status = status
        }
      })
    },

    // 更新用戶最後活動時間
    updateLastActive(userId: number) {
      this.lastActiveTime[userId] = new Date().toISOString()
    },

    // 發送桌面通知
    async sendNotification(room: ChatRoom, message: ChatMessage) {
      let body = ''

      switch (message.type) {
        case 'text':
          body = message.content
          break
        case 'image':
          body = '[圖片消息]'
          break
        case 'file':
          body = '[文件消息]'
          break
      }

      reminderService.showNotification({
        title: `來自 ${room.name} 的新消息`,
        body,
        icon: room.avatar,
        onClick: () => {
          // 打開對應的聊天室
          this.setCurrentRoom(room.id)
        }
      })
    },

    // 請求通知權限
    async requestNotificationPermission() {
      try {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
      } catch (error) {
        console.error('無法請求通知權限：', error)
        return false
      }
    },

    // 切換當前聊天室
    setCurrentRoom(roomId: number | null) {
      this.currentRoomId = roomId
      if (roomId) {
        this.markAsRead(roomId, 1) // TODO: 使用實際的用戶 ID
      }
    }
  }
}) 