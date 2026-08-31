import api from './index'

export const mastersApi = {
  // Получить список мастеров
  getList(params) {
    return api.get('/masters', { params })
  },
  // Получить одного мастера
  getById(id) {
    return api.get(`/masters/${id}`)
  },
  // Создать мастера
  create(data) {
    return api.post('/masters', data)
  },
  // Обновить мастера
  update(id, data) {
    return api.put(`/masters/${id}`, data)
  },
  // Удалить мастера
  delete(id) {
    return api.delete(`/masters/${id}`)
  },
  // Добавить категорию услуги
  addService(masterId, serviceId) {
    return api.post(`/masters/${masterId}/services`, { serviceId })
  },
  // Удалить категорию услуги
  removeService(masterServiceId) {
    return api.delete(`/masters/services/${masterServiceId}`)
  },
}