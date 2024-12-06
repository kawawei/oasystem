import request from '../utils/request'

export const userAPI = {
  getAllUsers() {
    return request({
      url: '/api/users',
      method: 'get'
    })
  }
} 