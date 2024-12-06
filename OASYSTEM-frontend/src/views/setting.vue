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
          <el-form :model="userForm" label-position="top">
            <el-form-item label="用戶名">
              <el-input v-model="userForm.username" placeholder="輸入用戶名" />
            </el-form-item>
            <el-form-item label="郵箱">
              <el-input v-model="userForm.email" placeholder="輸入郵箱" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary">保存更改</el-button>
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
              <el-input v-model="passwordForm.currentPassword" type="password" placeholder="輸入當前密碼" />
            </el-form-item>
            <el-form-item label="新密碼">
              <el-input v-model="passwordForm.newPassword" type="password" placeholder="輸入新密碼" />
            </el-form-item>
            <el-form-item label="確認新密碼">
              <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="再次輸入新密碼" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary">更新密碼</el-button>
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
import { ref } from 'vue'
import { User, Lock, Bell } from '@element-plus/icons-vue'

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
</style> 