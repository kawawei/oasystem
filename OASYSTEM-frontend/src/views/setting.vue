<template>
  <div class="settings-container">
    <h2 class="welcome">基礎設置</h2>
    
    <div class="settings-grid">
      <!-- 個人信息設置 -->
      <div class="settings-card glass-light">
        <div class="card-header">
          <el-icon><User /></el-icon>
          <h3>個人信息</h3>
        </div>
        <div class="card-content">
          <!-- 頭像上傳區域 -->
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <img 
                :src="avatarUrl || defaultAvatar" 
                alt="用戶頭像"
                class="avatar-preview"
              />
              <div class="avatar-overlay">
                <div class="avatar-actions">
                  <el-upload
                    class="avatar-uploader"
                    :action="null"
                    :http-request="uploadAvatar"
                    :show-file-list="false"
                    accept="image/jpeg,image/png,image/gif"
                  >
                    <el-button type="primary" circle class="action-btn">
                      <el-icon><Upload /></el-icon>
                    </el-button>
                  </el-upload>
                  <el-button
                    v-if="avatarUrl"
                    class="action-btn"
                    type="danger"
                    circle
                    @click.stop="deleteAvatar"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <el-form :model="userForm" label-position="top">
            <el-form-item label="用戶名">
              <el-input v-model="userForm.username" placeholder="輸入用戶名" />
            </el-form-item>
            <el-form-item label="郵箱">
              <el-input v-model="userForm.email" placeholder="輸入郵箱" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updateProfile">保存更改</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 密碼設置 -->
      <div class="settings-card glass-light">
        <div class="card-header">
          <el-icon><Lock /></el-icon>
          <h3>密碼設置</h3>
        </div>
        <div class="card-content">
          <el-form :model="passwordForm" label-position="top">
            <el-form-item label="當前密碼">
              <el-input
                v-model="passwordForm.currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                placeholder="輸入當前密碼"
              >
                <template #suffix>
                  <el-icon 
                    class="password-eye" 
                    @click="showCurrentPassword = !showCurrentPassword"
                  >
                    <View v-if="showCurrentPassword" />
                    <Hide v-else />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="新密碼">
              <el-input
                v-model="passwordForm.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="輸入新密碼"
              >
                <template #suffix>
                  <el-icon 
                    class="password-eye" 
                    @click="showNewPassword = !showNewPassword"
                  >
                    <View v-if="showNewPassword" />
                    <Hide v-else />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="確認新密碼">
              <el-input
                v-model="passwordForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="再次輸入新密碼"
              >
                <template #suffix>
                  <el-icon 
                    class="password-eye" 
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <View v-if="showConfirmPassword" />
                    <Hide v-else />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updatePassword">更新密碼</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 通知設置 -->
      <div class="settings-card glass-light">
        <div class="card-header">
          <el-icon><Bell /></el-icon>
          <h3>通知設置</h3>
        </div>
        <div class="card-content">
          <el-form :model="notificationForm">
            <el-form-item>
              <el-switch
                v-model="notificationForm.emailNotifications"
                active-text="郵件通知"
              />
            </el-form-item>
            <el-form-item>
              <el-switch
                v-model="notificationForm.taskReminders"
                active-text="任務提醒"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary">保存設置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { User, Lock, Bell, Camera, Delete, View, Hide } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import eventBus from '@/utils/eventBus'

const userForm = ref({
  username: '',
  email: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const notificationForm = ref({
  emailNotifications: true,
  taskReminders: true
})

const avatarUrl = ref('')
const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'

// 密碼顯示控制
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// 創建 axios 實例
const api = axios.create({
  baseURL: 'http://localhost:3000',  // 設置基礎URL
  timeout: 5000
})

// 上傳頭像
const uploadAvatar = async (options) => {
  try {
    const formData = new FormData()
    formData.append('avatar', options.file)
    
    console.log('Uploading file:', options.file);
    
    const response = await api.put('/api/settings/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    console.log('Upload response:', response.data);
    
    const fullUrl = `${api.defaults.baseURL}/uploads/${response.data.avatar}`;
    console.log('Full avatar URL:', fullUrl);
    
    avatarUrl.value = fullUrl;
    eventBus.emit('avatar-updated', fullUrl)
    ElMessage.success('頭像更新成功')
  } catch (error) {
    console.error('Upload error:', error)
    ElMessage.error(error.response?.data?.message || '頭像上傳失敗')
  }
}

// 獲取用戶信息
const fetchUserInfo = async () => {
  try {
    const response = await api.get('/api/users/profile', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    const { username, email, avatar } = response.data
    userForm.value = { username, email }
    if (avatar) {
      avatarUrl.value = `${api.defaults.baseURL}/uploads/${avatar}`;
    }
  } catch (error) {
    console.error('Fetch user info error:', error)
    ElMessage.error('獲取用戶信息失敗')
  }
}

// 更新個人信息
const updateProfile = async () => {
  try {
    const response = await api.put('/api/settings/profile', userForm.value, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    ElMessage.success('個人信息更新成功')
  } catch (error) {
    console.error('Update profile error:', error)
    ElMessage.error(error.response?.data?.message || '更新失敗')
  }
}

// 更新密碼
const updatePassword = async () => {
  try {
    // 證新密碼
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      ElMessage.error('兩次輸入的密碼不致')
      return
    }
    
    const response = await api.put('/api/settings/password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    ElMessage.success('密碼更新成功')
    // 清空密碼表單
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    console.error('Update password error:', error)
    ElMessage.error(error.response?.data?.message || '密碼更新失敗')
  }
}

// 刪除頭像
const deleteAvatar = async () => {
  try {
    await ElMessageBox.confirm(
      '確定要刪除頭像嗎？',
      '提示',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await api.delete('/api/settings/avatar', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    // 設置為默認像
    const username = userForm.value.username || 'User'
    const defaultUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=0D8ABC&color=fff`
    avatarUrl.value = defaultUrl
    eventBus.emit('avatar-updated', defaultUrl)
    ElMessage.success('頭像已刪除')
  } catch (error) {
    if (error === 'cancel') return;
    console.error('Delete avatar error:', error)
    ElMessage.error(error.response?.data?.message || '刪除頭像失敗')
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.settings-container {
  padding: 2rem;
}

.welcome {
  font-size: 1.8rem;
  font-weight: 500;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #007AFF, #5856D6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.settings-card {
  padding: 1.5rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.settings-card:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.card-header .el-icon {
  font-size: 1.5rem;
  color: #007AFF;
}

.card-header h3 {
  font-size: 1.2rem;
  font-weight: 500;
  color: #1d1d1f;
  margin: 0;
}

.card-content {
  padding: 1rem 0;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #1d1d1f;
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: none;
}

:deep(.el-input__wrapper:hover) {
  border-color: #007AFF;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #007AFF;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
}

:deep(.el-button) {
  border-radius: 10px;
  padding: 12px 24px;
  font-weight: 500;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #007AFF, #5856D6);
  border: none;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

:deep(.el-switch) {
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .settings-container {
    padding: 1rem;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }
}

/* 頭像上傳式 */
.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: filter 0.3s ease;
}

.avatar-preview:hover {
  filter: brightness(0.9);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 0 10px;
}

.avatar-actions {
  display: flex;
  gap: 20px;
  padding: 0.5rem;
  height: 40px;
  justify-content: center;
  align-items: center;
}

.action-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  flex-shrink: 0;
}

:deep(.action-btn.el-button) {
  width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
  border-radius: 50% !important;
}

.action-btn:hover {
  transform: scale(1.1);
  background: rgba(0, 0, 0, 0.8);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
}

.action-btn :deep(.el-icon) {
  font-size: 1rem;
  color: white;
  margin: 0;
  line-height: 1;
  width: 1rem;
  height: 1rem;
}

/* 上傳按鈕特殊樣式 */
.action-btn.el-button--primary {
  background: linear-gradient(145deg, rgba(0, 122, 255, 0.8), rgba(88, 86, 214, 0.8));
  border: none;
  box-shadow: 0 0 10px rgba(0, 122, 255, 0.3);
}

.action-btn.el-button--primary:hover {
  background: linear-gradient(145deg, rgba(0, 122, 255, 0.9), rgba(88, 86, 214, 0.9));
  box-shadow: 0 0 20px rgba(0, 122, 255, 0.4);
}

/* 刪除按鈕特殊樣式 */
.action-btn.el-button--danger {
  background: linear-gradient(145deg, rgba(255, 59, 48, 0.8), rgba(255, 45, 85, 0.8));
  border: none;
  box-shadow: 0 0 10px rgba(255, 59, 48, 0.3);
}

.action-btn.el-button--danger:hover {
  background: linear-gradient(145deg, rgba(255, 59, 48, 0.9), rgba(255, 45, 85, 0.9));
  box-shadow: 0 0 20px rgba(255, 59, 48, 0.4);
}

/* 密碼顯示/隱藏圖標樣式 */
.password-eye {
  cursor: pointer;
  color: #909399;
  font-size: 16px;
  transition: color 0.3s;
}

.password-eye:hover {
  color: #409EFF;
}
</style> 