import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const authApi = {
  // 登入
  async login(username, password) {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password
    });
    return response.data;
  },

  // 註冊
  async register(username, email, password) {
    const response = await axios.post(`${API_URL}/auth/register`, {
      username,
      email,
      password
    });
    return response.data;
  }
}; 