import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const auth = {
  login: (username, password) => {
    return axios.post(`${API_URL}/auth/login`, { username, password });
  },
  register: (username, email, password) => {
    return axios.post(`${API_URL}/auth/register`, { username, email, password });
  }
}; 