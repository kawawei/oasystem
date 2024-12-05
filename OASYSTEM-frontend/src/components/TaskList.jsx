import { useState, useEffect } from 'react';
import { taskAPI } from '../api/tasks';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await taskAPI.getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error('獲取任務失敗:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await taskAPI.deleteTask(id);
      loadTasks(); // 重新加載任務列表
    } catch (error) {
      console.error('刪除任務失敗:', error);
    }
  };

  return (
    <div>
      <h2>任務列表</h2>
      {tasks.map(task => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <p>優先級: {task.priority}</p>
          <p>狀態: {task.status}</p>
          <button onClick={() => handleDelete(task.id)}>刪除</button>
        </div>
      ))}
    </div>
  );
}; 