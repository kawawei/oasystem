<template>
  <div class="leave-container">
    <!-- 頁面標題和操作按鈕 -->
    <div class="page-header">
      <h2>請假管理</h2>
      <el-button type="primary" @click="handleApplyLeave">
        <el-icon><Plus /></el-icon>申請請假
      </el-button>
    </div>

    <!-- 搜索區域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="請假類型">
          <el-select v-model="searchForm.type" placeholder="請選擇" clearable>
            <el-option label="事假" value="personal" />
            <el-option label="病假" value="sick" />
            <el-option label="年假" value="annual" />
            <el-option label="婚假" value="marriage" />
          </el-select>
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="searchForm.status" placeholder="請選擇" clearable>
            <el-option label="待審批" value="pending" />
            <el-option label="已通過" value="approved" />
            <el-option label="已拒絕" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期範圍">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 請假列表 -->
    <el-card>
      <el-table :data="leaveList" style="width: 100%" v-loading="loading">
        <el-table-column prop="type" label="請假類型" width="120">
          <template #default="{ row }">
            <el-tag :type="getLeaveTypeTag(row.type)">
              {{ getLeaveTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="開始日期" width="180" />
        <el-table-column prop="endDate" label="結束日期" width="180" />
        <el-table-column prop="days" label="天數" width="100" />
        <el-table-column prop="reason" label="請假原因" show-overflow-tooltip />
        <el-table-column prop="status" label="狀態" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 'pending'"
              size="small" 
              type="danger" 
              @click="handleCancel(scope.row)"
            >
              取消申請
            </el-button>
            <el-button 
              size="small"
              @click="handleDetail(scope.row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 請假申請對話框 -->
    <el-dialog
      :title="dialogType === 'add' ? '申請請假' : '請假詳情'"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        :disabled="dialogType === 'view'"
      >
        <el-form-item label="請假類型" prop="type">
          <el-select v-model="formData.type" placeholder="請選擇請假類型">
            <el-option label="事假" value="personal" />
            <el-option label="病假" value="sick" />
            <el-option label="年假" value="annual" />
            <el-option label="婚假" value="marriage" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="請假時間" prop="dateRange">
          <el-date-picker
            v-model="formData.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
            value-format="YYYY-MM-DD"
            @change="calculateDays"
          />
        </el-form-item>

        <el-form-item label="請假天數">
          <span>{{ formData.days }} 天</span>
        </el-form-item>
        
        <el-form-item label="請假原因" prop="reason">
          <el-input
            v-model="formData.reason"
            type="textarea"
            rows="4"
            placeholder="請輸入請假原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">
            {{ dialogType === 'view' ? '關閉' : '取消' }}
          </el-button>
          <el-button 
            v-if="dialogType === 'add'"
            type="primary" 
            @click="handleSubmit"
            :loading="submitting"
          >
            提交申請
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

// 加載狀態
const loading = ref(false)
const submitting = ref(false)

// 分頁相關
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索表單
const searchForm = reactive({
  type: '',
  status: '',
  dateRange: []
})

// 對話框相關
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'view'>('add')
const formRef = ref<FormInstance>()

// 表單數據
const formData = reactive({
  type: '',
  dateRange: [],
  days: 0,
  reason: ''
})

// 表單驗證規則
const rules = {
  type: [
    { required: true, message: '請選擇請假類型', trigger: 'change' }
  ],
  dateRange: [
    { required: true, message: '請選擇請假時間', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '請輸入請假原因', trigger: 'blur' },
    { min: 5, message: '請假原因不能少於5個字符', trigger: 'blur' }
  ]
}

// 模擬請假數據
const leaveList = ref([
  {
    id: 1,
    type: 'annual',
    startDate: '2024-01-20',
    endDate: '2024-01-22',
    days: 3,
    reason: '回家探親',
    status: 'approved'
  },
  {
    id: 2,
    type: 'sick',
    startDate: '2024-01-15',
    endDate: '2024-01-16',
    days: 2,
    reason: '感冒發燒',
    status: 'pending'
  }
])

// 獲取請假類型標籤樣式
const getLeaveTypeTag = (type: string) => {
  const map: Record<string, string> = {
    personal: 'info',
    sick: 'danger',
    annual: 'success',
    marriage: 'warning'
  }
  return map[type] || 'info'
}

// 獲取請假類型標籤文字
const getLeaveTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    personal: '事假',
    sick: '病假',
    annual: '年假',
    marriage: '婚假'
  }
  return map[type] || '其他'
}

// 獲取狀態標籤樣式
const getStatusTag = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

// 獲取狀態標籤文字
const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: '待審批',
    approved: '已通過',
    rejected: '已拒絕'
  }
  return map[status] || '未知'
}

// 計算請假天數
const calculateDays = () => {
  if (formData.dateRange?.length === 2) {
    const start = new Date(formData.dateRange[0])
    const end = new Date(formData.dateRange[1])
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    formData.days = days
  } else {
    formData.days = 0
  }
}

// 搜索
const handleSearch = () => {
  loading.value = true
  // TODO: 實現搜索邏輯
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

// 重置搜索
const resetSearch = () => {
  searchForm.type = ''
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
}

// 申請請假
const handleApplyLeave = () => {
  dialogType.value = 'add'
  formData.type = ''
  formData.dateRange = []
  formData.days = 0
  formData.reason = ''
  dialogVisible.value = true
}

// 查看詳情
const handleDetail = (row: any) => {
  dialogType.value = 'view'
  Object.assign(formData, {
    type: row.type,
    dateRange: [row.startDate, row.endDate],
    days: row.days,
    reason: row.reason
  })
  dialogVisible.value = true
}

// 取消申請
const handleCancel = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '確定要取消該請假申請嗎？',
      '提示',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    loading.value = true
    // TODO: 實現取消邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('取消成功')
    handleSearch()
  } catch {
    // 用戶取消操作
  } finally {
    loading.value = false
  }
}

// 提交申請
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    submitting.value = true
    await formRef.value.validate()
    // TODO: 實現提交邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('申請提交成功')
    dialogVisible.value = false
    handleSearch()
  } catch (error) {
    console.error('表單驗證失敗：', error)
  } finally {
    submitting.value = false
  }
}

// 處理分頁
const handleSizeChange = (val: number) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  handleSearch()
}
</script>

<style scoped>
.leave-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 