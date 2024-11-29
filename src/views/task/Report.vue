<template>
  <div class="report-page">
    <!-- 頁面標題和返回按鈕 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="router.push('/task')">
          <el-icon><ArrowLeft /></el-icon>返回
        </el-button>
        <h2>任務統計報表</h2>
      </div>
    </div>

    <!-- 報表內容 -->
    <TaskReport />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import TaskReport from './components/TaskReport.vue'

const router = useRouter()
</script>

<style scoped>
.report-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

h2 {
  margin: 0;
}
</style> 