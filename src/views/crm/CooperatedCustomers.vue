<template>
  <div class="cooperated-customers-container">
    <!-- 頁面標題和操作按鈕 -->
    <div class="page-header">
      <h2>已合作客戶</h2>
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
        <el-form-item label="補習班名稱">
          <el-input v-model="searchForm.name" placeholder="請輸入補習班名稱" />
        </el-form-item>
        <el-form-item label="合作狀態">
          <el-select v-model="searchForm.status" placeholder="請選擇" clearable>
            <el-option label="已合作" value="current" />
            <el-option label="未來合作" value="future" />
          </el-select>
        </el-form-item>
        <el-form-item label="課程類型">
          <el-select v-model="searchForm.courseType" placeholder="請選擇" clearable>
            <el-option 
              v-for="type in courseTypes"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="合作時間">
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

    <!-- 客戶列表 -->
    <el-card>
      <el-table :data="customerList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="序號" width="80" />
        <el-table-column label="合作狀態" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'current' ? 'success' : 'warning'">
              {{ row.status === 'current' ? '已合作' : '未來合作' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="補習班名稱" width="180" />
        <el-table-column prop="contact" label="聯絡人" width="120" />
        <el-table-column prop="phone" label="電話" width="120" />
        <el-table-column prop="address" label="地址" show-overflow-tooltip />
        <el-table-column prop="lastCourse" label="最近課程" width="180" show-overflow-tooltip />
        <el-table-column prop="nextCourse" label="下次課程" width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button 
              size="small"
              @click="handleViewCourses(scope.row)"
            >
              課程記錄
            </el-button>
            <el-button 
              size="small"
              type="primary" 
              @click="handleAddCourse(scope.row)"
            >
              新增課程
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

    <!-- 課程記錄對話框 -->
    <el-dialog
      title="課程記錄"
      v-model="courseHistoryDialog.visible"
      width="80%"
      destroy-on-close
    >
      <el-tabs v-model="courseHistoryDialog.activeTab">
        <el-tab-pane label="歷史課程" name="history">
          <el-table :data="courseHistoryDialog.historyCourses">
            <el-table-column prop="term" label="學期" width="120" />
            <el-table-column prop="name" label="課程名稱" width="150" />
            <el-table-column prop="startDate" label="開始日期" width="120" />
            <el-table-column prop="endDate" label="結束日期" width="120" />
            <el-table-column prop="totalSessions" label="總堂數" width="100" />
            <el-table-column prop="studentCount" label="學生數" width="100" />
            <el-table-column prop="hourlyRate" label="鐘點費" width="120">
              <template #default="{ row }">
                {{ row.hourlyRate }} 元/小時
              </template>
            </el-table-column>
            <el-table-column prop="materialFee" label="材料費" width="120">
              <template #default="{ row }">
                {{ row.materialFee }} 元/人
              </template>
            </el-table-column>
            <el-table-column prop="textbook" label="使用教材" show-overflow-tooltip />
            <el-table-column prop="remark" label="備註" show-overflow-tooltip />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="未來課程" name="future">
          <el-table :data="courseHistoryDialog.futureCourses">
            <el-table-column prop="term" label="學期" width="120" />
            <el-table-column prop="name" label="課程名稱" width="150" />
            <el-table-column prop="startDate" label="開始日期" width="120" />
            <el-table-column prop="endDate" label="結束日期" width="120" />
            <el-table-column prop="totalSessions" label="總堂數" width="100" />
            <el-table-column prop="studentCount" label="學生數" width="100" />
            <el-table-column prop="hourlyRate" label="鐘點費" width="120">
              <template #default="{ row }">
                {{ row.hourlyRate }} 元/小時
              </template>
            </el-table-column>
            <el-table-column prop="materialFee" label="材料費" width="120">
              <template #default="{ row }">
                {{ row.materialFee }} 元/人
              </template>
            </el-table-column>
            <el-table-column prop="textbook" label="使用教材" show-overflow-tooltip />
            <el-table-column prop="remark" label="備註" show-overflow-tooltip />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 新增/編輯課程對話框 -->
    <el-dialog
      :title="courseDialog.type === 'add' ? '新增課程' : '編輯課程'"
      v-model="courseDialog.visible"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="courseFormRef"
        :model="courseDialog.form"
        :rules="courseRules"
        label-width="100px"
      >
        <el-form-item label="學期" prop="term">
          <el-select v-model="courseDialog.form.term">
            <el-option label="2024春季班" value="2024-spring" />
            <el-option label="2024暑假班" value="2024-summer" />
            <el-option label="2024秋季班" value="2024-fall" />
            <el-option label="2024冬季班" value="2024-winter" />
          </el-select>
        </el-form-item>
        <el-form-item label="課程名稱" prop="name">
          <el-input v-model="courseDialog.form.name" />
        </el-form-item>
        <el-form-item label="開始日期" prop="startDate">
          <el-date-picker 
            v-model="courseDialog.form.startDate"
            type="date"
            placeholder="選擇日期"
          />
        </el-form-item>
        <el-form-item label="結束日期" prop="endDate">
          <el-date-picker 
            v-model="courseDialog.form.endDate"
            type="date"
            placeholder="選擇日期"
          />
        </el-form-item>
        <el-form-item label="總堂數" prop="totalSessions">
          <el-input-number 
            v-model="courseDialog.form.totalSessions"
            :min="1"
          />
        </el-form-item>
        <el-form-item label="學生數" prop="studentCount">
          <el-input-number 
            v-model="courseDialog.form.studentCount"
            :min="1"
          />
        </el-form-item>
        <el-form-item label="鐘點費" prop="hourlyRate">
          <el-input-number 
            v-model="courseDialog.form.hourlyRate"
            :min="0"
            :precision="0"
          />
          <span class="form-tip">元/小時</span>
        </el-form-item>
        <el-form-item label="材料費" prop="materialFee">
          <el-input-number 
            v-model="courseDialog.form.materialFee"
            :min="0"
            :precision="0"
          />
          <span class="form-tip">元/人</span>
        </el-form-item>
        <el-form-item label="使用教材" prop="textbook">
          <el-input 
            v-model="courseDialog.form.textbook"
            type="textarea"
            rows="2"
          />
        </el-form-item>
        <el-form-item label="備註" prop="remark">
          <el-input 
            v-model="courseDialog.form.remark"
            type="textarea"
            rows="2"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="courseDialog.visible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleCourseSubmit"
            :loading="courseDialog.submitting"
          >
            確定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
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
  name: '',
  status: '',
  courseType: '',
  dateRange: [] as string[]
})

// 課程類型
const courseTypes = ref([
  { id: 1, name: '魔術課程' },
  { id: 2, name: '科學課程' },
  { id: 3, name: '美術課程' }
])

// 客戶列表
const customerList = ref([
  {
    id: 1,
    status: 'current',
    name: '測試補習班',
    contact: '張三',
    phone: '02-12345678',
    address: '台北市信義區信義路五段7號',
    lastCourse: '2023暑假班-魔術課程',
    nextCourse: '2024暑假班-進階魔術課程'
  }
])

// 課程記錄對話框
const courseHistoryDialog = reactive({
  visible: false,
  activeTab: 'history',
  historyCourses: [],
  futureCourses: []
})

// 課程對話框
const courseDialog = reactive({
  visible: false,
  type: 'add',
  submitting: false,
  form: {
    term: '',
    name: '',
    startDate: '',
    endDate: '',
    totalSessions: 1,
    studentCount: 1,
    hourlyRate: 0,
    materialFee: 0,
    textbook: '',
    remark: ''
  }
})

// 課程表單驗證規則
const courseRules = {
  term: [{ required: true, message: '請選擇學期', trigger: 'change' }],
  name: [{ required: true, message: '請輸入課程名稱', trigger: 'blur' }],
  startDate: [{ required: true, message: '請選擇開始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '請選擇結束日期', trigger: 'change' }],
  totalSessions: [{ required: true, message: '請輸入總堂數', trigger: 'change' }],
  studentCount: [{ required: true, message: '請輸入學生數', trigger: 'change' }],
  hourlyRate: [{ required: true, message: '請輸入鐘點費', trigger: 'change' }]
}

// 初始化數據
onMounted(() => {
  handleSearch()
})

// 搜索
const handleSearch = () => {
  loading.value = true
  // TODO: 實現搜索邏輯
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.status = ''
  searchForm.courseType = ''
  searchForm.dateRange = []
  handleSearch()
}

// 新增客戶
const handleAdd = () => {
  // TODO: 實現新增客戶邏輯
}

// 導出
const handleExport = () => {
  // TODO: 實現導出邏輯
}

// 查看課程記錄
const handleViewCourses = (row: any) => {
  courseHistoryDialog.historyCourses = [
    {
      term: '2023暑假班',
      name: '魔術課程',
      startDate: '2023-07-01',
      endDate: '2023-08-31',
      totalSessions: 16,
      studentCount: 20,
      hourlyRate: 1000,
      materialFee: 500,
      textbook: '基礎魔術教材',
      remark: '反應良好'
    }
  ]
  courseHistoryDialog.futureCourses = [
    {
      term: '2024暑假班',
      name: '進階魔術課程',
      startDate: '2024-07-01',
      endDate: '2024-08-31',
      totalSessions: 16,
      studentCount: 15,
      hourlyRate: 1200,
      materialFee: 600,
      textbook: '進階魔術教材',
      remark: '預約確認'
    }
  ]
  courseHistoryDialog.visible = true
}

// 新增課程
const handleAddCourse = (row: any) => {
  courseDialog.type = 'add'
  courseDialog.form = {
    term: '',
    name: '',
    startDate: '',
    endDate: '',
    totalSessions: 1,
    studentCount: 1,
    hourlyRate: 0,
    materialFee: 0,
    textbook: '',
    remark: ''
  }
  courseDialog.visible = true
}

// 提交課程
const handleCourseSubmit = async () => {
  try {
    courseDialog.submitting = true
    // TODO: 實現課程保存邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('保存成功')
    courseDialog.visible = false
    handleViewCourses({ id: 1 }) // 重新加載課程記錄
  } catch (error) {
    ElMessage.error('保存失敗')
  } finally {
    courseDialog.submitting = false
  }
}

// 刪除客戶
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('確定要刪除該客戶嗎？', '警告', {
      type: 'warning'
    })
    // TODO: 實現刪除邏輯
    ElMessage.success('刪除成功')
    handleSearch()
  } catch {
    // 用戶取消操作
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
.cooperated-customers-container {
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

.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}
</style> 