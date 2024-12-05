import { useState } from 'react';
import { authAPI } from '../api/auth';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await authAPI.login(username, password);
      console.log('登錄成功:', data);
      // 導航到主頁或儀表板
    } catch (error) {
      console.error('登錄失敗:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="用戶名"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="密碼"
      />
      <button type="submit">登錄</button>
    </form>
  );
};

export default Login; 