<template>
  <div class="users-container">
    <!-- 頁面標題和操作按鈕 -->
    <div class="page-header">
      <h2>用戶管理</h2>
      <div class="header-operations">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增用戶
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>導出
        </el-button>
      </div>
    </div>

    <!-- 搜索區域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用戶名">
          <el-input v-model="searchForm.username" placeholder="請輸入用戶名" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="請輸入姓名" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="請選擇" clearable>
            <el-option label="管理員" value="admin" />
            <el-option label="普通用戶" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用戶列表 -->
    <el-card>
      <el-table :data="userList" style="width: 100%" v-loading="loading">
        <el-table-column prop="username" label="用戶名" width="180" />
        <el-table-column prop="name" label="姓名" width="180" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
              {{ row.role === 'admin' ? '管理員' : '普通用戶' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="郵箱" width="200" />
        <el-table-column prop="phone" label="電話" width="150" />
        <el-table-column prop="createTime" label="創建時間" width="180" />
        <el-table-column prop="status" label="狀態" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
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

    <!-- 用戶對話框 -->
    <user-dialog
      v-model="dialogVisible"
      :type="dialogType"
      :form-data="formData"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download } from '@element-plus/icons-vue'
import UserDialog from '../components/UserDialog.vue'

// 加載狀態
const loading = ref(false)

// 分頁相關
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索表單
const searchForm = reactive({
  username: '',
  name: '',
  role: ''
})

// 對話框相關
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formData = reactive({
  username: '',
  name: '',
  role: '',
  email: '',
  phone: '',
  password: '',
  status: 1
})

// 用戶列表
const userList = ref([
  {
    id: 1,
    username: 'admin',
    name: '管理員',
    role: 'admin',
    email: 'admin@example.com',
    phone: '0912345678',
    createTime: '2024-01-15 10:00:00',
    status: 1
  }
])

// 新增用戶
const handleAdd = () => {
  dialogType.value = 'add'
  Object.assign(formData, {
    username: '',
    name: '',
    role: '',
    email: '',
    phone: '',
    password: '',
    status: 1
  })
  dialogVisible.value = true
}

// 編輯用戶
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  Object.assign(formData, {
    ...row,
    password: ''
  })
  dialogVisible.value = true
}

// 刪除用戶
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '確定要刪除該用戶嗎？此操作不可恢復',
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

// 修改狀態
const handleStatusChange = async (row: any) => {
  try {
    loading.value = true
    // TODO: 實現狀態修改邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('狀態修改成功')
  } catch (error) {
    ElMessage.error('狀態修改失敗')
    row.status = row.status === 1 ? 0 : 1 // 回滾狀態
  } finally {
    loading.value = false
  }
}

// 對話框成功回調
const handleDialogSuccess = () => {
  dialogVisible.value = false
  handleSearch()
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
  searchForm.username = ''
  searchForm.name = ''
  searchForm.role = ''
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
.users-container {
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
</style> 