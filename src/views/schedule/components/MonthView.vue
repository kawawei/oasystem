<template>
  <div class="month-view">
    <!-- 星期標題 -->
    <div class="week-header">
      <div v-for="day in weekDays" :key="day" class="week-day">
        {{ day }}
      </div>
    </div>
    <!-- 日期格子 -->
    <div class="month-grid">
      <div 
        v-for="(date, index) in dates" 
        :key="index"
        class="date-cell"
        :class="{
          'other-month': date.otherMonth,
          'today': isToday(date.date),
          'has-events': hasEvents(date.date)
        }"
        @click="handleDateClick(date)"
      >
        <div class="date-number">{{ date.day }}</div>
        <div class="event-list">
          <div 
            v-for="event in getDateEvents(date.date)"
            :key="event.id"
            class="event-item"
            :class="event.type"
            @click.stop="handleEventClick(event)"
          >
            {{ event.title }}
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
  (e: 'dateClick', date: DateCell): void
  (e: 'eventClick', event: any): void
}>()

// 判斷是否是今天
const isToday = (date: string) => {
  const today = new Date()
  return date === today.toISOString().split('T')[0]
}

// 判斷日期是否有行程
const hasEvents = (date: string) => {
  return props.events.some(event => event.startTime.startsWith(date))
}

// 獲取日期的行程
const getDateEvents = (date: string) => {
  return props.events.filter(event => event.startTime.startsWith(date))
}

// 處理日期點擊
const handleDateClick = (date: DateCell) => {
  emit('dateClick', date)
}

// 處理行程點擊
const handleEventClick = (event: any) => {
  emit('eventClick', event)
}
</script>

<style scoped>
.month-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  background-color: #f5f7fa;
  padding: 10px 0;
}

.month-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #ebeef5;
}

.date-cell {
  min-height: 100px;
  padding: 5px;
  background-color: #fff;
  cursor: pointer;
}

.date-cell:hover {
  background-color: #f5f7fa;
}

.date-cell.other-month {
  color: #909399;
}

.date-cell.today {
  background-color: #ecf5ff;
}

.date-number {
  text-align: right;
  margin-bottom: 5px;
}

.event-list {
  font-size: 12px;
}

.event-item {
  margin: 2px 0;
  padding: 2px 4px;
  border-radius: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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