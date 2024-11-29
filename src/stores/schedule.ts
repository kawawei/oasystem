import { defineStore } from 'pinia'
import type { Event, EventForm } from '@/types/schedule'
import { storageService } from '@/services/storage'

const STORAGE_KEY = 'schedule_events'

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    events: [] as Event[],
    loading: false,
    currentEvent: null as Event | null
  }),

  getters: {
    // 獲取指定日期的行程
    getEventsByDate: (state) => (date: string) => {
      return state.events.filter(event => event.startTime.startsWith(date))
    },

    // 獲取指定類型的行程
    getEventsByType: (state) => (type: string) => {
      return state.events.filter(event => event.type === type)
    },

    // 獲取需要提醒的行程
    getRemindEvents: (state) => {
      const now = new Date()
      return state.events.filter(event => {
        if (!event.reminder) return false
        const startTime = new Date(event.startTime)
        const reminderTime = new Date(startTime.getTime() - parseInt(event.reminder) * 60000)
        return reminderTime > now && reminderTime <= new Date(now.getTime() + 5 * 60000)
      })
    }
  },

  actions: {
    // 初始化數據
    init() {
      const savedEvents = storageService.get<Event[]>(STORAGE_KEY, [])
      if (savedEvents) {
        this.events = savedEvents
      }
    },

    // 保存數據
    saveToStorage() {
      storageService.set(STORAGE_KEY, this.events)
    },

    // 添加行程
    async addEvent(eventForm: EventForm) {
      this.loading = true
      try {
        const event: Event = {
          id: Date.now(),
          ...eventForm,
          createdBy: 1, // TODO: 從用戶store獲取
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        this.events.push(event)
        this.saveToStorage()
        return event
      } finally {
        this.loading = false
      }
    },

    // 更新行程
    async updateEvent(id: number, eventForm: EventForm) {
      this.loading = true
      try {
        const index = this.events.findIndex(e => e.id === id)
        if (index > -1) {
          const event: Event = {
            ...this.events[index],
            ...eventForm,
            updatedAt: new Date().toISOString()
          }
          this.events[index] = event
          this.saveToStorage()
          return event
        }
        throw new Error('Event not found')
      } finally {
        this.loading = false
      }
    },

    // 刪除行程
    async deleteEvent(id: number) {
      this.loading = true
      try {
        const index = this.events.findIndex(e => e.id === id)
        if (index > -1) {
          this.events.splice(index, 1)
          this.saveToStorage()
          return true
        }
        return false
      } finally {
        this.loading = false
      }
    },

    // 設置當前行程
    setCurrentEvent(event: Event | null) {
      this.currentEvent = event
    }
  }
}) 