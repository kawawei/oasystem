<template>
  <div class="dashboard-filter">
    <div class="filter-group">
      <label>時間範圍</label>
      <select v-model="selectedRange" @change="handleRangeChange">
        <option value="7">最近7天</option>
        <option value="30">最近30天</option>
        <option value="90">最近3個月</option>
        <option value="custom">自定義</option>
      </select>
    </div>

    <div v-if="selectedRange === 'custom'" class="date-range">
      <div class="filter-group">
        <label>開始日期</label>
        <input type="date" v-model="startDate" @change="handleDateChange" />
      </div>
      <div class="filter-group">
        <label>結束日期</label>
        <input type="date" v-model="endDate" @change="handleDateChange" />
      </div>
    </div>

    <div class="filter-actions">
      <button class="export-btn" @click="exportData">
        <i class="fas fa-download"></i>
        導出數據
      </button>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { exportToExcel } from '@/utils/export'

export default {
  name: 'DashboardFilter',
  props: {
    dashboardData: {
      type: Object,
      required: true
    }
  },
  emits: ['filter-change'],
  setup(props, { emit }) {
    const selectedRange = ref('7')
    const startDate = ref('')
    const endDate = ref('')

    const handleRangeChange = () => {
      if (selectedRange.value !== 'custom') {
        const days = parseInt(selectedRange.value)
        const end = new Date()
        const start = new Date(end - days * 24 * 60 * 60 * 1000)
        startDate.value = start.toISOString().split('T')[0]
        endDate.value = end.toISOString().split('T')[0]
        emitFilterChange()
      }
    }

    const handleDateChange = () => {
      if (startDate.value && endDate.value) {
        emitFilterChange()
      }
    }

    const emitFilterChange = () => {
      emit('filter-change', {
        startDate: startDate.value,
        endDate: endDate.value
      })
    }

    const exportData = () => {
      const data = [
        {
          sheetName: '任務統計',
          data: [
            ['狀態', '數量'],
            ['待處理', props.dashboardData.taskStats.pending || 0],
            ['進行中', props.dashboardData.taskStats.in_progress || 0],
            ['已完成', props.dashboardData.taskStats.completed || 0]
          ]
        },
        {
          sheetName: '專案統計',
          data: [
            ['狀態', '數量'],
            ['規劃中', props.dashboardData.projectStats.planning || 0],
            ['進行中', props.dashboardData.projectStats.in_progress || 0],
            ['已完成', props.dashboardData.projectStats.completed || 0]
          ]
        }
      ]
      
      exportToExcel(data, `儀表板報表_${new Date().toLocaleDateString()}`)
    }

    return {
      selectedRange,
      startDate,
      endDate,
      handleRangeChange,
      handleDateChange,
      exportData
    }
  }
}
</script>

<style scoped>
.dashboard-filter {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow-color);
  margin-bottom: 1.5rem;
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.filter-group select,
.filter-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-color);
}

.date-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--button-bg);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.export-btn:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .date-range {
    grid-template-columns: 1fr;
  }
}
</style> 