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
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        @select="handleSelect"
      >
        <el-menu-item index="/">
          <el-icon><Monitor /></el-icon>
          <template #title>儀表板</template>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <template #title>用戶管理</template>
        </el-menu-item>
        <el-menu-item index="/attendance">
          <el-icon><Calendar /></el-icon>
          <template #title>出缺勤管理</template>
        </el-menu-item>
        <el-menu-item index="/finance">
          <el-icon><Money /></el-icon>
          <template #title>財務管理</template>
        </el-menu-item>
        <el-menu-item index="/schedule">
          <el-icon><Timer /></el-icon>
          <template #title>行程安排</template>
        </el-menu-item>
        <el-menu-item index="/task">
          <el-icon><List /></el-icon>
          <template #title>任務管理</template>
        </el-menu-item>
        <el-sub-menu index="/crm">
          <template #title>
            <el-icon><Sell /></el-icon>
            <span>CRM管理</span>
          </template>
          <el-menu-item index="/crm/stranger">陌生客戶</el-menu-item>
          <el-menu-item index="/crm/potential">潛在客戶</el-menu-item>
          <el-menu-item index="/crm/cooperated">已合作客戶</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <template #title>系統設置</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="main-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              {{ userStore.userInfo?.name || '未登入' }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">個人資料</el-dropdown-item>
                <el-dropdown-item command="logout" divided>登出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <suspense>
              <template #default>
                <component 
                  :is="Component" 
                  :key="$route.fullPath"
                />
              </template>
              <template #fallback>
                <div class="loading-container">
                  <el-loading :show="true" />
                </div>
              </template>
            </suspense>
          </keep-alive>
        </router-view>
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
  Calendar,
  Money,
  Timer,
  List,
  ArrowDown,
  Fold,
  Expand,
  Platform,
  Setting,
  Sell
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
  console.log('Selected menu:', index)
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
  background-color: #304156;
  border-bottom: 1px solid #1f2d3d;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  color: #bfcbd9;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #bfcbd9;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #bfcbd9;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}

:deep(.el-menu) {
  border-right: none;
  background-color: #304156 !important;
}

:deep(.el-menu-item) {
  background-color: #304156 !important;
  
  &:hover {
    background-color: #263445 !important;
  }
  
  &.is-active {
    background-color: #263445 !important;
  }
}

:deep(.el-sub-menu__title) {
  background-color: #304156 !important;
  
  &:hover {
    background-color: #263445 !important;
  }
}

:deep(.el-sub-menu) {
  background-color: #304156 !important;
  
  .el-menu {
    background-color: #1f2d3d !important;
  }
  
  .el-menu-item {
    background-color: #1f2d3d !important;
    
    &:hover {
      background-color: #001528 !important;
    }
    
    &.is-active {
      background-color: #001528 !important;
    }
  }
}

/* 過渡動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}
</style> 