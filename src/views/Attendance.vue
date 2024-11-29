<template>
  <div class="attendance-container">
    <!-- 頁面標題和切換按鈕 -->
    <div class="page-header">
      <h2>出缺勤管理</h2>
      <el-radio-group v-model="activeTab" size="large">
        <el-radio-button value="dashboard">數據總覽</el-radio-button>
        <el-radio-button value="schedule">排班管理</el-radio-button>
        <el-radio-button value="record">出缺勤記錄</el-radio-button>
        <el-radio-button value="leave">請假審批</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 數據總覽頁籤 -->
    <div v-if="activeTab === 'dashboard'">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="stat-header">
                <span>今日出勤</span>
              </div>
            </template>
            <div class="stat-content">
              <h3>95%</h3>
              <div class="stat-detail">
                <span>應到: 100人</span>
                <span>實到: 95人</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="stat-header">
                <span>請假人數</span>
              </div>
            </template>
            <div class="stat-content">
              <h3>3人</h3>
              <div class="stat-detail">
                <span>病假: 1人</span>
                <span>事假: 2人</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="stat-header">
                <span>遲到人數</span>
              </div>
            </template>
            <div class="stat-content">
              <h3>2人</h3>
              <div class="stat-detail">
                <span>30分鐘內: 2人</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <template #header>
              <div class="stat-header">
                <span>早退人數</span>
              </div>
            </template>
            <div class="stat-content">
              <h3>0人</h3>
              <div class="stat-detail">
                <span>正常下班: 100%</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 圖表區域 -->
      <el-row :gutter="20" class="chart-row">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>出勤趨勢</span>
                <el-radio-group v-model="chartPeriod" size="small">
                  <el-radio-button value="week">週</el-radio-button>
                  <el-radio-button value="month">月</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container" ref="attendanceChartRef"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>請假分析</span>
              </div>
            </template>
            <div class="chart-container" ref="leaveChartRef"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 排班管理頁籤 -->
    <div v-if="activeTab === 'schedule'">
      <el-card>
        <template #header>
          <div class="schedule-header">
            <el-date-picker
              v-model="currentMonth"
              type="month"
              format="YYYY年MM月"
              @change="handleMonthChange"
            />
            <div class="schedule-actions">
              <el-button type="primary" @click="handleBatchSchedule">
                批量排班
              </el-button>
              <el-button @click="handleExportSchedule">
                導出排班表
              </el-button>
            </div>
          </div>
        </template>
        
        <el-calendar v-model="currentDate">
          <template #dateCell="{ data }">
            <div class="calendar-cell">
              <p class="date">{{ data.day.split('-')[2] }}</p>
              <div class="schedule-info" @click="handleScheduleClick(data)">
                <template v-if="getScheduleInfo(data)">
                  <div class="schedule-count">
                    已排班: {{ getScheduleInfo(data).count }}人
                  </div>
                </template>
                <template v-else>
                  <div class="no-schedule">未排班</div>
                </template>
              </div>
            </div>
          </template>
        </el-calendar>
      </el-card>
    </div>

    <!-- 出缺勤記錄頁籤 -->
    <div v-if="activeTab === 'record'">
      <el-card>
        <!-- 搜索區域 -->
        <div class="search-area">
          <el-form :inline="true" :model="recordSearchForm">
            <el-form-item label="員工">
              <el-select v-model="recordSearchForm.employeeId" placeholder="請選擇" clearable>
                <el-option
                  v-for="employee in employeeList"
                  :key="employee.id"
                  :label="employee.name"
                  :value="employee.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="日期">
              <el-date-picker
                v-model="recordSearchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="開始日期"
                end-placeholder="結束日期"
              />
            </el-form-item>
            <el-form-item label="狀態">
              <el-select v-model="recordSearchForm.status" placeholder="請選擇" clearable>
                <el-option label="正常" value="normal" />
                <el-option label="遲到" value="late" />
                <el-option label="早退" value="early" />
                <el-option label="缺勤" value="absent" />
                <el-option label="請假" value="leave" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleRecordSearch">搜索</el-button>
              <el-button @click="resetRecordSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 出缺勤記錄表格 -->
        <el-table :data="attendanceRecords" style="width: 100%" v-loading="recordLoading">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="employeeName" label="員工姓名" width="120" />
          <el-table-column prop="checkIn" label="上班時間" width="120" />
          <el-table-column prop="checkOut" label="下班時間" width="120" />
          <el-table-column label="狀態" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="duration" label="工作時長" width="120" />
          <el-table-column prop="remark" label="備註" show-overflow-tooltip />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button 
                size="small"
                @click="handleRecordDetail(scope.row)"
              >
                詳情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分頁 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="recordCurrentPage"
            v-model:page-size="recordPageSize"
            :total="recordTotal"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next"
            @size-change="handleRecordSizeChange"
            @current-change="handleRecordCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 請假審批頁籤 -->
    <div v-if="activeTab === 'leave'">
      <el-card>
        <!-- 搜索區域 -->
        <div class="search-area">
          <el-form :inline="true" :model="leaveSearchForm">
            <el-form-item label="申請人">
              <el-select v-model="leaveSearchForm.employeeId" placeholder="請選擇" clearable>
                <el-option
                  v-for="employee in employeeList"
                  :key="employee.id"
                  :label="employee.name"
                  :value="employee.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="請假類型">
              <el-select v-model="leaveSearchForm.type" placeholder="請選擇" clearable>
                <el-option label="事假" value="personal" />
                <el-option label="病假" value="sick" />
                <el-option label="年假" value="annual" />
                <el-option label="調休" value="compensatory" />
              </el-select>
            </el-form-item>
            <el-form-item label="狀態">
              <el-select v-model="leaveSearchForm.status" placeholder="請選擇" clearable>
                <el-option label="待審批" value="pending" />
                <el-option label="已通過" value="approved" />
                <el-option label="已拒絕" value="rejected" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleLeaveSearch">搜索</el-button>
              <el-button @click="resetLeaveSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 請假申請表格 -->
        <el-table :data="leaveRecords" style="width: 100%" v-loading="leaveLoading">
          <el-table-column prop="employeeName" label="申請人" width="120" />
          <el-table-column prop="type" label="請假類型" width="100">
            <template #default="{ row }">
              <el-tag>{{ getLeaveTypeText(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="startDate" label="開始時間" width="180" />
          <el-table-column prop="endDate" label="結束時間" width="180" />
          <el-table-column prop="duration" label="請假時長" width="120" />
          <el-table-column prop="reason" label="請假原因" show-overflow-tooltip />
          <el-table-column label="狀態" width="100">
            <template #default="{ row }">
              <el-tag :type="getLeaveStatusType(row.status)">
                {{ getLeaveStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="applyTime" label="申請時間" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button 
                v-if="scope.row.status === 'pending'"
                size="small"
                type="success"
                @click="handleApprove(scope.row)"
              >
                通過
              </el-button>
              <el-button 
                v-if="scope.row.status === 'pending'"
                size="small"
                type="danger"
                @click="handleReject(scope.row)"
              >
                拒絕
              </el-button>
              <el-button 
                size="small"
                @click="handleLeaveDetail(scope.row)"
              >
                詳情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分頁 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="leaveCurrentPage"
            v-model:page-size="leavePageSize"
            :total="leaveTotal"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next"
            @size-change="handleLeaveSizeChange"
            @current-change="handleLeaveCurrentChange"
          />
        </div>
      </el-card>

      <!-- 請假詳情對話框 -->
      <el-dialog
        title="請假詳情"
        v-model="leaveDetailDialog.visible"
        width="600px"
      >
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申請人">
            {{ leaveDetailDialog.data?.employeeName }}
          </el-descriptions-item>
          <el-descriptions-item label="請假類型">
            {{ getLeaveTypeText(leaveDetailDialog.data?.type) }}
          </el-descriptions-item>
          <el-descriptions-item label="開始時間">
            {{ leaveDetailDialog.data?.startDate }}
          </el-descriptions-item>
          <el-descriptions-item label="結束時間">
            {{ leaveDetailDialog.data?.endDate }}
          </el-descriptions-item>
          <el-descriptions-item label="請假時長">
            {{ leaveDetailDialog.data?.duration }}
          </el-descriptions-item>
          <el-descriptions-item label="狀態">
            <el-tag :type="getLeaveStatusType(leaveDetailDialog.data?.status)">
              {{ getLeaveStatusText(leaveDetailDialog.data?.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="請假原因" :span="2">
            {{ leaveDetailDialog.data?.reason }}
          </el-descriptions-item>
          <el-descriptions-item label="申請時間" :span="2">
            {{ leaveDetailDialog.data?.applyTime }}
          </el-descriptions-item>
          <el-descriptions-item 
            v-if="leaveDetailDialog.data?.rejectReason"
            label="拒絕原因" 
            :span="2"
          >
            {{ leaveDetailDialog.data?.rejectReason }}
          </el-descriptions-item>
        </el-descriptions>
      </el-dialog>

      <!-- 拒絕原因對話框 -->
      <el-dialog
        title="請輸入拒絕原因"
        v-model="rejectDialog.visible"
        width="500px"
      >
        <el-form
          ref="rejectFormRef"
          :model="rejectDialog.form"
          :rules="rejectRules"
        >
          <el-form-item prop="reason">
            <el-input
              v-model="rejectDialog.form.reason"
              type="textarea"
              rows="3"
              placeholder="請輸入拒絕原因"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="rejectDialog.visible = false">取消</el-button>
            <el-button type="primary" @click="handleRejectSubmit">
              確定
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>

    <!-- 批量排班對話框 -->
    <el-dialog
      title="批量排班"
      v-model="scheduleDialog.visible"
      width="500px"
    >
      <el-form
        ref="scheduleFormRef"
        :model="scheduleDialog.form"
        :rules="scheduleRules"
        label-width="100px"
      >
        <el-form-item label="日期範圍" prop="dateRange">
          <el-date-picker
            v-model="scheduleDialog.form.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
          />
        </el-form-item>
        <el-form-item label="班別" prop="shiftType">
          <el-select v-model="scheduleDialog.form.shiftType">
            <el-option label="早班" value="morning" />
            <el-option label="中班" value="middle" />
            <el-option label="晚班" value="night" />
          </el-select>
        </el-form-item>
        <el-form-item label="選擇員工" prop="employees">
          <el-select
            v-model="scheduleDialog.form.employees"
            multiple
            placeholder="請選擇員工"
          >
            <el-option
              v-for="employee in employeeList"
              :key="employee.id"
              :label="employee.name"
              :value="employee.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="scheduleDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleScheduleSubmit">
            確定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import * as echarts from 'echarts'

// 當前激活的頁籤
const activeTab = ref('dashboard')

// 圖表相關
const chartPeriod = ref('week')
const attendanceChartRef = ref<HTMLElement>()
const leaveChartRef = ref<HTMLElement>()
let attendanceChart: echarts.ECharts | null = null
let leaveChart: echarts.ECharts | null = null

// 日期相關
const currentDate = ref(new Date())
const currentMonth = ref(new Date())

// 排班對話框
const scheduleDialog = reactive({
  visible: false,
  form: {
    dateRange: [] as Date[],
    shiftType: '',
    employees: [] as number[]
  }
})

// 排班表單驗證規則
const scheduleRules = {
  dateRange: [
    { required: true, message: '請選擇日期範圍', trigger: 'change' }
  ],
  shiftType: [
    { required: true, message: '請選擇班別', trigger: 'change' }
  ],
  employees: [
    { required: true, message: '請選擇員工', trigger: 'change' }
  ]
}

// 模擬員工數據
const employeeList = ref([
  { id: 1, name: '張三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
])

// 出缺勤記錄相關
const recordSearchForm = reactive({
  employeeId: '',
  dateRange: [] as string[],
  status: ''
})

const recordLoading = ref(false)
const recordCurrentPage = ref(1)
const recordPageSize = ref(10)
const recordTotal = ref(0)

// 模擬出缺勤記錄數據
const attendanceRecords = ref([
  {
    date: '2024-01-15',
    employeeName: '張三',
    checkIn: '09:00',
    checkOut: '18:00',
    status: 'normal',
    duration: '9小時',
    remark: ''
  }
])

// 獲取排班信息
const getScheduleInfo = (data: any) => {
  // TODO: 實現獲取排班信息的邏輯
  return null
}

// 處理月份變更
const handleMonthChange = (date: Date) => {
  // TODO: 實現月份變更邏輯
}

// 處理排班點擊
const handleScheduleClick = async (data: any) => {
  try {
    const result = await ElMessageBox.prompt('請輸入排班人數', '排班', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      inputPattern: /^[1-9]\d*$/,
      inputErrorMessage: '請輸入有效的人數'
    })
    
    if (result.action === 'confirm') {
      // TODO: 實現排班邏輯
      ElMessage.success(`已為 ${data.day} 安排 ${result.value} 人排班`)
    }
  } catch {
    // 用戶取消操作
  }
}

// 批量排班
const handleBatchSchedule = () => {
  scheduleDialog.form.dateRange = []
  scheduleDialog.form.shiftType = ''
  scheduleDialog.form.employees = []
  scheduleDialog.visible = true
}

// 提交排班
const handleScheduleSubmit = async () => {
  // TODO: 實現排班提交邏輯
  ElMessage.success('排班成功')
  scheduleDialog.visible = false
}

// 導出排班表
const handleExportSchedule = () => {
  // TODO: 實現導出邏輯
  ElMessage.success('導出成功')
}

// 獲取狀態類型
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    normal: 'success',
    late: 'warning',
    early: 'warning',
    absent: 'danger',
    leave: 'info'
  }
  return map[status] || 'info'
}

// 獲取狀態文字
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    normal: '正常',
    late: '遲到',
    early: '早退',
    absent: '缺勤',
    leave: '請假'
  }
  return map[status] || '未知'
}

// 搜索記錄
const handleRecordSearch = () => {
  recordLoading.value = true
  // TODO: 實現搜索邏輯
  setTimeout(() => {
    recordLoading.value = false
  }, 500)
}

// 重置搜索
const resetRecordSearch = () => {
  recordSearchForm.employeeId = ''
  recordSearchForm.dateRange = []
  recordSearchForm.status = ''
  handleRecordSearch()
}

// 查看詳情
const handleRecordDetail = async (row: any) => {
  try {
    await ElMessageBox.alert(
      `
        <div>員工：${row.employeeName}</div>
        <div>日期：${row.date}</div>
        <div>上班時間：${row.checkIn}</div>
        <div>下班時間：${row.checkOut}</div>
        <div>工作時長：${row.duration}</div>
        <div>狀態：${getStatusText(row.status)}</div>
        <div>備註：${row.remark || '無'}</div>
      `,
      '考勤詳情',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '關閉'
      }
    )
  } catch {
    // 用戶關閉對話框
  }
}

// 處理分頁
const handleRecordSizeChange = (val: number) => {
  recordPageSize.value = val
  handleRecordSearch()
}

const handleRecordCurrentChange = (val: number) => {
  recordCurrentPage.value = val
  handleRecordSearch()
}

// 添加請假審批相關代碼
const leaveSearchForm = reactive({
  employeeId: '',
  type: '',
  status: ''
})

const leaveLoading = ref(false)
const leaveCurrentPage = ref(1)
const leavePageSize = ref(10)
const leaveTotal = ref(0)

// 請假記錄
const leaveRecords = ref([
  {
    id: 1,
    employeeName: '張三',
    type: 'personal',
    startDate: '2024-01-15 09:00:00',
    endDate: '2024-01-16 18:00:00',
    duration: '2天',
    reason: '家中有事',
    status: 'pending',
    applyTime: '2024-01-14 10:00:00'
  }
])

// 請假詳情對話框
const leaveDetailDialog = reactive({
  visible: false,
  data: null as any
})

// 拒絕對話框
const rejectDialog = reactive({
  visible: false,
  form: {
    reason: ''
  },
  currentId: null as number | null
})

// 拒絕原因驗證規則
const rejectRules = {
  reason: [
    { required: true, message: '請輸入拒絕原因', trigger: 'blur' }
  ]
}

// 獲取請假類型文字
const getLeaveTypeText = (type: string) => {
  const map: Record<string, string> = {
    personal: '事假',
    sick: '病假',
    annual: '年假',
    compensatory: '調休'
  }
  return map[type] || '未知'
}

// 獲取請假狀態類型
const getLeaveStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

// 獲取請假狀態文字
const getLeaveStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待審批',
    approved: '已通過',
    rejected: '已拒絕'
  }
  return map[status] || '未知'
}

// 搜索請假記錄
const handleLeaveSearch = () => {
  leaveLoading.value = true
  // TODO: 實現搜索邏輯
  setTimeout(() => {
    leaveLoading.value = false
  }, 500)
}

// 重置搜索
const resetLeaveSearch = () => {
  leaveSearchForm.employeeId = ''
  leaveSearchForm.type = ''
  leaveSearchForm.status = ''
  handleLeaveSearch()
}

// 查看詳情
const handleLeaveDetail = (row: any) => {
  leaveDetailDialog.data = row
  leaveDetailDialog.visible = true
}

// 通過請假申請
const handleApprove = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '確定要通過該請假申請嗎？',
      '提示',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    leaveLoading.value = true
    // TODO: 實現審批通過邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('審批通過')
    handleLeaveSearch()
  } catch {
    // 用戶取消操作
  } finally {
    leaveLoading.value = false
  }
}

// 拒絕請假申請
const handleReject = (row: any) => {
  rejectDialog.currentId = row.id
  rejectDialog.form.reason = ''
  rejectDialog.visible = true
}

// 提交拒絕原因
const handleRejectSubmit = async () => {
  if (!rejectDialog.form.reason.trim()) {
    ElMessage.warning('請輸入拒絕原因')
    return
  }
  
  try {
    leaveLoading.value = true
    // TODO: 實現拒絕邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('已拒絕該請假申請')
    rejectDialog.visible = false
    handleLeaveSearch()
  } catch (error) {
    ElMessage.error('操作失敗')
  } finally {
    leaveLoading.value = false
  }
}

// 處理分頁
const handleLeaveSizeChange = (val: number) => {
  leavePageSize.value = val
  handleLeaveSearch()
}

const handleLeaveCurrentChange = (val: number) => {
  leaveCurrentPage.value = val
  handleLeaveSearch()
}

// 初始化圖表
onMounted(() => {
  if (attendanceChartRef.value) {
    attendanceChart = echarts.init(attendanceChartRef.value)
    updateAttendanceChart()
  }
  
  if (leaveChartRef.value) {
    leaveChart = echarts.init(leaveChartRef.value)
    updateLeaveChart()
  }
})

// 更新出勤趨勢圖表
const updateAttendanceChart = () => {
  const option = {
    title: {
      text: '出勤趨勢'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['出勤率', '遲到率', '早退率']
    },
    xAxis: {
      type: 'category',
      data: ['週一', '週二', '週三', '週四', '週五']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '出勤率',
        type: 'line',
        data: [95, 93, 97, 94, 96]
      },
      {
        name: '遲到率',
        type: 'line',
        data: [3, 5, 2, 4, 3]
      },
      {
        name: '早退率',
        type: 'line',
        data: [2, 2, 1, 2, 1]
      }
    ]
  }
  
  attendanceChart?.setOption(option)
}

// 更新請假分析圖表
const updateLeaveChart = () => {
  const option = {
    title: {
      text: '請假類型分布'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: [
          { value: 5, name: '事假' },
          { value: 3, name: '病假' },
          { value: 2, name: '年假' },
          { value: 1, name: '調休' }
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
  
  leaveChart?.setOption(option)
}

// 監聽圖表週期變化
watch(chartPeriod, () => {
  updateAttendanceChart()
})
</script>

<style scoped>
.attendance-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-content {
  text-align: center;
}

.stat-detail {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
  color: #606266;
  font-size: 14px;
}

.chart-row {
  margin-top: 20px;
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

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.schedule-actions {
  display: flex;
  gap: 10px;
}

.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.date {
  text-align: center;
  margin: 0;
}

.schedule-info {
  padding: 4px;
  cursor: pointer;
}

.schedule-count {
  text-align: center;
  color: #409EFF;
  font-size: 12px;
}

.no-schedule {
  text-align: center;
  color: #909399;
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.search-area {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style> 