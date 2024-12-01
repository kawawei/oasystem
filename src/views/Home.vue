<template>
  <div class="dashboard">
    <!-- 添加頂部操作區 -->
    <div class="dashboard-header">
      <div class="header-left">
        <span class="update-time">最後更新：{{ formatTime(lastUpdateTime) }}</span>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button 
            type="primary" 
            :icon="Download" 
            @click="exportData"
            :loading="exporting"
          >
            導出報表
          </el-button>
          <el-button 
            :icon="Refresh" 
            @click="refreshData" 
            :loading="loading"
          >
            刷新數據
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 統計卡片區域保持不變 -->

    <!-- 圖表區域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :lg="16" :md="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>員工出勤趨勢</span>
              <el-radio-group v-model="attendancePeriod" size="small">
                <el-radio-button value="week">本週</el-radio-button>
                <el-radio-button value="month">本月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <v-chart class="chart" :option="attendanceOption" autoresize />
          </div>
        </el-card>
      </el-col>
      
      <el-col :lg="8" :md="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>部門人數分布</span>
            </div>
          </template>
          <div class="chart-container">
            <v-chart class="chart" :option="departmentOption" autoresize />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加新的圖表行 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :lg="12" :md="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>收入支出分析</span>
              <el-select v-model="financeYear" size="small" style="width: 120px">
                <el-option label="2024年" value="2024" />
                <el-option label="2023年" value="2023" />
              </el-select>
            </div>
          </template>
          <div class="chart-container">
            <v-chart class="chart" :option="financeOption" autoresize />
          </div>
        </el-card>
      </el-col>
      
      <el-col :lg="12" :md="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>客戶轉化漏斗</span>
            </div>
          </template>
          <div class="chart-container">
            <v-chart class="chart" :option="funnelOption" autoresize />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import type { EChartsOption } from 'echarts'
import { Download, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ExcelJS from 'exceljs'

// 時間週期選擇
const attendancePeriod = ref('week')

// 出勤趨勢圖表配置
const attendanceOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['出勤人數', '請假人數', '遲到人數']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: attendancePeriod.value === 'week' 
      ? ['週一', '週二', '週三', '週四', '週五', '週六', '週日']
      : Array.from({length: 30}, (_, i) => `${i + 1}日`)
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '出勤人數',
      type: 'line',
      smooth: true,
      data: [120, 132, 101, 134, 90, 230, 210]
    },
    {
      name: '請假人數',
      type: 'line',
      smooth: true,
      data: [5, 3, 8, 4, 6, 2, 3]
    },
    {
      name: '遲到人數',
      type: 'line',
      smooth: true,
      data: [3, 4, 2, 5, 3, 2, 1]
    }
  ]
}))

// 部門分布圖表配置
const departmentOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: '部門分布',
      type: 'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '16',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 35, name: '研發部' },
        { value: 20, name: '銷售部' },
        { value: 15, name: '市場部' },
        { value: 25, name: '運營部' },
        { value: 10, name: '行政部' }
      ]
    }
  ]
}))

// 添加財務年份選擇
const financeYear = ref('2024')

// 財務分析圖表配置
const financeOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: {
        color: '#999'
      }
    }
  },
  legend: {
    data: ['收入', '支出', '利潤率']
  },
  xAxis: [
    {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisPointer: {
        type: 'shadow'
      }
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: '金額',
      min: 0,
      max: 250,
      interval: 50,
      axisLabel: {
        formatter: '{value}萬'
      }
    },
    {
      type: 'value',
      name: '利潤率',
      min: 0,
      max: 100,
      interval: 20,
      axisLabel: {
        formatter: '{value}%'
      }
    }
  ],
  series: [
    {
      name: '收入',
      type: 'bar',
      data: [150, 180, 220, 190, 250, 280]
    },
    {
      name: '支出',
      type: 'bar',
      data: [100, 120, 160, 140, 180, 200]
    },
    {
      name: '利潤率',
      type: 'line',
      yAxisIndex: 1,
      data: [33.3, 33.3, 27.3, 26.3, 28.0, 28.6]
    }
  ]
}))

// 客戶轉化漏斗圖表配置
const funnelOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c}'
  },
  legend: {
    top: 'bottom'
  },
  series: [
    {
      name: '轉化漏斗',
      type: 'funnel',
      left: '10%',
      top: 60,
      bottom: 60,
      width: '80%',
      min: 0,
      max: 100,
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: {
        show: true,
        position: 'inside'
      },
      labelLine: {
        length: 10,
        lineStyle: {
          width: 1,
          type: 'solid'
        }
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1
      },
      emphasis: {
        label: {
          fontSize: 20
        }
      },
      data: [
        { value: 100, name: '訪問' },
        { value: 80, name: '諮詢' },
        { value: 60, name: '意向' },
        { value: 40, name: '報價' },
        { value: 20, name: '成交' }
      ]
    }
  ]
}))

// 添加狀態
const exporting = ref(false)
const loading = ref(false)
const lastUpdateTime = ref(new Date())

// 格式化時間
const formatTime = (date: Date) => {
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 刷新數據
const refreshData = async () => {
  if (loading.value) return
  
  try {
    loading.value = true
    // TODO: 實現實際的數據刷新邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))
    lastUpdateTime.value = new Date()
    ElMessage.success('數據已更新')
  } catch (error) {
    ElMessage.error('數據更新失敗')
  } finally {
    loading.value = false
  }
}

// 導出數據
const exportData = async () => {
  try {
    exporting.value = true
    
    // 創建工作簿
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('統計數據')
    
    // 設置列
    worksheet.columns = [
      { header: '項目', key: 'item', width: 15 },
      { header: '數值', key: 'value', width: 15 },
      { header: '備註', key: 'note', width: 20 }
    ]
    
    // 添加數據
    worksheet.addRows([
      {
        item: '員工總數',
        value: stats.employeeCount,
        note: `較上月${stats.employeeGrowth > 0 ? '+' : ''}${stats.employeeGrowth}%`
      },
      {
        item: '出勤人數',
        value: stats.attendance.present,
        note: `請假${stats.attendance.leave}人，遲到${stats.attendance.late}人`
      },
      {
        item: '本月收入',
        value: stats.finance.income,
        note: `較上月${stats.finance.growth > 0 ? '+' : ''}${stats.finance.growth}%`
      },
      {
        item: '客戶跟進',
        value: stats.crm.totalLeads,
        note: `待跟進${stats.crm.pending}個，已成交${stats.crm.closed}個`
      }
    ])
    
    // 設置樣式
    worksheet.getRow(1).font = { bold: true }
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
      })
    })
    
    // 生成文件名
    const fileName = `OA系統報表_${formatTime(new Date()).replace(/[/:]/g, '')}.xlsx`
    
    // 生成並下載文件
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('報表導出成功')
  } catch (error) {
    console.error('導出失敗：', error)
    ElMessage.error('報表導出失敗')
  } finally {
    exporting.value = false
  }
}

// 添加統計數據
const stats = reactive({
  employeeCount: 156,
  employeeGrowth: 3,
  attendance: {
    present: 142,
    leave: 8,
    late: 6
  },
  finance: {
    income: 1234567,
    growth: 12.5
  },
  crm: {
    totalLeads: 45,
    pending: 28,
    closed: 17
  }
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 400px;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart {
  height: 100%;
  width: 100%;
}

/* 添加頂部操作區樣式 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  gap: 10px;
}

.update-time {
  color: #909399;
  font-size: 14px;
}
</style> 