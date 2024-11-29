<template>
  <div class="schedule-container">
    <!-- 頁面標題和操作按鈕 -->
    <div class="page-header">
      <h2>行程安排</h2>
      <div class="header-operations">
        <el-button type="primary" @click="handleAddEvent">
          <el-icon><Plus /></el-icon>新增行程
        </el-button>
        <el-button-group>
          <el-button 
            :type="viewType === 'month' ? 'primary' : ''"
            @click="viewType = 'month'"
          >
            月視圖
          </el-button>
          <el-button 
            :type="viewType === 'week' ? 'primary' : ''"
            @click="viewType = 'week'"
          >
            週視圖
          </el-button>
          <el-button 
            :type="viewType === 'day' ? 'primary' : ''"
            @click="viewType = 'day'"
          >
            日視圖
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 日曆控制區 -->
    <div class="calendar-header">
      <div class="calendar-nav">
        <el-button-group>
          <el-button @click="handlePrev">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <el-button @click="handleToday">今天</el-button>
          <el-button @click="handleNext">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </el-button-group>
        <span class="current-date">{{ currentDateDisplay }}</span>
      </div>
      <div class="view-filter">
        <el-select v-model="filterType" placeholder="行程類型" clearable>
          <el-option label="會議" value="meeting" />
          <el-option label="活動" value="event" />
          <el-option label="拜訪" value="visit" />
          <el-option label="其他" value="other" />
        </el-select>
      </div>
    </div>

    <!-- 日曆主體 -->
    <el-card class="calendar-container">
      <div class="calendar-body">
        <!-- 月視圖 -->
        <MonthView
          v-if="viewType === 'month'"
          :dates="monthDates"
          :events="filteredEvents"
          :week-days="weekDays"
          @date-click="handleDateClick"
          @event-click="handleEventClick"
        />

        <!-- 週視圖 -->
        <WeekView
          v-else-if="viewType === 'week'"
          :dates="weekDates"
          :events="filteredEvents"
          :week-days="weekDays"
          @cell-click="handleCellClick"
          @event-click="handleEventClick"
        />

        <!-- 日視圖 -->
        <DayView
          v-else
          :date="currentDate"
          :events="filteredEvents"
          @cell-click="handleCellClick"
          @event-click="handleEventClick"
        />
      </div>
    </el-card>

    <!-- 行程編輯對話框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增行程' : '編輯行程'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="eventRules"
        label-width="100px"
      >
        <el-form-item label="行程標題" prop="title">
          <el-input v-model="form.title" placeholder="請輸入行程標題" />
        </el-form-item>
        <el-form-item label="行程類型" prop="type">
          <el-select v-model="form.type" placeholder="請選擇">
            <el-option
              v-for="option in eventTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="開始時間" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="選擇開始時間"
          />
        </el-form-item>
        <el-form-item label="結束時間" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="選擇結束時間"
          />
        </el-form-item>
        <el-form-item label="地點" prop="location">
          <el-input v-model="form.location" placeholder="請輸入地點" />
        </el-form-item>
        <el-form-item label="參與人員" prop="participants">
          <el-select
            v-model="form.participants"
            multiple
            placeholder="請選擇"
          >
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="提醒時間" prop="reminder">
          <el-select v-model="form.reminder" placeholder="請選擇">
            <el-option
              v-for="option in reminderOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="備註" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            rows="3"
            placeholder="請輸入備註"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">確定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { getMonthDates, formatDate, formatDateTime, parseDateTime } from '@/utils/dateUtils'
import type { DateCell } from '@/utils/dateUtils'
import type { EventForm } from '@/types/schedule'
import { eventRules, eventTypeOptions, reminderOptions } from '@/types/schedule'
import { useScheduleStore } from '@/stores/schedule'
import MonthView from './components/MonthView.vue'
import WeekView from './components/WeekView.vue'
import DayView from './components/DayView.vue'

// Store
const scheduleStore = useScheduleStore()

// 視圖類型
const viewType = ref('month')
const filterType = ref('')

// 當前日期
const currentDate = ref(new Date())

// 星期幾的標題
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 對話框相關
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()

// 表單數據
const form = reactive<EventForm>({
  title: '',
  type: 'meeting',
  startTime: '',
  endTime: '',
  location: '',
  participants: [],
  reminder: '',
  remark: ''
})

// 過濾後的行程
const filteredEvents = computed(() => {
  let events = scheduleStore.events
  if (filterType.value) {
    events = scheduleStore.getEventsByType(filterType.value)
  }
  return events
})

// 新增行程
const handleAddEvent = () => {
  dialogType.value = 'add'
  Object.assign(form, {
    title: '',
    type: 'meeting',
    startTime: '',
    endTime: '',
    location: '',
    participants: [],
    reminder: '',
    remark: ''
  })
  dialogVisible.value = true
}

// 編輯行程
const handleEventClick = (event: any) => {
  dialogType.value = 'edit'
  Object.assign(form, {
    id: event.id,
    title: event.title,
    type: event.type,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    participants: event.participants,
    reminder: event.reminder,
    remark: event.remark
  })
  dialogVisible.value = true
}

// 刪除行程
const handleDeleteEvent = async (event: any) => {
  try {
    await ElMessageBox.confirm(
      '確定要刪除該行程嗎？',
      '警告',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await scheduleStore.deleteEvent(event.id)
    ElMessage.success('刪除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('刪除失敗')
    }
  }
}

// 提交表單
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    if (dialogType.value === 'add') {
      await scheduleStore.addEvent(form)
      ElMessage.success('新增成功')
    } else {
      await scheduleStore.updateEvent(form.id!, form)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
  } catch (error) {
    console.error('表單驗證失敗：', error)
    ElMessage.error('操作失敗')
  }
}

// 處理日期點擊
const handleDateClick = (date: DateCell) => {
  if (date.otherMonth) {
    const newDate = parseDateTime(date.date + ' 00:00:00')
    currentDate.value = newDate
  }
  handleAddEvent()
  form.startTime = date.date + ' 09:00:00'
  form.endTime = date.date + ' 10:00:00'
}

// 處理時間格子點擊
const handleCellClick = (data: { date?: string; hour: number }) => {
  const date = data.date || formatDate(currentDate.value)
  handleAddEvent()
  form.startTime = `${date} ${data.hour.toString().padStart(2, '0')}:00:00`
  form.endTime = `${date} ${(data.hour + 1).toString().padStart(2, '0')}:00:00`
}

// 計算當前日期顯示
const currentDateDisplay = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return `${year}年${month}月`
})

// 計算月份的所有日期
const monthDates = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return getMonthDates(year, month)
})

// 計算週視圖的日期
const weekDates = computed(() => {
  const date = new Date(currentDate.value)
  const day = date.getDay()
  const diff = date.getDate() - day
  const firstDay = new Date(date.setDate(diff))
  
  const dates: DateCell[] = []
  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(firstDay)
    currentDay.setDate(firstDay.getDate() + i)
    dates.push({
      date: formatDate(currentDay),
      day: currentDay.getDate(),
      otherMonth: currentDay.getMonth() !== currentDate.value.getMonth()
    })
  }
  return dates
})

// 判斷是否是今天
const isToday = (date: string) => {
  const today = new Date()
  return date === today.toISOString().split('T')[0]
}

// 判斷日期是否有行程
const hasEvents = (date: string) => {
  return scheduleStore.events.some(event => event.startTime.startsWith(date))
}

// 獲取日期的行程
const getDateEvents = (date: string) => {
  return scheduleStore.events.filter(event => event.startTime.startsWith(date))
}

// 上一個月/週/日
const handlePrev = () => {
  const date = new Date(currentDate.value)
  if (viewType.value === 'month') {
    date.setMonth(date.getMonth() - 1)
  } else if (viewType.value === 'week') {
    date.setDate(date.getDate() - 7)
  } else {
    date.setDate(date.getDate() - 1)
  }
  currentDate.value = date
}

// 下一個月/週/日
const handleNext = () => {
  const date = new Date(currentDate.value)
  if (viewType.value === 'month') {
    date.setMonth(date.getMonth() + 1)
  } else if (viewType.value === 'week') {
    date.setDate(date.getDate() + 7)
  } else {
    date.setDate(date.getDate() + 1)
  }
  currentDate.value = date
}

// 回到今天
const handleToday = () => {
  currentDate.value = new Date()
}
</script>

<style scoped>
.schedule-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-operations {
  display: flex;
  gap: 10px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.current-date {
  font-size: 20px;
  font-weight: bold;
}

.calendar-container {
  min-height: 600px;
}

.calendar-body {
  height: 600px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 