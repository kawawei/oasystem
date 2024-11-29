<template>
  <div class="salary-container">
    <!-- 頁面標題和操作按鈕 -->
    <div class="page-header">
      <h2>薪資管理</h2>
      <div class="header-operations">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增薪資發放
        </el-button>
        <el-button type="success" @click="handleBatchAdd">
          <el-icon><Plus /></el-icon>批量發放
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>導出
        </el-button>
      </div>
    </div>

    <!-- 搜索區域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="發放月份">
          <el-date-picker
            v-model="searchForm.month"
            type="month"
            placeholder="選擇月份"
            format="YYYY年MM月"
          />
        </el-form-item>
        <el-form-item label="員工姓名">
          <el-input v-model="searchForm.employeeName" placeholder="請輸入員工姓名" />
        </el-form-item>
        <el-form-item label="部門">
          <el-select v-model="searchForm.department" placeholder="請選擇" clearable>
            <el-option label="行政部" value="admin" />
            <el-option label="業務部" value="sales" />
            <el-option label="教學部" value="teaching" />
          </el-select>
        </el-form-item>
        <el-form-item label="發放狀態">
          <el-select v-model="searchForm.status" placeholder="請選擇" clearable>
            <el-option label="待發放" value="pending" />
            <el-option label="已發放" value="paid" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 薪資列表 -->
    <el-card>
      <el-table :data="salaryList" style="width: 100%" v-loading="loading">
        <el-table-column prop="month" label="發放月份" width="120" />
        <el-table-column prop="employeeName" label="員工姓名" width="120" />
        <el-table-column prop="department" label="部門" width="120" />
        <el-table-column prop="basicSalary" label="基本薪資" width="120">
          <template #default="{ row }">
            {{ formatAmount(row.basicSalary) }}
          </template>
        </el-table-column>
        <el-table-column prop="bonus" label="獎金" width="120">
          <template #default="{ row }">
            {{ formatAmount(row.bonus) }}
          </template>
        </el-table-column>
        <el-table-column prop="deduction" label="扣除項" width="120">
          <template #default="{ row }">
            {{ formatAmount(row.deduction) }}
          </template>
        </el-table-column>
        <el-table-column prop="total" label="實發金額" width="120">
          <template #default="{ row }">
            {{ formatAmount(row.total) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="狀態" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paymentDate" label="發放日期" width="120" />
        <el-table-column prop="remark" label="備註" show-overflow-tooltip />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 'pending'"
              size="small" 
              type="success"
              @click="handlePay(scope.row)"
            >
              發放
            </el-button>
            <el-button size="small" @click="handleEdit(scope.row)">
              編輯
            </el-button>
            <el-button 
              v-if="scope.row.status === 'pending'"
              size="small" 
              type="danger" 
              @click="handleCancel(scope.row)"
            >
              取消
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

    <!-- 薪資編輯對話框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增薪資發放' : '編輯薪資發放'"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="發放月份" prop="month">
          <el-date-picker
            v-model="form.month"
            type="month"
            placeholder="選擇月份"
            format="YYYY年MM月"
          />
        </el-form-item>
        <el-form-item label="員工" prop="employeeId">
          <el-select 
            v-model="form.employeeId"
            placeholder="請選擇員工"
            @change="handleEmployeeChange"
          >
            <el-option
              v-for="employee in employeeList"
              :key="employee.id"
              :label="employee.name"
              :value="employee.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="基本薪資" prop="basicSalary">
          <el-input-number 
            v-model="form.basicSalary"
            :min="0"
            :precision="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="獎金" prop="bonus">
          <el-input-number 
            v-model="form.bonus"
            :min="0"
            :precision="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="扣除項" prop="deduction">
          <el-input-number 
            v-model="form.deduction"
            :min="0"
            :precision="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="發放日期" prop="paymentDate">
          <el-date-picker 
            v-model="form.paymentDate"
            type="date"
            placeholder="選擇日期"
          />
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

    <!-- 批量發放對話框 -->
    <el-dialog
      title="批量薪資發放"
      v-model="batchDialog.visible"
      width="700px"
    >
      <el-form
        ref="batchFormRef"
        :model="batchDialog.form"
        :rules="batchRules"
        label-width="100px"
      >
        <el-form-item label="發放月份" prop="month">
          <el-date-picker
            v-model="batchDialog.form.month"
            type="month"
            placeholder="選擇月份"
            format="YYYY年MM月"
          />
        </el-form-item>
        <el-form-item label="發放日期" prop="paymentDate">
          <el-date-picker 
            v-model="batchDialog.form.paymentDate"
            type="date"
            placeholder="選擇日期"
          />
        </el-form-item>
        <el-form-item label="選擇員工" prop="employees">
          <el-table
            :data="employeeList"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="department" label="部門" width="120" />
            <el-table-column prop="position" label="職位" width="120" />
            <el-table-column prop="basicSalary" label="基本薪資">
              <template #default="{ row }">
                {{ formatAmount(row.basicSalary) }}
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleBatchSubmit">確定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
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
  month: '',
  employeeName: '',
  department: '',
  status: ''
})

// 對話框相關
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive({
  id: '',
  month: '',
  employeeId: '',
  basicSalary: 0,
  bonus: 0,
  deduction: 0,
  paymentDate: '',
  remark: ''
})

// 批量發放對話框
const batchDialog = reactive({
  visible: false,
  form: {
    month: '',
    paymentDate: '',
    employees: [] as any[]
  }
})

// 表單驗證規則
const rules = {
  month: [
    { required: true, message: '請選擇發放月份', trigger: 'change' }
  ],
  employeeId: [
    { required: true, message: '請選擇員工', trigger: 'change' }
  ],
  basicSalary: [
    { required: true, message: '請輸入基本薪資', trigger: 'blur' }
  ],
  paymentDate: [
    { required: true, message: '請選擇發放日期', trigger: 'change' }
  ]
}

// 批量發放表單驗證規則
const batchRules = {
  month: [
    { required: true, message: '請選擇發放月份', trigger: 'change' }
  ],
  paymentDate: [
    { required: true, message: '請選擇發放日期', trigger: 'change' }
  ],
  employees: [
    { required: true, message: '請選擇員工', trigger: 'change' }
  ]
}

// 薪資列表
const salaryList = ref([
  {
    id: 1,
    month: '2024-01',
    employeeName: '張三',
    department: '業務部',
    basicSalary: 35000,
    bonus: 5000,
    deduction: 2000,
    total: 38000,
    status: 'pending',
    paymentDate: '2024-01-05',
    remark: ''
  }
])

// 員工列表
const employeeList = ref([
  {
    id: 1,
    name: '張三',
    department: '業務部',
    position: '業務經理',
    basicSalary: 35000
  }
])

// 計算實發金額
const calculateTotal = computed(() => {
  return form.basicSalary + form.bonus - form.deduction
})

// 獲取狀態類型
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    paid: 'success',
    cancelled: 'info'
  }
  return map[status] || ''
}

// 獲取狀態文字
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待發放',
    paid: '已發放',
    cancelled: '已取消'
  }
  return map[status] || '未知'
}

// 格式化金額
const formatAmount = (amount: number) => {
  return `NT$ ${amount.toLocaleString()}`
}

// 新增薪資
const handleAdd = () => {
  dialogType.value = 'add'
  form.id = ''
  form.month = ''
  form.employeeId = ''
  form.basicSalary = 0
  form.bonus = 0
  form.deduction = 0
  form.paymentDate = ''
  form.remark = ''
  dialogVisible.value = true
}

// 批量發放
const handleBatchAdd = () => {
  batchDialog.form.month = ''
  batchDialog.form.paymentDate = ''
  batchDialog.form.employees = []
  batchDialog.visible = true
}

// 編輯薪資
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 發放薪資
const handlePay = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '確定要發放該筆薪資嗎？',
      '提示',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    // TODO: 實現發放邏輯
    ElMessage.success('發放成功')
  } catch {
    // 用戶取消操作
  }
}

// 取消薪資
const handleCancel = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '確定要取消該筆薪資嗎？',
      '警告',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    // TODO: 實現取消邏輯
    ElMessage.success('取消成功')
  } catch {
    // 用戶取消操作
  }
}

// 員工選擇變更
const handleEmployeeChange = (employeeId: number) => {
  const employee = employeeList.value.find(e => e.id === employeeId)
  if (employee) {
    form.basicSalary = employee.basicSalary
  }
}

// 批量選擇變更
const handleSelectionChange = (selection: any[]) => {
  batchDialog.form.employees = selection
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

// 提交批量發放
const handleBatchSubmit = async () => {
  if (!batchDialog.form.employees.length) {
    ElMessage.warning('請選擇要發放薪資的員工')
    return
  }
  
  try {
    // TODO: 實現批量發放邏輯
    ElMessage.success('批量發放成功')
    batchDialog.visible = false
  } catch (error) {
    console.error('批量發放失敗：', error)
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
  searchForm.month = ''
  searchForm.employeeName = ''
  searchForm.department = ''
  searchForm.status = ''
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
.salary-container {
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