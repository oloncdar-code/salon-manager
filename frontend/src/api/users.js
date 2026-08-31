import api from './index'

export const usersApi = {
  getList(params) {
    return api.get('/users', { params })
  },
  findByPhone(phone) {
    return api.get('/users/by-phone', { params: { phone } })
  },
}