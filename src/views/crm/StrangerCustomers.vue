<template>
  <div class="stranger-customers-container">
    <!-- 頁面標題和操作按鈕 -->
    <div class="page-header">
      <h2>陌生客戶</h2>
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
        <el-form-item label="電話">
          <el-input v-model="searchForm.phone" placeholder="請輸入電話" />
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="searchForm.status" placeholder="請選擇" clearable>
            <el-option 
              v-for="status in settingsStore.statusList"
              :key="status.id"
              :label="status.name"
              :value="status.id"
            >
              <el-tag :color="status.color" style="color: #fff">
                {{ status.name }}
              </el-tag>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="城市">
          <el-select 
            v-model="searchForm.cityId" 
            placeholder="請選擇" 
            clearable
            @change="handleCityChange"
          >
            <el-option 
              v-for="city in settingsStore.cityList"
              :key="city.id"
              :label="city.name"
              :value="city.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="區域" v-if="searchForm.cityId">
          <el-select v-model="searchForm.areaId" placeholder="請選擇" clearable>
            <el-option 
              v-for="area in currentAreas"
              :key="area.id"
              :label="area.name"
              :value="area.id"
            >
              <span>{{ area.name }}</span>
              <span v-if="getSalesByArea(area.id)" style="color: #909399; margin-left: 8px">
                ({{ getSalesByArea(area.id)?.name }})
              </span>
            </el-option>
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
        <el-table-column prop="id" label="序號" width="80" />
        <el-table-column label="狀態" width="120">
          <template #default="{ row }">
            <el-select 
              v-model="row.statusId" 
              size="small"
              @change="handleCellChange(row)"
            >
              <el-option 
                v-for="status in settingsStore.statusList"
                :key="status.id"
                :label="status.name"
                :value="status.id"
              >
                <el-tag :color="status.color" style="color: #fff">
                  {{ status.name }}
                </el-tag>
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="補習班名稱" width="180">
          <template #default="{ row }">
            <el-input 
              v-model="row.name" 
              size="small"
              @blur="handleCellChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="電話" width="150">
          <template #default="{ row }">
            <div class="phone-cell">
              <el-input 
                v-model="row.phone" 
                size="small"
                @blur="handleCellChange(row)"
              />
              <el-button 
                type="success" 
                size="small" 
                circle
                @click="handleCallLog(row)"
              >
                <el-icon><Phone /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="地區" width="250">
          <template #default="{ row }">
            <div class="area-cell">
              <el-select 
                v-model="row.cityId" 
                size="small"
                @change="handleCityChangeForRow(row)"
              >
                <el-option 
                  v-for="city in settingsStore.cityList"
                  :key="city.id"
                  :label="city.name"
                  :value="city.id"
                />
              </el-select>
              <el-select 
                v-model="row.areaId" 
                size="small"
                @change="handleCellChange(row)"
              >
                <el-option 
                  v-for="area in getAreasByCity(row.cityId)"
                  :key="area.id"
                  :label="area.name"
                  :value="area.id"
                />
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="詳細地址">
          <template #default="{ row }">
            <el-input 
              v-model="row.address" 
              size="small"
              @blur="handleCellChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="Email" width="180">
          <template #default="{ row }">
            <el-input 
              v-model="row.email" 
              size="small"
              @blur="handleCellChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="備註">
          <template #default="{ row }">
            <el-input 
              v-model="row.remark" 
              size="small"
              @blur="handleCellChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="通話記錄" width="100" fixed="right">
          <template #default="{ row }">
            <el-button 
              size="small"
              @click="showCallHistory(row)"
            >
              查看記錄
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
        <el-form-item label="補習班名稱" prop="name">
          <el-input v-model="formData.name" placeholder="請輸入補習班名稱" />
        </el-form-item>
        <el-form-item label="電話" prop="phone">
          <el-input v-model="formData.phone" placeholder="請輸入電話" />
        </el-form-item>
        <el-form-item label="狀態" prop="statusId">
          <el-select v-model="formData.statusId" placeholder="請選擇">
            <el-option 
              v-for="status in settingsStore.statusList"
              :key="status.id"
              :label="status.name"
              :value="status.id"
            >
              <el-tag :color="status.color" style="color: #fff">
                {{ status.name }}
              </el-tag>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="城市" prop="cityId">
          <el-select 
            v-model="formData.cityId" 
            placeholder="請選擇"
            @change="handleFormCityChange"
          >
            <el-option 
              v-for="city in settingsStore.cityList"
              :key="city.id"
              :label="city.name"
              :value="city.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="區域" prop="areaId" v-if="formData.cityId">
          <el-select v-model="formData.areaId" placeholder="請選擇">
            <el-option 
              v-for="area in formAreas"
              :key="area.id"
              :label="area.name"
              :value="area.id"
            >
              <span>{{ area.name }}</span>
              <span v-if="getSalesByArea(area.id)" style="color: #909399; margin-left: 8px">
                ({{ getSalesByArea(area.id)?.name }})
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="詳細地址" prop="address">
          <el-input v-model="formData.address" placeholder="請輸入詳細地址" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="formData.email" placeholder="請輸入Email" />
        </el-form-item>
        <el-form-item label="備註" prop="remark">
          <el-input 
            v-model="formData.remark" 
            type="textarea"
            rows="3"
            placeholder="請輸入備註"
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

    <!-- 添加通話記錄對話框 -->
    <el-dialog
      title="添加通話記錄"
      v-model="callLogDialog.visible"
      width="500px"
    >
      <el-form
        ref="callLogFormRef"
        :model="callLogDialog.form"
        :rules="callLogRules"
        label-width="100px"
      >
        <el-form-item label="通話時間" prop="callTime">
          <el-date-picker
            v-model="callLogDialog.form.callTime"
            type="datetime"
            placeholder="選擇通話時間"
          />
        </el-form-item>
        <el-form-item label="通話結果" prop="result">
          <el-select v-model="callLogDialog.form.result">
            <el-option label="未接通" value="no_answer" />
            <el-option label="已接通" value="connected" />
            <el-option label="拒接" value="rejected" />
            <el-option label="空號" value="invalid" />
          </el-select>
        </el-form-item>
        <el-form-item label="通話內容" prop="content">
          <el-input
            v-model="callLogDialog.form.content"
            type="textarea"
            rows="4"
            placeholder="請輸入通話內容"
          />
        </el-form-item>
        <el-form-item label="下次跟進" prop="nextFollowUp">
          <el-date-picker
            v-model="callLogDialog.form.nextFollowUp"
            type="datetime"
            placeholder="選擇下次跟進時間"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="callLogDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleCallLogSubmit">
            確定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 通話歷史記錄對話框 -->
    <el-dialog
      title="通話歷史記錄"
      v-model="callHistoryDialog.visible"
      width="800px"
    >
      <el-timeline>
        <el-timeline-item
          v-for="log in callHistoryDialog.logs"
          :key="log.id"
          :timestamp="log.callTime"
          :type="getCallResultType(log.result)"
        >
          <h4>{{ getCallResultText(log.result) }}</h4>
          <p>{{ log.content }}</p>
          <p v-if="log.nextFollowUp" class="follow-up-time">
            下次跟進時間：{{ log.nextFollowUp }}
          </p>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Phone } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { useSettingsStore } from '../../stores/settings'

const settingsStore = useSettingsStore()

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
  status: '',
  cityId: '',
  areaId: ''
})

// 對話框相關
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()

// 表單數據
const formData = reactive({
  name: '',
  phone: '',
  statusId: '',
  cityId: '',
  areaId: '',
  address: '',
  email: '',
  remark: ''
})

// 通話記錄對話框
const callLogDialog = reactive({
  visible: false,
  customerId: null as number | null,
  form: {
    callTime: new Date(),
    result: '',
    content: '',
    nextFollowUp: null as Date | null
  }
})

// 通話歷史記錄對話框
const callHistoryDialog = reactive({
  visible: false,
  logs: [] as any[]
})

// 通話記錄驗證規則
const callLogRules = {
  callTime: [
    { required: true, message: '請選擇通話時間', trigger: 'change' }
  ],
  result: [
    { required: true, message: '請選擇通話結果', trigger: 'change' }
  ],
  content: [
    { required: true, message: '請輸入通話內容', trigger: 'blur' }
  ]
}

// 模擬客戶數據
const customerList = ref([
  {
    id: 1,
    statusId: 1,
    name: '測試補習班',
    phone: '02-12345678',
    cityId: 1,
    areaId: 1,
    address: '信義路五段7號',
    email: 'test@example.com',
    remark: '初次拜訪'
  }
])

// 獲取區域列表
const getAreasByCity = (cityId: number) => {
  return settingsStore.getAreasByCity(cityId)
}

// 獲取業務人員
const getSalesByArea = (areaId: number) => {
  return settingsStore.getSalesByArea(areaId)
}

// 處理單元格變更
const handleCellChange = async (row: any) => {
  try {
    // TODO: 實現保存邏輯
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失敗')
  }
}

// 處理城市變更（行級別）
const handleCityChangeForRow = (row: any) => {
  row.areaId = ''
  handleCellChange(row)
}

// 添加通話記錄
const handleCallLog = (row: any) => {
  callLogDialog.customerId = row.id
  callLogDialog.form = {
    callTime: new Date(),
    result: '',
    content: '',
    nextFollowUp: null
  }
  callLogDialog.visible = true
}

// 提交通話記錄
const handleCallLogSubmit = async () => {
  try {
    // TODO: 實現保存通話記錄的邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))
    callLogDialog.visible = false
    ElMessage.success('記錄已保存')
  } catch (error) {
    ElMessage.error('保存失敗')
  }
}

// 查看通話歷史
const showCallHistory = async (row: any) => {
  try {
    // TODO: 獲取通話歷史記錄
    callHistoryDialog.logs = [
      {
        id: 1,
        callTime: '2024-01-15 14:30:00',
        result: 'connected',
        content: '客戶表示有意願了解更多',
        nextFollowUp: '2024-01-20 10:00:00'
      }
    ]
    callHistoryDialog.visible = true
  } catch (error) {
    ElMessage.error('獲取歷史記錄失敗')
  }
}

// 獲取通話結果類型
const getCallResultType = (result: string) => {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'danger'> = {
    no_answer: 'warning',
    connected: 'success',
    rejected: 'danger',
    invalid: 'info'
  }
  return map[result] || 'info'
}

// 獲取通話結果文字
const getCallResultText = (result: string) => {
  const map: Record<string, string> = {
    no_answer: '未接通',
    connected: '已接通',
    rejected: '拒接',
    invalid: '空號'
  }
  return map[result] || '未知'
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
  searchForm.status = ''
  searchForm.cityId = ''
  searchForm.areaId = ''
  handleSearch()
}
</script>

<style scoped>
.stranger-customers-container {
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

.phone-cell {
  display: flex;
  align-items: center;
}

.area-cell {
  display: flex;
  align-items: center;
}

.follow-up-time {
  color: #909399;
  font-size: 0.8em;
}
</style> 