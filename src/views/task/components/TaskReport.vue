<template>
  <div class="task-report">
    <!-- 報表篩選 -->
    <div class="report-filter">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="時間範圍">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
            :shortcuts="dateShortcuts"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="generateReport">生成報表</el-button>
          <el-button @click="handleExport">導出報表</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 統計卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>總任務數</span>
              <el-tag>{{ filterForm.dateRange ? '區間' : '全部' }}</el-tag>
            </div>
          </template>
          <div class="card-value">{{ statistics.totalTasks }}</div>
          <div class="card-trend">
            較上期
            <span :class="statistics.taskGrowth >= 0 ? 'up' : 'down'">
              {{ Math.abs(statistics.taskGrowth) }}%
              <el-icon>
                <CaretTop v-if="statistics.taskGrowth >= 0" />
                <CaretBottom v-else />
              </el-icon>
            </span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>完成率</span>
              <el-tag type="success">{{ filterForm.dateRange ? '區間' : '全部' }}</el-tag>
            </div>
          </template>
          <div class="card-value">{{ statistics.completionRate }}%</div>
          <div class="card-trend">
            較上期
            <span :class="statistics.completionGrowth >= 0 ? 'up' : 'down'">
              {{ Math.abs(statistics.completionGrowth) }}%
              <el-icon>
                <CaretTop v-if="statistics.completionGrowth >= 0" />
                <CaretBottom v-else />
              </el-icon>
            </span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>平均耗時</span>
              <el-tag type="warning">{{ filterForm.dateRange ? '區間' : '全部' }}</el-tag>
            </div>
          </template>
          <div class="card-value">{{ statistics.averageDuration }}天</div>
          <div class="card-trend">
            較上期
            <span :class="statistics.durationGrowth >= 0 ? 'up' : 'down'">
              {{ Math.abs(statistics.durationGrowth) }}%
              <el-icon>
                <CaretTop v-if="statistics.durationGrowth >= 0" />
                <CaretBottom v-else />
              </el-icon>
            </span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>逾期率</span>
              <el-tag type="danger">{{ filterForm.dateRange ? '區間' : '全部' }}</el-tag>
            </div>
          </template>
          <div class="card-value">{{ statistics.overdueRate }}%</div>
          <div class="card-trend">
            較上期
            <span :class="statistics.overdueGrowth <= 0 ? 'up' : 'down'">
              {{ Math.abs(statistics.overdueGrowth) }}%
              <el-icon>
                <CaretTop v-if="statistics.overdueGrowth <= 0" />
                <CaretBottom v-else />
              </el-icon>
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 圖表區域 -->
    <el-row :gutter="20" class="chart-area">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>任務狀態分布</span>
            </div>
          </template>
          <div class="chart-container" ref="statusChartRef"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>任務趨勢</span>
            </div>
          </template>
          <div class="chart-container" ref="trendChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 詳細數據表格 -->
    <el-card class="data-table">
      <template #header>
        <div class="card-header">
          <span>詳細數據</span>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="newTasks" label="新增任務" width="120" />
        <el-table-column prop="completedTasks" label="完成任務" width="120" />
        <el-table-column prop="completionRate" label="完成率" width="120">
          <template #default="{ row }">
            {{ row.completionRate }}%
          </template>
        </el-table-column>
        <el-table-column prop="averageDuration" label="平均耗時(天)" width="150" />
        <el-table-column prop="overdueTasks" label="逾期任務" width="120" />
        <el-table-column prop="overdueRate" label="逾期率" width="120">
          <template #default="{ row }">
            {{ row.overdueRate }}%
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { CaretTop, CaretBottom } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsCoreOption as EChartsOption } from 'echarts/core'
import { useTaskStore } from '@/stores/task'
import { ElMessage } from 'element-plus'

const taskStore = useTaskStore()

// 圖表引用
const statusChartRef = ref<HTMLElement | null>(null)
const trendChartRef = ref<HTMLElement | null>(null)
let statusChart: ECharts | null = null
let trendChart: ECharts | null = null

// 篩選表單
const filterForm = reactive({
  dateRange: [] as Date[]
})

// 日期快捷選項
const dateShortcuts = [
  {
    text: '最近一週',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一個月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三個月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 統計數據
const statistics = reactive({
  totalTasks: 0,
  taskGrowth: 0,
  completedTasks: 0,
  completionRate: 0,
  completionGrowth: 0,
  averageDuration: 0,
  durationGrowth: 0,
  overdueRate: 0,
  overdueGrowth: 0
})

// 表格數據
interface TableDataItem {
  date: string
  newTasks: number
  completedTasks: number
  completionRate: number
  averageDuration: number
  overdueTasks: number
  overdueRate: number
}

const tableData = ref<TableDataItem[]>([])

// 初始化圖表
const initCharts = () => {
  if (statusChartRef.value) {
    statusChart = echarts.init(statusChartRef.value)
    if (statusChart) {
      const statusOption: EChartsOption = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '任務狀態',
            type: 'pie',
            radius: '50%',
            data: [
              { value: 35, name: '進行中' },
              { value: 30, name: '已完成' },
              { value: 20, name: '待處理' },
              { value: 10, name: '審核中' },
              { value: 5, name: '已取消' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      statusChart.setOption(statusOption)
    }
  }

  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    if (trendChart) {
      const trendOption: EChartsOption = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['新增任務', '完成任務']
        },
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '新增任務',
            type: 'line',
            data: [10, 15, 8, 12, 9, 5, 7]
          },
          {
            name: '完成任務',
            type: 'line',
            data: [8, 12, 7, 9, 6, 4, 6]
          }
        ]
      }
      trendChart.setOption(trendOption)
    }
  }
}

// 生成報表
const generateReport = () => {
  if (!filterForm.dateRange || filterForm.dateRange.length !== 2) {
    ElMessage.warning('請選擇時間範圍')
    return
  }

  const [startDate, endDate] = filterForm.dateRange

  // 獲取當前時間段的數據
  const currentStats = taskStore.generateReport(startDate, endDate)

  // 計算上一個時間段的數據（用於計算環比）
  const timeSpan = endDate.getTime() - startDate.getTime()
  const prevStartDate = new Date(startDate.getTime() - timeSpan)
  const prevEndDate = new Date(endDate.getTime() - timeSpan)
  const prevStats = taskStore.generateReport(prevStartDate, prevEndDate)

  // 更新統計數據
  statistics.totalTasks = currentStats.totalTasks
  statistics.taskGrowth = calculateGrowth(currentStats.totalTasks, prevStats.totalTasks)
  statistics.completionRate = currentStats.completionRate
  statistics.completionGrowth = calculateGrowth(currentStats.completionRate, prevStats.completionRate)
  statistics.averageDuration = currentStats.averageDuration
  statistics.durationGrowth = calculateGrowth(currentStats.averageDuration, prevStats.averageDuration)
  statistics.overdueRate = currentStats.overdueRate
  statistics.overdueGrowth = calculateGrowth(currentStats.overdueRate, prevStats.overdueRate)

  // 更新圖表
  updateCharts(currentStats)
  // 更新表格數據
  updateTable(currentStats.dailyTrend)
}

// 計算增長率
const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

// 更新圖表
const updateCharts = (stats: any) => {
  // 更新狀態分布圖
  if (statusChart) {
    const statusOption = {
      series: [{
        data: stats.statusDistribution.map((item: any) => ({
          name: getStatusText(item.name),
          value: item.value
        }))
      }]
    }
    statusChart!.setOption(statusOption)
  }

  // 更新趨勢圖
  if (trendChart) {
    const dates = stats.dailyTrend.map((item: any) => item.date)
    const newTasks = stats.dailyTrend.map((item: any) => item.newTasks)
    const completedTasks = stats.dailyTrend.map((item: any) => item.completedTasks)

    const trendOption = {
      xAxis: {
        data: dates
      },
      series: [
        {
          name: '新增任務',
          data: newTasks
        },
        {
          name: '完成任務',
          data: completedTasks
        }
      ]
    }
    trendChart!.setOption(trendOption)
  }
}

// 更新表格數據
const updateTable = (trend: any[]) => {
  tableData.value = trend.map(item => ({
    date: item.date,
    newTasks: item.newTasks,
    completedTasks: item.completedTasks,
    completionRate: item.newTasks ? 
      Math.round((item.completedTasks / item.newTasks) * 100) : 0,
    averageDuration: item.averageDuration,
    overdueTasks: item.overdueTasks,
    overdueRate: item.overdueRate
  }))
}

// 導出報表
const handleExport = async () => {
  if (!filterForm.dateRange || filterForm.dateRange.length !== 2) {
    ElMessage.warning('請選擇時間範圍')
    return
  }

  const [startDate, endDate] = filterForm.dateRange
  try {
    await taskStore.exportReport(startDate, endDate)
    ElMessage.success('報表導出成功')
  } catch (error) {
    ElMessage.error('報表導出失敗')
  }
}

// 獲取狀態文字
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待處理',
    processing: '進行中',
    reviewing: '審核中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

// 監聽窗口大小變化
const handleResize = () => {
  statusChart?.resize()
  trendChart?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  statusChart?.dispose()
  trendChart?.dispose()
})
</script>

<style scoped>
.task-report {
  padding: 20px;
}

.report-filter {
  margin-bottom: 20px;
}

.stat-cards {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.card-trend {
  color: #909399;
  font-size: 14px;
}

.card-trend .up {
  color: #67c23a;
}

.card-trend .down {
  color: #f56c6c;
}

.chart-area {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
}

.data-table {
  margin-bottom: 20px;
}
</style> 