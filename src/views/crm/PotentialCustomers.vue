<template>
  <div class="potential-customers-container">
    <!-- 頁面標題和操作按鈕 -->
    <div class="page-header">
      <h2>潛在客戶</h2>
      <div class="header-operations">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增客戶
        </el-button>
        <el-button type="primary" @click="handleBatchEmail">
          <el-icon><Message /></el-icon>批量發送郵件
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
        <el-form-item label="跟進時間">
          <el-date-picker
            v-model="searchForm.followUpRange"
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
      <el-table 
        :data="customerList" 
        style="width: 100%" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
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
        <el-table-column label="下次跟進" width="180">
          <template #default="{ row }">
            <el-date-picker
              v-model="row.nextFollowUp"
              type="datetime"
              size="small"
              placeholder="選擇時間"
              @change="handleCellChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="scope">
            <el-button 
              size="small"
              @click="showCallHistory(scope.row)"
            >
              通話記錄
            </el-button>
            <el-button 
              size="small"
              type="primary"
              @click="handleSendEmail(scope.row)"
            >
              發送郵件
            </el-button>
            <el-button 
              size="small" 
              type="success" 
              @click="handleConvert(scope.row)"
            >
              轉為合作
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
  </div>

  <!-- 通話記錄對話框 -->
  <el-dialog
    title="添加通話記錄"
    v-model="callLogDialog.visible"
    :destroy-on-close="true"
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
          <el-option label="需求確認" value="confirmed" />
          <el-option label="價格溝通" value="price_negotiation" />
          <el-option label="考慮中" value="considering" />
          <el-option label="拒絕" value="rejected" />
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
    :destroy-on-close="true"
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

  <!-- 郵件發送對話框 -->
  <el-dialog
    :title="emailDialog.type === 'single' ? '發送郵件' : '批量發送郵件'"
    v-model="emailDialog.visible"
    :destroy-on-close="true"
    width="700px"
  >
    <el-form
      ref="emailFormRef"
      :model="emailDialog.form"
      :rules="emailRules"
      label-width="100px"
    >
      <el-form-item label="發件人" prop="configId">
        <el-select v-model="emailDialog.form.configId">
          <el-option
            v-for="config in emailStore.configs"
            :key="config.id"
            :label="`${config.name} <${config.email}>`"
            :value="config.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="收件人">
        <div v-if="emailDialog.type === 'single'">
          {{ emailDialog.customerName }}
        </div>
        <div v-else>
          已選擇 {{ multipleSelection.length }} 位客戶
        </div>
      </el-form-item>
      <el-form-item label="郵件模板" prop="templateId">
        <el-select 
          v-model="emailDialog.form.templateId"
          @change="handleTemplateChange"
        >
          <el-option
            v-for="template in emailStore.templates"
            :key="template.id"
            :label="template.name"
            :value="template.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="主旨" prop="subject">
        <el-input v-model="emailDialog.form.subject" />
      </el-form-item>
      <el-form-item label="內容" prop="content">
        <el-input
          v-model="emailDialog.form.content"
          type="textarea"
          rows="10"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="emailDialog.visible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleEmailSubmit" 
          :loading="emailDialog.sending"
        >
          發送
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Phone, Message } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { useSettingsStore } from '../../stores/settings'
import { useEmailStore } from '../../stores/email'

const settingsStore = useSettingsStore()
const emailStore = useEmailStore()
const emailFormRef = ref<FormInstance>()

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
  areaId: '',
  followUpRange: [] as string[]
})

// 多選相關
const multipleSelection = ref<any[]>([])

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

// 郵件對話框
const emailDialog = reactive({
  visible: false,
  type: 'single' as 'single' | 'batch',
  customerName: '',
  customerId: null as number | null,
  sending: false,
  form: {
    configId: '',
    templateId: '',
    subject: '',
    content: ''
  }
})

// 客戶列表
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
    remark: '初次拜訪',
    nextFollowUp: new Date()
  }
])

// 當前選中城市的區域列表
const currentAreas = computed(() => {
  if (!searchForm.cityId) return []
  return settingsStore.getAreasByCity(searchForm.cityId)
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

// 郵件表單驗證規則
const emailRules = {
  configId: [
    { required: true, message: '請選擇發件人', trigger: 'change' }
  ],
  templateId: [
    { required: true, message: '請選擇郵件模板', trigger: 'change' }
  ],
  subject: [
    { required: true, message: '請輸入郵件主旨', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '請輸入郵件內容', trigger: 'blur' }
  ]
}

// 處理選擇變更
const handleSelectionChange = (val: any[]) => {
  multipleSelection.value = val
}

// 處理模板變更
const handleTemplateChange = () => {
  const template = emailStore.templates.find(t => t.id === emailDialog.form.templateId)
  if (template) {
    let subject = template.subject
    let content = template.content
    
    if (emailDialog.type === 'single') {
      subject = subject.replace('{{customerName}}', emailDialog.customerName)
      content = content.replace('{{customerName}}', emailDialog.customerName)
    }
    
    emailDialog.form.subject = subject
    emailDialog.form.content = content
  }
}

// 其他方法...
const handleSearch = () => {
  loading.value = true
  // TODO: 實現搜索邏輯
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  handleSearch()
}

const handleAdd = () => {
  // TODO: 實現添加邏輯
}

const handleExport = () => {
  // TODO: 實現導出邏輯
}

const handleBatchEmail = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('請先選擇客戶')
    return
  }
  
  emailDialog.type = 'batch'
  emailDialog.form = {
    configId: emailStore.getDefaultConfig()?.id || '',
    templateId: emailStore.getDefaultTemplate()?.id || '',
    subject: '',
    content: ''
  }
  emailDialog.visible = true
  handleTemplateChange()
}

const handleEmailSubmit = async () => {
  if (!emailFormRef.value) return
  
  try {
    await emailFormRef.value.validate()
    emailDialog.sending = true
    
    // TODO: 實現郵件發送邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('郵件發送成功')
    emailDialog.visible = false
  } catch (error) {
    console.error('郵件發送失敗：', error)
    ElMessage.error('郵件發送失敗')
  } finally {
    emailDialog.sending = false
  }
}

// 獲取區域列表
const getAreasByCity = (cityId: number) => {
  return settingsStore.getAreasByCity(cityId)
}

// 獲取業務人員
const getSalesByArea = (areaId: number) => {
  return settingsStore.getSalesByArea(areaId)
}
</script>

<style scoped>
.potential-customers-container {
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
  gap: 8px;
}

.area-cell {
  display: flex;
  gap: 8px;
}

:deep(.el-input__wrapper) {
  padding: 0 8px;
}

:deep(.el-input__inner) {
  height: 32px;
}
</style> 