<template>
  <div class="day-view">
    <!-- 日期標題 -->
    <div class="day-header">
      <div class="day-info" :class="{ 'today': isToday }">
        <div class="day-name">{{ weekDay }}</div>
        <div class="day-date">{{ formatDateDisplay }}</div>
      </div>
    </div>

    <!-- 時間軸和事件區域 -->
    <div class="time-container">
      <!-- 時間軸 -->
      <div class="time-axis">
        <div 
          v-for="hour in 24" 
          :key="hour-1" 
          class="time-slot"
        >
          {{ formatHour(hour-1) }}
        </div>
      </div>

      <!-- 事件區域 -->
      <div class="event-area">
        <!-- 時間格子 -->
        <div 
          v-for="hour in 24" 
          :key="hour-1"
          class="hour-cell"
          @click="handleCellClick(hour-1)"
        >
          <!-- 當前時間線 -->
          <div 
            v-if="isToday && isCurrentHour(hour-1)"
            class="current-time-line"
            :style="currentTimeStyle"
          ></div>
        </div>

        <!-- 行程項目 -->
        <template v-for="event in events" :key="event.id">
          <div 
            class="event-item"
            :class="event.type"
            :style="getEventStyle(event)"
            @click="handleEventClick(event)"
          >
            <div class="event-time">{{ formatEventTime(event) }}</div>
            <div class="event-title">{{ event.title }}</div>
            <div class="event-location" v-if="event.location">
              <el-icon><Location /></el-icon>
              {{ event.location }}
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { Location } from '@element-plus/icons-vue'

const props = defineProps<{
  date: Date
  events: any[]
}>()

const emit = defineEmits<{
  (e: 'cellClick', data: { hour: number }): void
  (e: 'eventClick', event: any): void
}>()

// 計算是否是今天
const isToday = computed(() => {
  const today = new Date()
  return props.date.toDateString() === today.toDateString()
})

// 計算星期幾
const weekDay = computed(() => {
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return days[props.date.getDay()]
})

// 格式化日期顯示
const formatDateDisplay = computed(() => {
  const year = props.date.getFullYear()
  const month = props.date.getMonth() + 1
  const date = props.date.getDate()
  return `${year}年${month}月${date}日`
})

// 格式化小時
const formatHour = (hour: number) => {
  return `${hour.toString().padStart(2, '0')}:00`
}

// 格式化行程時間
const formatEventTime = (event: any) => {
  const start = new Date(event.startTime)
  const end = new Date(event.endTime)
  return `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`
}

// 判斷是否是當前小時
const isCurrentHour = (hour: number) => {
  const now = new Date()
  return now.getHours() === hour
}

// 計算當前時間線的位置
const currentTimeStyle = computed(() => {
  const now = new Date()
  const minutes = now.getMinutes()
  const top = (minutes / 60) * 100
  return {
    top: `${top}%`
  }
})

// 計算行程的位置和高度
const getEventStyle = (event: any) => {
  const start = new Date(event.startTime)
  const end = new Date(event.endTime)
  const startHour = start.getHours()
  const startMinute = start.getMinutes()
  const duration = (end.getTime() - start.getTime()) / (1000 * 60) // 分鐘
  
  const top = startHour * 60 + startMinute
  return {
    top: `${top}px`,
    height: `${duration}px`
  }
}

// 處理格子點擊
const handleCellClick = (hour: number) => {
  emit('cellClick', { hour })
}

// 處理行程點擊
const handleEventClick = (event: any) => {
  emit('eventClick', event)
}

// 自動更新當前時間線
let timer: number
onMounted(() => {
  timer = window.setInterval(() => {
    // 強制重新計算當前時間線位置
    currentTimeStyle.value
  }, 60000) // 每分鐘更新一次
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.day-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.day-header {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
}

.day-info {
  text-align: center;
}

.day-info.today {
  color: #409eff;
}

.day-name {
  font-size: 16px;
  margin-bottom: 8px;
}

.day-date {
  font-size: 24px;
  font-weight: bold;
}

.time-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.time-axis {
  width: 60px;
  border-right: 1px solid #ebeef5;
  flex-shrink: 0;
}

.time-slot {
  height: 60px;
  padding: 0 8px;
  text-align: right;
  color: #909399;
  font-size: 12px;
}

.event-area {
  flex: 1;
  position: relative;
  overflow-y: auto;
}

.hour-cell {
  height: 60px;
  border-bottom: 1px solid #ebeef5;
  position: relative;
}

.current-time-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #f56c6c;
  z-index: 1;
}

.current-time-line::before {
  content: '';
  position: absolute;
  left: -5px;
  top: -4px;
  width: 10px;
  height: 10px;
  background-color: #f56c6c;
  border-radius: 50%;
}

.event-item {
  position: absolute;
  left: 8px;
  right: 8px;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.event-item:hover {
  transform: scale(1.01);
  z-index: 2;
}

.event-item.meeting {
  background-color: #ecf5ff;
  color: #409eff;
}

.event-item.event {
  background-color: #f0f9eb;
  color: #67c23a;
}

.event-item.visit {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.event-item.other {
  background-color: #f4f4f5;
  color: #909399;
}

.event-time {
  font-weight: bold;
  margin-bottom: 4px;
}

.event-title {
  font-size: 14px;
  margin-bottom: 4px;
}

.event-location {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.8;
}
</style> 