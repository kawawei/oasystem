// 消息類型
export type MessageType = 'text' | 'image' | 'file' | 'system'

// 聊天類型
export type ChatType = 'private' | 'group'

// 在線狀態
export type OnlineStatus = 'online' | 'offline' | 'away'

// 消息
export interface ChatMessage {
  id: number
  chatId: number
  senderId: number
  content: string
  type: MessageType
  createdAt: string
  // 可選屬性
  fileUrl?: string
  fileName?: string
  fileSize?: number
  imageUrl?: string
  replyTo?: number  // 回覆的消息ID
}

// 聊天室
export interface ChatRoom {
  id: number
  type: ChatType
  name: string
  avatar?: string
  createdAt: string
  updatedAt: string
  lastMessage?: ChatMessage
  unreadCount: number
  // 群組特有屬性
  members?: number[]
  adminId?: number
}

// 聊天成員
export interface ChatMember {
  userId: number
  chatId: number
  nickname?: string
  joinedAt: string
  lastReadAt: string
  status: OnlineStatus
}

// 聊天設置
export interface ChatSettings {
  notification: boolean
  sound: boolean
  desktop: boolean
}

// 表情包
export interface Emoji {
  id: string
  url: string
  category: string
  keywords: string[]
}

// 消息狀態
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

// 擴展消息接口（用於前端顯示）
export interface ExtendedMessage extends ChatMessage {
  status: MessageStatus
  sender: {
    id: number
    name: string
    avatar: string
  }
  isOwn: boolean
} 