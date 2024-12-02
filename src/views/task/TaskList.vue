<template>
  <div class="task-container">
    <div class="task-header">
      <h2>任務管理</h2>
      <button @click="openNewTask" class="add-button">新增任務</button>
    </div>
    
    <div class="task-grid">
      <div v-for="task in tasks" :key="task.id" class="task-card">
        <div class="task-status" :class="task.status">{{ task.status }}</div>
        <h3>{{ task.title }}</h3>
        <p>{{ task.description }}</p>
        <div class="task-footer">
          <span>截止日期: {{ task.deadline }}</span>
          <button @click="openTaskDetail(task)">查看詳情</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tasks: [
        {
          id: 1,
          title: '示例任務',
          description: '這是一個示例任務描述',
          status: 'pending',
          deadline: '2024-12-31'
        }
      ]
    }
  },
  methods: {
    openNewTask() {
      // TODO: 實現新增任務邏輯
    },
    openTaskDetail(task) {
      // TODO: 實現查看任務詳情邏輯
    }
  }
}
</script>

<style scoped>
.task-container {
  padding: 2rem;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.add-button {
  background: linear-gradient(to right, #007AFF, #5856D6);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.task-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style> 