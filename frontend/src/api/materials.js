import api from './index'

export const materialsApi = {
  // Получить список материалов с фильтрацией
  getList(params) {
    return api.get('/materials', { params })
  },
  // Получить один материал
  getById(id) {
    return api.get(`/materials/${id}`)
  },
  // Создать материал
  create(data) {
    return api.post('/materials', data)
  },
  // Обновить материал
  update(id, data) {
    return api.put(`/materials/${id}`, data)
  },
  // Удалить материал (деактивировать)
  delete(id) {
    return api.delete(`/materials/${id}`)
  },
  // Установить цену материала
  setPrice(materialId, priceData) {
    return api.post(`/materials/${materialId}/price`, priceData)
  },
  // Получить активную цену материала
  getActivePrice(materialId) {
    return api.get(`/materials/${materialId}/price/active`)
  },
  // Получить услуги, к которым привязан материал
  getServicesByMaterial(materialId) {
    return api.get(`/materials/${materialId}/services`)
  },
  // Привязать материал к услуге
  addToService(materialId, serviceId) {
    return api.post(`/materials/${materialId}/services`, { serviceId })
  },
  // Отвязать материал от услуги
  removeFromService(serviceMaterialId) {
    return api.delete(`/materials/service-materials/${serviceMaterialId}`)
  }
}