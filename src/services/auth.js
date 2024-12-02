import api from './api'

export const authService = {
  async login(username, password) {
    return api.post('/auth/login', { username, password })
  },

  async register(userData) {
    return api.post('/auth/register', userData)
  },

  async googleLogin(token) {
    return api.post('/auth/google', { token })
  },

  async getCurrentUser() {
    return api.get('/auth/me')
  }
} 