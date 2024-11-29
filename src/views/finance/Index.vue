<template>
  <div class="finance-container">
    <el-tabs v-model="activeTab" class="finance-tabs">
      <el-tab-pane label="收入管理" name="income">
        <Income v-if="activeTab === 'income'" />
      </el-tab-pane>
      <el-tab-pane label="支出管理" name="expense">
        <Expense v-if="activeTab === 'expense'" />
      </el-tab-pane>
      <el-tab-pane label="薪資管理" name="salary">
        <Salary v-if="activeTab === 'salary'" />
      </el-tab-pane>
      <el-tab-pane label="財務報表" name="report">
        <Report v-if="activeTab === 'report'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Income from './Income.vue'
import Expense from './Expense.vue'
import Salary from './Salary.vue'
import Report from './Report.vue'

const activeTab = ref('income')
</script>

<style scoped>
.finance-container {
  padding: 20px;
}

.finance-tabs {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
}
</style> 