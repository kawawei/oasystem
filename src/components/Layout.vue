<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside-container">
      <div class="logo-container" :class="{ 'collapsed': isCollapse }">
        <el-icon class="logo"><Platform /></el-icon>
        <span v-if="!isCollapse" class="logo-text">OA 系統</span>
      </div>
      <el-menu
        :default-active="route.path"
        class="el-menu-vertical"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        @select="handleSelect"
      >
        <el-menu-item index="/">
          <el-icon><Monitor /></el-icon>
          <template #title>儀表板</template>
        </el-menu-item>
        
        <el-menu-item index="/task">
          <el-icon><List /></el-icon>
          <template #title>任務管理</template>
        </el-menu-item>

        <!-- 其他菜單項 -->
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="main-header">
        <el-icon 
          class="collapse-btn"
          @click="isCollapse = !isCollapse"
        >
          <component :is="isCollapse ? Expand : Fold" />
        </el-icon>

        <el-dropdown @command="handleCommand">
          <div class="user-info">
            <el-icon><User /></el-icon>
            <span>{{ userStore.userInfo?.name }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">個人資料</el-dropdown-item>
              <el-dropdown-item command="logout">登出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessageBox } from 'element-plus'
import {
  Monitor,
  User,
  List,
  ArrowDown,
  Fold,
  Expand,
  Platform
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isCollapse = ref(false)

const handleCommand = async (command: string) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    try {
      await ElMessageBox.confirm('確定要登出系統嗎？', '提示', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      userStore.logout()
      router.push('/login')
    } catch {
      // 用戶取消操作
    }
  }
}

const handleSelect = (index: string) => {
  router.push(index)
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside-container {
  background-color: #304156;
  transition: width 0.3s;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #2b3a4a;
}

.logo-container.collapsed {
  padding: 0 12px;
  justify-content: center;
}

.logo {
  font-size: 28px;
  color: #409EFF;
}

.logo-text {
  color: #fff;
  margin-left: 12px;
  font-size: 18px;
}

.main-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #303133;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item) {
  &.is-active {
    background-color: #263445 !important;
  }
  
  &:hover {
    background-color: #263445 !important;
  }
}
</style> 