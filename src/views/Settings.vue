<template>
  <div class="settings-container">
    <el-tabs v-model="activeTab">
      <!-- 縣市區域管理 Tab -->
      <el-tab-pane label="縣市區域管理" name="area">
        <el-card>
          <template #header>
            <div class="card-header">
              <h3>縣市區域管理</h3>
              <div class="header-operations">
                <el-button type="primary" @click="handleAddCity">
                  <el-icon><Plus /></el-icon>新增縣市
                </el-button>
                <el-button type="success" @click="handleAddArea">
                  <el-icon><Plus /></el-icon>新增區域
                </el-button>
              </div>
            </div>
          </template>

          <!-- 縣市列表 -->
          <el-table :data="cityList" style="width: 100%" v-loading="loading">
            <el-table-column prop="name" label="縣市名稱" width="180" />
            <el-table-column label="區域" min-width="300">
              <template #default="{ row }">
                <el-tag 
                  v-for="area in row.areas"
                  :key="area.id"
                  class="area-tag"
                  closable
                  @close="handleDeleteArea(area)"
                >
                  {{ area.name }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="handleEditCity(scope.row)">
                  編輯
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="handleDeleteCity(scope.row)"
                >
                  刪除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 業務人員管理 Tab -->
      <el-tab-pane label="業務人員管理" name="sales">
        <el-card>
          <template #header>
            <div class="card-header">
              <h3>業務人員管理</h3>
              <el-button type="primary" @click="handleAddSales">
                <el-icon><Plus /></el-icon>新增業務人員
              </el-button>
            </div>
          </template>

          <!-- 業務人員列表 -->
          <el-table :data="salesList" style="width: 100%" v-loading="loading">
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="phone" label="電話" width="150" />
            <el-table-column prop="email" label="Email" width="200" />
            <el-table-column label="負責區域" min-width="300">
              <template #default="{ row }">
                <el-tag 
                  v-for="area in row.areas"
                  :key="area.id"
                  class="area-tag"
                >
                  {{ getCityAndAreaName(area) }}
                </el-tag>
                <el-button 
                  link 
                  type="primary" 
                  @click="handleAssignArea(row)"
                >
                  分配區域
                </el-button>
              </template>
            </el-table-column>
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
                <el-button size="small" @click="handleEditSales(scope.row)">
                  編輯
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="handleDeleteSales(scope.row)"
                >
                  刪除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 課程類型管理 Tab -->
      <el-tab-pane label="課程類型管理" name="course">
        <el-card>
          <template #header>
            <div class="card-header">
              <h3>課程類型管理</h3>
              <el-button type="primary" @click="handleAddCourseType">
                <el-icon><Plus /></el-icon>新增課程類型
              </el-button>
            </div>
          </template>

          <!-- 課程類型列表 -->
          <el-table :data="courseTypeList" style="width: 100%" v-loading="loading">
            <el-table-column prop="name" label="課程類型名稱" width="180" />
            <el-table-column prop="code" label="課程代碼" width="120" />
            <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
            <el-table-column label="狀態" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">
                  {{ row.status === 1 ? '啟用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort" label="排序" width="100" />
            <el-table-column label="操作" width="250" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="handleEditCourseType(scope.row)">
                  編輯
                </el-button>
                <el-button 
                  size="small"
                  :type="scope.row.status === 1 ? 'warning' : 'success'"
                  @click="handleToggleCourseType(scope.row)"
                >
                  {{ scope.row.status === 1 ? '停用' : '啟用' }}
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="handleDeleteCourseType(scope.row)"
                >
                  刪除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 系統參數設置 Tab -->
      <el-tab-pane label="系統參數設置" name="params">
        <el-card>
          <template #header>
            <div class="card-header">
              <h3>系統參數設置</h3>
              <el-button type="primary" @click="handleAddParam">
                <el-icon><Plus /></el-icon>新增參數
              </el-button>
            </div>
          </template>

          <!-- 參數分組 -->
          <el-tabs tab-position="left" class="param-tabs">
            <el-tab-pane label="基本設置" name="basic">
              <el-form :model="basicParams" label-width="120px">
                <el-form-item label="系統名稱">
                  <el-input v-model="basicParams.systemName" />
                </el-form-item>
                <el-form-item label="系統Logo">
                  <el-upload
                    class="logo-uploader"
                    action="#"
                    :show-file-list="false"
                    :before-upload="beforeLogoUpload"
                  >
                    <img v-if="basicParams.logo" :src="basicParams.logo" class="logo" />
                    <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
                  </el-upload>
                </el-form-item>
                <el-form-item label="聯繫電話">
                  <el-input v-model="basicParams.phone" />
                </el-form-item>
                <el-form-item label="聯繫郵箱">
                  <el-input v-model="basicParams.email" />
                </el-form-item>
                <el-form-item label="系統公告">
                  <el-input 
                    v-model="basicParams.announcement"
                    type="textarea"
                    rows="3"
                  />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="郵件設置" name="email">
              <el-form :model="emailParams" label-width="120px">
                <el-form-item label="SMTP服務器">
                  <el-input v-model="emailParams.smtpServer" />
                </el-form-item>
                <el-form-item label="SMTP端口">
                  <el-input v-model="emailParams.smtpPort" />
                </el-form-item>
                <el-form-item label="郵箱賬號">
                  <el-input v-model="emailParams.account" />
                </el-form-item>
                <el-form-item label="郵箱密碼">
                  <el-input v-model="emailParams.password" type="password" show-password />
                </el-form-item>
                <el-form-item label="發件人名稱">
                  <el-input v-model="emailParams.senderName" />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="其他參數" name="other">
              <el-table :data="otherParams" style="width: 100%">
                <el-table-column prop="key" label="參數名稱" width="180" />
                <el-table-column prop="value" label="參數值" min-width="200">
                  <template #default="{ row }">
                    <el-input v-model="row.value" />
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="說明" min-width="200" />
                <el-table-column label="操作" width="150" fixed="right">
                  <template #default="scope">
                    <el-button 
                      size="small" 
                      type="danger" 
                      @click="handleDeleteParam(scope.row)"
                    >
                      刪除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>

          <!-- 保存按鈕 -->
          <div class="param-footer">
            <el-button type="primary" @click="handleSaveParams">保存設置</el-button>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 縣市對話框 -->
    <el-dialog
      :title="cityDialog.type === 'add' ? '新增縣市' : '編輯縣市'"
      v-model="cityDialog.visible"
      width="500px"
    >
      <el-form
        ref="cityFormRef"
        :model="cityDialog.form"
        :rules="cityRules"
        label-width="100px"
      >
        <el-form-item label="縣市名稱" prop="name">
          <el-input v-model="cityDialog.form.name" placeholder="請輸入縣市名稱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cityDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleCitySubmit">確定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 區域對話框 -->
    <el-dialog
      title="新增區域"
      v-model="areaDialog.visible"
      width="500px"
    >
      <el-form
        ref="areaFormRef"
        :model="areaDialog.form"
        :rules="areaRules"
        label-width="100px"
      >
        <el-form-item label="所屬縣市" prop="cityId">
          <el-select v-model="areaDialog.form.cityId" placeholder="請選擇縣市">
            <el-option
              v-for="city in cityList"
              :key="city.id"
              :label="city.name"
              :value="city.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="區域名稱" prop="name">
          <el-input v-model="areaDialog.form.name" placeholder="請輸入區域名稱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="areaDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleAreaSubmit">確定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 業務人員編輯對話框 -->
    <el-dialog
      :title="salesDialog.type === 'add' ? '新增業務人員' : '編輯業務人員'"
      v-model="salesDialog.visible"
      width="500px"
    >
      <el-form
        ref="salesFormRef"
        :model="salesDialog.form"
        :rules="salesRules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="salesDialog.form.name" placeholder="請輸入姓名" />
        </el-form-item>
        <el-form-item label="電話" prop="phone">
          <el-input v-model="salesDialog.form.phone" placeholder="請輸入電話" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="salesDialog.form.email" placeholder="請輸入Email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="salesDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleSalesSubmit">確定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 區域分配對話框 -->
    <el-dialog
      title="分配負責區域"
      v-model="areaAssignDialog.visible"
      width="600px"
    >
      <el-form label-width="100px">
        <el-form-item label="選擇區域">
          <el-tree
            ref="areaTreeRef"
            :data="areaTreeData"
            show-checkbox
            node-key="id"
            :default-checked-keys="areaAssignDialog.checkedKeys"
            :props="{
              label: 'name',
              children: 'areas'
            }"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="areaAssignDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleAreaAssignSubmit">確定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 課程類型編輯對話框 -->
    <el-dialog
      :title="courseTypeDialog.type === 'add' ? '新增課程類型' : '編輯課程類型'"
      v-model="courseTypeDialog.visible"
      width="500px"
    >
      <el-form
        ref="courseTypeFormRef"
        :model="courseTypeDialog.form"
        :rules="courseTypeRules"
        label-width="100px"
      >
        <el-form-item label="類型名稱" prop="name">
          <el-input v-model="courseTypeDialog.form.name" placeholder="請輸入課程類型名稱" />
        </el-form-item>
        <el-form-item label="課程代碼" prop="code">
          <el-input v-model="courseTypeDialog.form.code" placeholder="請輸入課程代碼" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="courseTypeDialog.form.description" 
            type="textarea"
            rows="3"
            placeholder="請輸入課程類型描述"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number 
            v-model="courseTypeDialog.form.sort"
            :min="0"
            :max="99"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="courseTypeDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleCourseTypeSubmit">確定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 參數新增對話框 -->
    <el-dialog
      title="新增參數"
      v-model="paramDialog.visible"
      width="500px"
    >
      <el-form
        ref="paramFormRef"
        :model="paramDialog.form"
        :rules="paramRules"
        label-width="100px"
      >
        <el-form-item label="參數名稱" prop="key">
          <el-input v-model="paramDialog.form.key" placeholder="請輸入參數名稱" />
        </el-form-item>
        <el-form-item label="參數值" prop="value">
          <el-input v-model="paramDialog.form.value" placeholder="請輸入參數值" />
        </el-form-item>
        <el-form-item label="說明" prop="description">
          <el-input 
            v-model="paramDialog.form.description" 
            type="textarea"
            rows="3"
            placeholder="請輸入參數說明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="paramDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleParamSubmit">確定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

// 當前激活的 Tab
const activeTab = ref('area')

// 加載狀態
const loading = ref(false)

// 表單引用
const cityFormRef = ref<FormInstance>()
const areaFormRef = ref<FormInstance>()
const salesFormRef = ref<FormInstance>()
const courseTypeFormRef = ref<FormInstance>()
const paramFormRef = ref<FormInstance>()

// 縣市對話框
const cityDialog = reactive({
  visible: false,
  type: 'add' as 'add' | 'edit',
  form: {
    id: '',
    name: ''
  }
})

// 區域對話框
const areaDialog = reactive({
  visible: false,
  form: {
    cityId: '',
    name: ''
  }
})

// 業務人員對話框
const salesDialog = reactive({
  visible: false,
  type: 'add' as 'add' | 'edit',
  form: {
    id: '',
    name: '',
    phone: '',
    email: ''
  }
})

// 區域分配對話框
const areaAssignDialog = reactive({
  visible: false,
  salesId: null as number | null,
  checkedKeys: [] as number[]
})

// 課程類型對話框
const courseTypeDialog = reactive({
  visible: false,
  type: 'add' as 'add' | 'edit',
  form: {
    id: '',
    name: '',
    code: '',
    description: '',
    sort: 0
  }
})

// 參數對話框
const paramDialog = reactive({
  visible: false,
  form: {
    key: '',
    value: '',
    description: ''
  }
})

// 表單驗證規則
const cityRules = {
  name: [
    { required: true, message: '請輸入縣市名稱', trigger: 'blur' }
  ]
}

const areaRules = {
  cityId: [
    { required: true, message: '請選擇所屬縣市', trigger: 'change' }
  ],
  name: [
    { required: true, message: '請輸入區域名稱', trigger: 'blur' }
  ]
}

// 業務人員表單驗證規則
const salesRules = {
  name: [
    { required: true, message: '請輸入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '請輸入電話', trigger: 'blur' },
    { pattern: /^09\d{8}$/, message: '請輸入正確的手機號碼格式', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '請輸入Email', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的Email格式', trigger: 'blur' }
  ]
}

// 課程類型表單驗證規則
const courseTypeRules = {
  name: [
    { required: true, message: '請輸入課程類型名稱', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '請輸入課程代碼', trigger: 'blur' },
    { pattern: /^[A-Z0-9]+$/, message: '課程代碼只能包含大寫字母和數字', trigger: 'blur' }
  ]
}

// 參數表單驗證規則
const paramRules = {
  key: [
    { required: true, message: '請輸入參數名稱', trigger: 'blur' }
  ],
  value: [
    { required: true, message: '請輸入參數值', trigger: 'blur' }
  ]
}

// 模擬數據
const cityList = ref([
  {
    id: 1,
    name: '台北市',
    areas: [
      { id: 1, name: '信義區' },
      { id: 2, name: '大安區' }
    ]
  },
  {
    id: 2,
    name: '新北市',
    areas: [
      { id: 3, name: '板橋區' },
      { id: 4, name: '中和區' }
    ]
  }
])

// 業務人員列表
const salesList = ref([
  {
    id: 1,
    name: '張三',
    phone: '0912345678',
    email: 'zhangsan@example.com',
    status: 1,
    areas: [
      { id: 1, cityId: 1, cityName: '台北市', name: '信義區' },
      { id: 2, cityId: 1, cityName: '台北市', name: '大安區' }
    ]
  }
])

// 課程類型列表
const courseTypeList = ref([
  {
    id: 1,
    name: '魔術課程',
    code: 'MAGIC',
    description: '基礎魔術教學，適合初學者',
    status: 1,
    sort: 1
  },
  {
    id: 2,
    name: '科學實驗',
    code: 'SCIENCE',
    description: '有趣的科學實驗課程',
    status: 1,
    sort: 2
  }
])

// 基本參數
const basicParams = reactive({
  systemName: 'OA系統',
  logo: '',
  phone: '02-12345678',
  email: 'support@example.com',
  announcement: '歡迎使用OA系統'
})

// 郵件參數
const emailParams = reactive({
  smtpServer: 'smtp.example.com',
  smtpPort: '587',
  account: 'noreply@example.com',
  password: '',
  senderName: 'OA系統'
})

// 其他參數
const otherParams = ref([
  {
    key: 'maxUploadSize',
    value: '10',
    description: '最大上傳文件大小(MB)'
  },
  {
    key: 'sessionTimeout',
    value: '30',
    description: '會話超時時間(分鐘)'
  }
])

// 獲取區域樹形數據
const areaTreeData = computed(() => {
  return cityList.value.map(city => ({
    id: `city_${city.id}`,
    name: city.name,
    areas: city.areas.map(area => ({
      id: area.id,
      name: area.name
    }))
  }))
})

// 獲取城市和區域名稱
const getCityAndAreaName = (area: any) => {
  return `${area.cityName}-${area.name}`
}

// 新增縣市
const handleAddCity = () => {
  cityDialog.type = 'add'
  cityDialog.form = {
    id: '',
    name: ''
  }
  cityDialog.visible = true
}

// 編輯縣市
const handleEditCity = (row: any) => {
  cityDialog.type = 'edit'
  cityDialog.form = { ...row }
  cityDialog.visible = true
}

// 刪除縣市
const handleDeleteCity = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '確定要刪除該縣市嗎？相關區域也會被刪除',
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

// 新增區域
const handleAddArea = () => {
  areaDialog.form = {
    cityId: '',
    name: ''
  }
  areaDialog.visible = true
}

// 刪除區域
const handleDeleteArea = async (area: any) => {
  try {
    await ElMessageBox.confirm(
      '確定要刪除該區域嗎？',
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

// 提交縣市表單
const handleCitySubmit = async () => {
  if (!cityFormRef.value) return
  
  try {
    await cityFormRef.value.validate()
    // TODO: 實現保存邏輯
    ElMessage.success(cityDialog.type === 'add' ? '新增成功' : '更新成功')
    cityDialog.visible = false
  } catch (error) {
    console.error('表單驗證失敗：', error)
  }
}

// 提交區域表單
const handleAreaSubmit = async () => {
  if (!areaFormRef.value) return
  
  try {
    await areaFormRef.value.validate()
    // TODO: 實現保存邏輯
    ElMessage.success('新增成功')
    areaDialog.visible = false
  } catch (error) {
    console.error('表單驗證失敗：', error)
  }
}

// 新增業務人員
const handleAddSales = () => {
  salesDialog.type = 'add'
  salesDialog.form = {
    id: '',
    name: '',
    phone: '',
    email: ''
  }
  salesDialog.visible = true
}

// 編輯業務人員
const handleEditSales = (row: any) => {
  salesDialog.type = 'edit'
  salesDialog.form = { ...row }
  salesDialog.visible = true
}

// 刪除業務人員
const handleDeleteSales = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '確定要刪除該業務人員嗎？',
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

// 修改狀態
const handleStatusChange = async (row: any) => {
  try {
    // TODO: 實現狀態修改邏輯
    ElMessage.success('狀態修改成功')
  } catch (error) {
    ElMessage.error('狀態修改失敗')
    row.status = row.status === 1 ? 0 : 1 // 回滾狀態
  }
}

// 分配區域
const handleAssignArea = (row: any) => {
  areaAssignDialog.salesId = row.id
  areaAssignDialog.checkedKeys = row.areas.map((area: any) => area.id)
  areaAssignDialog.visible = true
}

// 提交區域分配
const handleAreaAssignSubmit = async () => {
  // TODO: 實現區域分配邏輯
  ElMessage.success('區域分配成功')
  areaAssignDialog.visible = false
}

// 提交業務人員表單
const handleSalesSubmit = async () => {
  if (!salesFormRef.value) return
  
  try {
    await salesFormRef.value.validate()
    // TODO: 實現保存邏輯
    ElMessage.success(salesDialog.type === 'add' ? '新增成功' : '更新成功')
    salesDialog.visible = false
  } catch (error) {
    console.error('表單驗證失敗：', error)
  }
}

// 新增課程類型
const handleAddCourseType = () => {
  courseTypeDialog.type = 'add'
  courseTypeDialog.form = {
    id: '',
    name: '',
    code: '',
    description: '',
    sort: courseTypeList.value.length + 1
  }
  courseTypeDialog.visible = true
}

// 編輯課程類型
const handleEditCourseType = (row: any) => {
  courseTypeDialog.type = 'edit'
  courseTypeDialog.form = { ...row }
  courseTypeDialog.visible = true
}

// 切換課程類型狀態
const handleToggleCourseType = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `確定要${row.status === 1 ? '停用' : '啟用'}該課程類型嗎？`,
      '提示',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: row.status === 1 ? 'warning' : 'info'
      }
    )
    // TODO: 實現狀態切換邏輯
    row.status = row.status === 1 ? 0 : 1
    ElMessage.success(`${row.status === 1 ? '啟用' : '停用'}成功`)
  } catch {
    // 用戶取消操作
  }
}

// 刪除課程類型
const handleDeleteCourseType = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '確定要刪除該課程類型嗎？',
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

// 提交課程類型表單
const handleCourseTypeSubmit = async () => {
  if (!courseTypeFormRef.value) return
  
  try {
    await courseTypeFormRef.value.validate()
    // TODO: 實現保存邏輯
    ElMessage.success(courseTypeDialog.type === 'add' ? '新增成功' : '更新成功')
    courseTypeDialog.visible = false
  } catch (error) {
    console.error('表單驗證失敗：', error)
  }
}

// Logo上傳前的處理
const beforeLogoUpload = (file: File) => {
  // TODO: 實現Logo上傳邏輯
  return false
}

// 新增參數
const handleAddParam = () => {
  paramDialog.form = {
    key: '',
    value: '',
    description: ''
  }
  paramDialog.visible = true
}

// 刪除參數
const handleDeleteParam = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '確定要刪除該參數嗎？',
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

// 提交參數
const handleParamSubmit = async () => {
  if (!paramFormRef.value) return
  
  try {
    await paramFormRef.value.validate()
    // TODO: 實現保存邏輯
    otherParams.value.push({ ...paramDialog.form })
    ElMessage.success('新增成功')
    paramDialog.visible = false
  } catch (error) {
    console.error('表單驗證失敗：', error)
  }
}

// 保存所有設置
const handleSaveParams = async () => {
  try {
    // TODO: 實現保存邏輯
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失敗')
  }
}
</script>

<style scoped>
.settings-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-operations {
  display: flex;
  gap: 10px;
}

.area-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.tab-content {
  margin-top: 20px;
}

.param-tabs {
  margin-top: 20px;
}

.param-footer {
  margin-top: 20px;
  text-align: center;
}

.logo-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}

.logo-uploader:hover {
  border-color: #409EFF;
}

.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.logo {
  width: 178px;
  height: 178px;
  display: block;
}
</style> 