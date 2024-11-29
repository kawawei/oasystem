<template>
  <div class="customers-container">
    <!-- 頁面標題和操作按鈕 -->
    <div class="page-header">
      <h2>客戶管理</h2>
      <div class="header-operations">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增客戶
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>導出
        </el-button>
      </div>
    </div>

    <!-- 搜索區域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="客戶名稱">
          <el-input v-model="searchForm.name" placeholder="請輸入客戶名稱" />
        </el-form-item>
        <el-form-item label="聯繫電話">
          <el-input v-model="searchForm.phone" placeholder="請輸入聯繫電話" />
        </el-form-item>
        <el-form-item label="客戶類型">
          <el-select v-model="searchForm.type" placeholder="請選擇" clearable>
            <el-option label="潛在客戶" value="potential" />
            <el-option label="正式客戶" value="formal" />
            <el-option label="VIP客戶" value="vip" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 客戶列表 -->
    <el-card>
      <el-table :data="customerList" style="width: 100%" v-loading="loading">
        <el-table-column prop="code" label="客戶編號" width="120" />
        <el-table-column prop="name" label="客戶名稱" width="180" />
        <el-table-column prop="contact" label="聯繫人" width="120" />
        <el-table-column prop="phone" label="聯繫電話" width="120" />
        <el-table-column prop="type" label="客戶類型" width="100">
          <template #default="{ row }">
            <el-tag :type="getCustomerTypeTag(row.type)">
              {{ getCustomerTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" show-overflow-tooltip />
        <el-table-column prop="createTime" label="創建時間" width="180" />
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

    <!-- 新增/編輯對話框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增客戶' : '編輯客戶'"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="客戶名稱" prop="name">
          <el-input v-model="formData.name" placeholder="請輸入客戶名稱" />
        </el-form-item>
        <el-form-item label="聯繫人" prop="contact">
          <el-input v-model="formData.contact" placeholder="請輸入聯繫人" />
        </el-form-item>
        <el-form-item label="聯繫電話" prop="phone">
          <el-input v-model="formData.phone" placeholder="請輸入聯繫電話" />
        </el-form-item>
        <el-form-item label="客戶類型" prop="type">
          <el-select v-model="formData.type" placeholder="請選擇">
            <el-option label="潛在客戶" value="potential" />
            <el-option label="正式客戶" value="formal" />
            <el-option label="VIP客戶" value="vip" />
          </el-select>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input 
            v-model="formData.address" 
            type="textarea"
            placeholder="請輸入地址"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            確定
          </el-button>
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
const submitting = ref(false)

// 分頁相關
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索表單
const searchForm = reactive({
  name: '',
  phone: '',
  type: ''
})

// 對話框相關
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()

// 表單數據
const formData = reactive({
  name: '',
  contact: '',
  phone: '',
  type: '',
  address: ''
})

// 表單驗證規則
const rules = {
  name: [
    { required: true, message: '請輸入客戶名稱', trigger: 'blur' },
    { min: 2, message: '長度不能小於2個字符', trigger: 'blur' }
  ],
  contact: [
    { required: true, message: '請輸入聯繫人', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '請輸入聯繫電話', trigger: 'blur' },
    { pattern: /^09\d{8}$/, message: '請輸入正確的手機號碼格式', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '請選擇客戶類型', trigger: 'change' }
  ]
}

// 模擬客戶數據
const customerList = ref([
  {
    id: 1,
    code: 'CUS001',
    name: '測試公司A',
    contact: '張三',
    phone: '0912345678',
    type: 'formal',
    address: '台北市信義區信義路五段7號',
    createTime: '2024-01-15 10:00:00'
  }
])

// 獲取客戶類型標籤樣式
const getCustomerTypeTag = (type: string) => {
  const map: Record<string, string> = {
    potential: 'info',
    formal: 'success',
    vip: 'warning'
  }
  return map[type] || 'info'
}

// 獲取客戶類型標籤文字
const getCustomerTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    potential: '潛在客戶',
    formal: '正式客戶',
    vip: 'VIP客戶'
  }
  return map[type] || '未知'
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
  searchForm.name = ''
  searchForm.phone = ''
  searchForm.type = ''
  handleSearch()
}

// 新增客戶
const handleAdd = () => {
  dialogType.value = 'add'
  formData.name = ''
  formData.contact = ''
  formData.phone = ''
  formData.type = ''
  formData.address = ''
  dialogVisible.value = true
}

// 編輯客戶
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 刪除客戶
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '確定要刪除該客戶嗎？刪除後無法恢復',
      '警告',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    loading.value = true
    // TODO: 實現刪除邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('刪除成功')
    handleSearch()
  } catch {
    // 用戶取消操作
  } finally {
    loading.value = false
  }
}

// 提交表單
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    submitting.value = true
    await formRef.value.validate()
    // TODO: 實現提交邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success(dialogType.value === 'add' ? '新增成功' : '編輯成功')
    dialogVisible.value = false
    handleSearch()
  } catch (error) {
    console.error('表單驗證失敗：', error)
  } finally {
    submitting.value = false
  }
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
.customers-container {
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