<template>
  <div class="notes-container">
    <div class="page-header glass-light">
      <h2><i class="fas fa-sticky-note"></i> 筆記</h2>
      <el-button 
        class="create-note-btn glass-button" 
        @click="createNote">
        <span class="btn-content">
          <i class="fas fa-plus-circle"></i>
          <span>新建筆記</span>
        </span>
      </el-button>
    </div>

    <el-card class="notes-card glass">
      <!-- 筆記列表將在這裡實現 -->
      <div class="empty-state" v-if="!notes.length">
        <i class="fas fa-book-open"></i>
        <p>還沒有筆記，立即創建一個吧！</p>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'NotesManagement',
  data() {
    return {
      notes: []
    }
  },
  methods: {
    createNote() {
      // 創建筆記的邏輯將在這裡實現
      this.$message.info('筆記功能開發中...');
    }
  }
}
</script>

<style scoped>
.notes-container {
  padding: 20px;
  min-height: calc(100vh - 120px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 24px;
  border-radius: 12px;
}

.page-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
}

.create-note-btn {
  background: linear-gradient(135deg, #34C759 0%, #30D158 100%);
  border: none;
  padding: 12px 24px;
  border-radius: 16px;
  color: white;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(52, 199, 89, 0.2);
}

.create-note-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(52, 199, 89, 0.3);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notes-card {
  border-radius: 12px;
  min-height: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #909399;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
}

.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.glass-light {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}
</style> 