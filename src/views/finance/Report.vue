<template>
  <div class="report-container">
    <!-- 頁面標題和操作按鈕 -->
    <div class="page-header">
      <h2>財務報表</h2>
      <div class="header-operations">
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>導出報表
        </el-button>
      </div>
    </div>

    <!-- 報表篩選條件 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="報表類型">
          <el-select v-model="filterForm.type" placeholder="請選擇">
            <el-option label="收支概況" value="overview" />
            <el-option label="收入分析" value="income" />
            <el-option label="支出分析" value="expense" />
            <el-option label="薪資報表" value="salary" />
          </el-select>
        </el-form-item>
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
          <el-button type="primary" @click="handleSearch">查詢</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 報表內容 -->
    <div class="report-content">
      <!-- 數據概覽卡片 -->
      <el-row :gutter="20" class="data-overview">
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>總收入</span>
                <el-tag type="success">{{ filterForm.dateRange ? '區間' : '本月' }}</el-tag>
              </div>
            </template>
            <div class="card-amount">
              {{ formatAmount(summaryData.totalIncome) }}
            </div>
            <div class="card-compare">
              較上期
              <span :class="summaryData.incomeGrowth >= 0 ? 'up' : 'down'">
                {{ Math.abs(summaryData.incomeGrowth) }}%
                <el-icon>
                  <CaretTop v-if="summaryData.incomeGrowth >= 0" />
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
                <span>總支出</span>
                <el-tag type="danger">{{ filterForm.dateRange ? '區間' : '本月' }}</el-tag>
              </div>
            </template>
            <div class="card-amount">
              {{ formatAmount(summaryData.totalExpense) }}
            </div>
            <div class="card-compare">
              較上期
              <span :class="summaryData.expenseGrowth >= 0 ? 'up' : 'down'">
                {{ Math.abs(summaryData.expenseGrowth) }}%
                <el-icon>
                  <CaretTop v-if="summaryData.expenseGrowth >= 0" />
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
                <span>薪資支出</span>
                <el-tag type="warning">{{ filterForm.dateRange ? '區間' : '本月' }}</el-tag>
              </div>
            </template>
            <div class="card-amount">
              {{ formatAmount(summaryData.totalSalary) }}
            </div>
            <div class="card-compare">
              較上期
              <span :class="summaryData.salaryGrowth >= 0 ? 'up' : 'down'">
                {{ Math.abs(summaryData.salaryGrowth) }}%
                <el-icon>
                  <CaretTop v-if="summaryData.salaryGrowth >= 0" />
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
                <span>淨收入</span>
                <el-tag type="info">{{ filterForm.dateRange ? '區間' : '本月' }}</el-tag>
              </div>
            </template>
            <div class="card-amount">
              {{ formatAmount(summaryData.netIncome) }}
            </div>
            <div class="card-compare">
              較上期
              <span :class="summaryData.netIncomeGrowth >= 0 ? 'up' : 'down'">
                {{ Math.abs(summaryData.netIncomeGrowth) }}%
                <el-icon>
                  <CaretTop v-if="summaryData.netIncomeGrowth >= 0" />
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
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>收支趨勢</span>
                <el-radio-group v-model="trendChartPeriod" size="small">
                  <el-radio-button value="day">日</el-radio-button>
                  <el-radio-button value="week">週</el-radio-button>
                  <el-radio-button value="month">月</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container" ref="trendChartRef"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>收入構成</span>
                <el-radio-group v-model="incomeChartType" size="small">
                  <el-radio-button value="pie">圓餅圖</el-radio-button>
                  <el-radio-button value="bar">柱狀圖</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container" ref="incomeChartRef"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="chart-area">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>支出分析</span>
                <el-radio-group v-model="expenseChartType" size="small">
                  <el-radio-button value="pie">圓餅圖</el-radio-button>
                  <el-radio-button value="bar">柱狀圖</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container" ref="expenseChartRef"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>部門支出對比</span>
                <el-radio-group v-model="departmentChartPeriod" size="small">
                  <el-radio-button value="month">月度</el-radio-button>
                  <el-radio-button value="quarter">季度</el-radio-button>
                  <el-radio-button value="year">年度</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container" ref="departmentChartRef"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, CaretTop, CaretBottom } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 篩選表單
const filterForm = reactive({
  type: 'overview',
  dateRange: [] as string[]
})

// 圖表引用
const trendChartRef = ref<HTMLElement>()
const incomeChartRef = ref<HTMLElement>()
const expenseChartRef = ref<HTMLElement>()
const departmentChartRef = ref<HTMLElement>()

// 圖表實例
let trendChart: echarts.ECharts | null = null
let incomeChart: echarts.ECharts | null = null
let expenseChart: echarts.ECharts | null = null
let departmentChart: echarts.ECharts | null = null

// 圖表配置
const trendChartPeriod = ref('month')
const incomeChartType = ref('pie')
const expenseChartType = ref('pie')
const departmentChartPeriod = ref('month')

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

// 匯總數據
const summaryData = reactive({
  totalIncome: 1500000,
  incomeGrowth: 15.5,
  totalExpense: 800000,
  expenseGrowth: -5.2,
  totalSalary: 500000,
  salaryGrowth: 3.8,
  netIncome: 700000,
  netIncomeGrowth: 25.6
})

// 格式化金額
const formatAmount = (amount: number) => {
  return `NT$ ${amount.toLocaleString()}`
}

// 初始化圖表
const initCharts = () => {
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    updateTrendChart()
  }
  
  if (incomeChartRef.value) {
    incomeChart = echarts.init(incomeChartRef.value)
    updateIncomeChart()
  }
  
  if (expenseChartRef.value) {
    expenseChart = echarts.init(expenseChartRef.value)
    updateExpenseChart()
  }
  
  if (departmentChartRef.value) {
    departmentChart = echarts.init(departmentChartRef.value)
    updateDepartmentChart()
  }
}

// 更新收支趨勢圖表
const updateTrendChart = () => {
  const option = {
    title: {
      text: '收支趨勢'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['收入', '支出', '淨收入']
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '收入',
        type: 'line',
        data: [150, 230, 224, 218, 135, 147]
      },
      {
        name: '支出',
        type: 'line',
        data: [80, 120, 110, 100, 70, 80]
      },
      {
        name: '淨收入',
        type: 'line',
        data: [70, 110, 114, 118, 65, 67]
      }
    ]
  }
  
  trendChart?.setOption(option)
}

// 更新收入構成圖表
const updateIncomeChart = () => {
  const option = {
    title: {
      text: '收入構成'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: [
          { value: 500, name: '課程收入' },
          { value: 300, name: '教材收入' },
          { value: 200, name: '其他收入' }
        ]
      }
    ]
  }
  
  incomeChart?.setOption(option)
}

// 更新支出分析圖表
const updateExpenseChart = () => {
  const option = {
    title: {
      text: '支出分析'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: [
          { value: 500, name: '薪資支出' },
          { value: 200, name: '租金支出' },
          { value: 100, name: '水電費' },
          { value: 150, name: '設備採購' },
          { value: 50, name: '其他支出' }
        ]
      }
    ]
  }
  
  expenseChart?.setOption(option)
}

// 更新部門支出對比圖表
const updateDepartmentChart = () => {
  const option = {
    title: {
      text: '部門支出對比'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['薪資', '其他支出']
    },
    xAxis: {
      type: 'category',
      data: ['行政部', '業務部', '教學部']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '薪資',
        type: 'bar',
        stack: 'total',
        data: [150, 200, 250]
      },
      {
        name: '其他支出',
        type: 'bar',
        stack: 'total',
        data: [50, 70, 80]
      }
    ]
  }
  
  departmentChart?.setOption(option)
}

// 監聽圖表類型變化
watch([incomeChartType, expenseChartType], () => {
  updateIncomeChart()
  updateExpenseChart()
})

// 監聽時間週期變化
watch([trendChartPeriod, departmentChartPeriod], () => {
  updateTrendChart()
  updateDepartmentChart()
})

// 搜索
const handleSearch = () => {
  // TODO: 實現搜索邏輯
  updateCharts()
}

// 重置篩選
const resetFilter = () => {
  filterForm.type = 'overview'
  filterForm.dateRange = []
  handleSearch()
}

// 更新所有圖表
const updateCharts = () => {
  updateTrendChart()
  updateIncomeChart()
  updateExpenseChart()
  updateDepartmentChart()
}

// 導出報表
const handleExport = () => {
  // TODO: 實現導出邏輯
  ElMessage.success('導出成功')
}

// 初始化
onMounted(() => {
  initCharts()
  
  // 監聽窗口大小變化
  window.addEventListener('resize', () => {
    trendChart?.resize()
    incomeChart?.resize()
    expenseChart?.resize()
    departmentChart?.resize()
  })
})
</script>

<style scoped>
.report-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.data-overview {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-amount {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.card-compare {
  color: #909399;
  font-size: 14px;
}

.card-compare .up {
  color: #67c23a;
}

.card-compare .down {
  color: #f56c6c;
}

.chart-area {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 340px;
}
</style> 