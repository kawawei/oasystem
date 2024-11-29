<template>
  <div class="expense-container">
    <!-- 頁面標題和操作按鈕 -->
    <div class="page-header">
      <h2>支出管理</h2>
      <div class="header-operations">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增支出
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>導出
        </el-button>
      </div>
    </div>

    <!-- 搜索區域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="支出類型">
          <el-select v-model="searchForm.type" placeholder="請選擇" clearable>
            <el-option label="薪資支出" value="salary" />
            <el-option label="租金支出" value="rent" />
            <el-option label="水電費" value="utility" />
            <el-option label="設備採購" value="equipment" />
            <el-option label="其他支出" value="other" />
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
        <el-form-item label="金額範圍">
          <el-input-number 
            v-model="searchForm.minAmount" 
            placeholder="最小金額"
            :min="0"
          />
          <span class="range-separator">-</span>
          <el-input-number 
            v-model="searchForm.maxAmount" 
            placeholder="最大金額"
            :min="0"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 支出列表 -->
    <el-card>
      <el-table :data="expenseList" style="width: 100%" v-loading="loading">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="type" label="支出類型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金額" width="150">
          <template #default="{ row }">
            {{ formatAmount(row.amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="payee" label="收款方" width="180" />
        <el-table-column prop="paymentMethod" label="支付方式" width="120">
          <template #default="{ row }">
            <el-tag :type="getPaymentMethodTag(row.paymentMethod)">
              {{ getPaymentMethodText(row.paymentMethod) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="備註" show-overflow-tooltip />
        <el-table-column prop="recorder" label="記錄人" width="120" />
        <el-table-column prop="createTime" label="記錄時間" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">
              編輯
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDelete(scope.row)"
            >
              刪除
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

    <!-- 支出編輯對話框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增支出' : '編輯支出'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="支出類型" prop="type">
          <el-select v-model="form.type" placeholder="請選擇">
            <el-option label="薪資支出" value="salary" />
            <el-option label="租金支出" value="rent" />
            <el-option label="水電費" value="utility" />
            <el-option label="設備採購" value="equipment" />
            <el-option label="其他支出" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="���期" prop="date">
          <el-date-picker 
            v-model="form.date"
            type="date"
            placeholder="選擇日期"
          />
        </el-form-item>
        <el-form-item label="金額" prop="amount">
          <el-input-number 
            v-model="form.amount"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="收款方" prop="payee">
          <el-input v-model="form.payee" />
        </el-form-item>
        <el-form-item label="支付方式" prop="paymentMethod">
          <el-select v-model="form.paymentMethod" placeholder="請選擇">
            <el-option label="現金" value="cash" />
            <el-option label="銀行轉帳" value="transfer" />
            <el-option label="信用卡" value="credit" />
          </el-select>
        </el-form-item>
        <el-form-item label="備註" prop="remark">
          <el-input 
            v-model="form.remark"
            type="textarea"
            rows="3"
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
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

// 加載狀態
const loading = ref(false)

// 分頁相關
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索表單
const searchForm = reactive({
  type: '',
  dateRange: [] as string[],
  minAmount: null as number | null,
  maxAmount: null as number | null
})

// 對話框相關
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive({
  id: '',
  type: '',
  date: '',
  amount: 0,
  payee: '',
  paymentMethod: '',
  remark: ''
})

// 表單驗證規則
const rules = {
  type: [
    { required: true, message: '請選擇支出類型', trigger: 'change' }
  ],
  date: [
    { required: true, message: '請選擇日期', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '請輸入金額', trigger: 'blur' }
  ],
  payee: [
    { required: true, message: '請輸入收款方', trigger: 'blur' }
  ],
  paymentMethod: [
    { required: true, message: '請選擇支付方式', trigger: 'change' }
  ]
}

// 支出列表
const expenseList = ref([
  {
    id: 1,
    date: '2024-01-20',
    type: 'rent',
    amount: 50000,
    payee: '某某房東',
    paymentMethod: 'transfer',
    remark: '1月份辦公室租金',
    recorder: '張三',
    createTime: '2024-01-20 10:00:00'
  }
])

// 獲取類型標籤
const getTypeTag = (type: string) => {
  const map: Record<string, string> = {
    salary: 'danger',
    rent: 'warning',
    utility: 'info',
    equipment: 'success',
    other: ''
  }
  return map[type] || ''
}

// 獲取類型文字
const getTypeText = (type: string) => {
  const map: Record<string, string> = {
    salary: '薪資支出',
    rent: '租金支出',
    utility: '水電費',
    equipment: '設備採購',
    other: '其他支出'
  }
  return map[type] || '未知'
}

// 獲取支付方式標籤
const getPaymentMethodTag = (method: string) => {
  const map: Record<string, string> = {
    cash: '',
    transfer: 'success',
    credit: 'warning'
  }
  return map[method] || ''
}

// 獲取支付方式文字
const getPaymentMethodText = (method: string) => {
  const map: Record<string, string> = {
    cash: '現金',
    transfer: '銀行轉帳',
    credit: '信用卡'
  }
  return map[method] || '未知'
}

// 格式化金額
const formatAmount = (amount: number) => {
  return `NT$ ${amount.toLocaleString()}`
}

// 新增支出
const handleAdd = () => {
  dialogType.value = 'add'
  form.id = ''
  form.type = ''
  form.date = ''
  form.amount = 0
  form.payee = ''
  form.paymentMethod = ''
  form.remark = ''
  dialogVisible.value = true
}

// 編輯支出
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 刪除支出
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '確定要刪除該筆支出記錄嗎？',
      '警告',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    // TODO: 實現刪除邏輯
    ElMessage.success('刪除成功')
  } catch {
    // 用戶取消操作
  }
}

// 提交表單
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    // TODO: 實現保存邏輯
    ElMessage.success(dialogType.value === 'add' ? '新增成功' : '更新成功')
    dialogVisible.value = false
  } catch (error) {
    console.error('表單驗證失敗：', error)
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
  searchForm.dateRange = []
  searchForm.minAmount = null
  searchForm.maxAmount = null
  handleSearch()
}

// 導出
const handleExport = () => {
  // TODO: 實現導出邏輯
  ElMessage.success('導出成功')
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
.expense-container {
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

.search-card {
  margin-bottom: 20px;
}

.range-separator {
  margin: 0 10px;
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