import request from '../utils/request'

export const authAPI = {
  login(data) {
    const loginData = {
      username: data.username,
      password: data.password
    }
    return request({
      url: '/api/auth/login',
      method: 'post',
      data: loginData
    })
  },

  register(data) {
    return request({
      url: '/api/auth/register',
      method: 'post',
      data
    })
  },

  logout() {
    return request({
      url: '/api/auth/logout',
      method: 'post'
    })
  }
} 