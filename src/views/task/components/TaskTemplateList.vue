<template>
  <div class="template-list">
    <!-- 模板列表 -->
    <el-card v-for="template in defaultTaskTemplates" 
      :key="template.id" 
      class="template-card"
    >
      <template #header>
        <div class="card-header">
          <h3>{{ template.name }}</h3>
          <el-button type="primary" @click="handleUseTemplate(template)">
            使用此模板
          </el-button>
        </div>
      </template>
      
      <p class="template-description">{{ template.description }}</p>
      
      <!-- 階段列表 -->
      <el-steps :active="template.stages.length" finish-status="success">
        <el-step 
          v-for="stage in template.stages" 
          :key="stage.order"
          :title="stage.name"
          :description="stage.description"
        />
      </el-steps>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { defaultTaskTemplates } from '@/types/task'
import type { TaskTemplate } from '@/types/task'

const emit = defineEmits<{
  (e: 'use-template', template: TaskTemplate): void
}>()

// 使用模板
const handleUseTemplate = (template: TaskTemplate) => {
  emit('use-template', template)
}
</script>

<style scoped>
.template-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.template-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
}

.template-description {
  color: #666;
  margin-bottom: 20px;
}
</style> 