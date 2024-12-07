import api from '@/utils/api';

export const taskAPI = {
  // 獲取所有任務
  getAllTasks: async () => {
    try {
      const response = await api.get('/api/tasks');
      return response.data.data;
    } catch (error) {
      console.error('Get tasks error:', error);
      throw error;
    }
  },

  // 創建任務
  createTask: async (taskData) => {
    try {
      const response = await api.post('/api/tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  },

  // 更新任務
  updateTask: async (taskId, taskData) => {
    try {
      const response = await api.put(`/api/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      console.error('Update task error:', error);
      throw error;
    }
  },

  // 刪除任務
  deleteTask: async (taskId) => {
    try {
      const response = await api.delete(`/api/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Delete task error:', error);
      throw error;
    }
  }
}; 