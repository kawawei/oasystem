<template>
  <div class="week-view">
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
    
    <!-- 星期格子 -->
    <div class="week-grid">
      <!-- 星期標題 -->
      <div class="week-header">
        <div 
          v-for="(day, index) in weekDays" 
          :key="index" 
          class="day-header"
          :class="{ 'today': isToday(dates[index].date) }"
        >
          <div class="day-name">{{ day }}</div>
          <div class="day-date">{{ formatDate(dates[index].date) }}</div>
        </div>
      </div>
      
      <!-- 時間格子 -->
      <div class="time-grid">
        <div 
          v-for="day in 7" 
          :key="day"
          class="day-column"
        >
          <div 
            v-for="hour in 24" 
            :key="hour"
            class="hour-cell"
            @click="handleCellClick(day-1, hour-1)"
          >
            <!-- 行程項目 -->
            <template v-for="event in getDayEvents(dates[day-1].date)" :key="event.id">
              <div 
                v-if="isEventInHour(event, hour-1)"
                class="event-item"
                :class="event.type"
                :style="getEventStyle(event)"
                @click.stop="handleEventClick(event)"
              >
                {{ event.title }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { DateCell } from '@/utils/dateUtils'

const props = defineProps<{
  dates: DateCell[]
  events: any[]
  weekDays: string[]
}>()

const emit = defineEmits<{
  (e: 'cellClick', data: { date: string; hour: number }): void
  (e: 'eventClick', event: any): void
}>()

// 格式化小時
const formatHour = (hour: number) => {
  return `${hour.toString().padStart(2, '0')}:00`
}

// 格式化日期
const formatDate = (date: string) => {
  return date.split('-')[2]
}

// 判斷是否是今天
const isToday = (date: string) => {
  const today = new Date()
  return date === today.toISOString().split('T')[0]
}

// 獲取某一天的所有行程
const getDayEvents = (date: string) => {
  return props.events.filter(event => event.startTime.startsWith(date))
}

// 判斷行程是否在該小時內
const isEventInHour = (event: any, hour: number) => {
  const startHour = new Date(event.startTime).getHours()
  const endHour = new Date(event.endTime).getHours()
  return hour >= startHour && hour < endHour
}

// 計算行程的樣式（位置和高度）
const getEventStyle = (event: any) => {
  const startHour = new Date(event.startTime).getHours()
  const startMinute = new Date(event.startTime).getMinutes()
  const endHour = new Date(event.endTime).getHours()
  const endMinute = new Date(event.endTime).getMinutes()
  
  const top = (startMinute / 60) * 100
  const height = ((endHour - startHour) * 60 + (endMinute - startMinute)) / 60 * 100
  
  return {
    top: `${top}%`,
    height: `${height}%`
  }
}

// 處理格子點擊
const handleCellClick = (dayIndex: number, hour: number) => {
  emit('cellClick', {
    date: props.dates[dayIndex].date,
    hour
  })
}

// 處理行程點擊
const handleEventClick = (event: any) => {
  emit('eventClick', event)
}
</script>

<style scoped>
.week-view {
  height: 100%;
  display: flex;
}

.time-axis {
  width: 60px;
  border-right: 1px solid #ebeef5;
}

.time-slot {
  height: 60px;
  padding: 0 8px;
  text-align: right;
  color: #909399;
  font-size: 12px;
}

.week-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid #ebeef5;
}

.day-header {
  padding: 8px;
  text-align: center;
}

.day-header.today {
  background-color: #ecf5ff;
}

.day-name {
  font-weight: bold;
}

.day-date {
  margin-top: 4px;
  font-size: 20px;
}

.time-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.day-column {
  border-right: 1px solid #ebeef5;
}

.day-column:last-child {
  border-right: none;
}

.hour-cell {
  height: 60px;
  border-bottom: 1px solid #ebeef5;
  position: relative;
}

.event-item {
  position: absolute;
  left: 2px;
  right: 2px;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 12px;
  overflow: hidden;
  cursor: pointer;
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
</style> 