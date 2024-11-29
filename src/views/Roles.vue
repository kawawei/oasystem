<template>
  <div class="roles-container">
    <!-- 頁面標題和操作按鈕 -->
    <div class="page-header">
      <h2>權限管理</h2>
      <el-button type="primary" @click="handleAddRole">
        <el-icon><Plus /></el-icon>新增角色
      </el-button>
    </div>

    <!-- 角色列表 -->
    <el-card>
      <el-table :data="roleList" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="角色名稱" width="180" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="users" label="用戶數" width="120" />
        <el-table-column label="狀態" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '啟用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button size="small" @click="handleEditRole(scope.row)">
              編輯
            </el-button>
            <el-button 
              size="small" 
              type="primary"
              @click="handleSetPermissions(scope.row)"
            >
              設置權限
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDeleteRole(scope.row)"
            >
              刪除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 角色編輯對話框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增角色' : '編輯角色'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="角色名稱" prop="name">
          <el-input v-model="formData.name" placeholder="請輸入角色名稱" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="formData.description" 
            type="textarea"
            placeholder="請輸入角色描述"
          />
        </el-form-item>
        <el-form-item label="狀態" prop="status">
          <el-switch
            v-model="formData.status"
            :active-value="'active'"
            :inactive-value="'inactive'"
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

    <!-- 權限設置對話框 -->
    <el-dialog
      title="設置權限"
      v-model="permissionDialogVisible"
      width="600px"
    >
      <el-tree
        ref="permissionTree"
        :data="permissionList"
        show-checkbox
        node-key="id"
        :default-checked-keys="selectedPermissions"
        :props="{
          label: 'name',
          children: 'children'
        }"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleSavePermissions"
            :loading="savingPermissions"
          >
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, TreeInstance } from 'element-plus'
import { useRoleStore } from '../stores/role'

// 加載狀態
const loading = ref(false)
const submitting = ref(false)
const savingPermissions = ref(false)

// 對話框控制
const dialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')

// 表單相關
const formRef = ref<FormInstance>()
const formData = reactive({
  name: '',
  description: '',
  status: 'active'
})

// 表單驗證規則
const rules = {
  name: [
    { required: true, message: '請輸入角色名稱', trigger: 'blur' },
    { min: 2, message: '長度不能小於2個字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '請輸入角色描述', trigger: 'blur' }
  ]
}

// 角色數據
const roleStore = useRoleStore()
const roleList = computed(() => roleStore.roleList)

// 模擬權限數據
const permissionList = ref([
  {
    id: 1,
    name: '系統管理',
    children: [
      { id: 11, name: '用戶管理' },
      { id: 12, name: '角色管理' },
      { id: 13, name: '權限設置' }
    ]
  },
  {
    id: 2,
    name: '內容管理',
    children: [
      { id: 21, name: '文章管理' },
      { id: 22, name: '評論管理' },
      { id: 23, name: '分類管理' }
    ]
  }
])

// 當前選中的權限
const selectedPermissions = ref<number[]>([])
const permissionTree = ref<TreeInstance>()

// 當前編輯的角色 ID
const currentEditId = ref<number>(0)

// 新增角色
const handleAddRole = () => {
  dialogType.value = 'add'
  formData.name = ''
  formData.description = ''
  formData.status = 'active'
  dialogVisible.value = true
}

// 編輯角色
const handleEditRole = (row: any) => {
  dialogType.value = 'edit'
  currentEditId.value = row.id
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 設置權限
const handleSetPermissions = (row: any) => {
  // 模擬獲取當前角色的權限
  selectedPermissions.value = [11, 21, 22]
  permissionDialogVisible.value = true
}

// 保存權限設置
const handleSavePermissions = async () => {
  try {
    savingPermissions.value = true
    // 獲取選中的權限
    const checkedKeys = permissionTree.value?.getCheckedKeys()
    console.log('選中的權限：', checkedKeys)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('權限設置成功')
    permissionDialogVisible.value = false
  } catch (error) {
    ElMessage.error('權限設置失敗')
  } finally {
    savingPermissions.value = false
  }
}

// 刪除角色
const handleDeleteRole = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '確定要刪除該角色嗎？刪除後無法恢復',
      '警告',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    loading.value = true
    roleStore.deleteRole(row.id)
    ElMessage.success('刪除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('刪除失敗：', error)
      ElMessage.error('刪除失敗')
    }
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
    
    if (dialogType.value === 'add') {
      roleStore.addRole({
        name: formData.name,
        description: formData.description,
        status: formData.status as 'active' | 'inactive',
        users: 0
      })
      ElMessage.success('新增成功')
    } else {
      roleStore.updateRole(currentEditId.value, {
        name: formData.name,
        description: formData.description,
        status: formData.status as 'active' | 'inactive'
      })
      ElMessage.success('編輯成功')
    }
    
    dialogVisible.value = false
  } catch (error) {
    console.error('操作失敗：', error)
    ElMessage.error('操作失敗')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.roles-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 