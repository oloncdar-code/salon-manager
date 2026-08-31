import api from './index'

export const appointmentsApi = {
  // Получить список записей с фильтрами
  getList(params) {
    return api.get('/appointments', { params })
  },

  // Получить одну запись по ID
  getById(id) {
    return api.get(`/appointments/${id}`)
  },

  // Создать запись
  create(data) {
    return api.post('/appointments', data)
  },

  // Обновить статус
  updateStatus(id, status) {
    return api.put(`/appointments/${id}/status`, { status })
  },

  // Обновить запись (перенос времени)
  update(id, data) {
    return api.put(`/appointments/${id}`, data)
  },

  // Добавить услугу в запись
  addService(data) {
    return api.post('/appointments/add-service', data)
  },

  // Получить свободные слоты для мастера
  getSlots(params) {
    return api.get('/appointments/slots', { params })
  },
  deleteService(id) {
    return api.delete(`/appointment-services/${id}`)
  },
}