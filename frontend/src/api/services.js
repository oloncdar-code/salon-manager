import api from './index'

export const servicesApi = {
  getList(params) {
    return api.get('/services', { params })
  },
  getById(id) {
    return api.get(`/services/${id}`)
  },
  create(data) {
    return api.post('/services', data)
  },
  update(id, data) {
    return api.put(`/services/${id}`, data)
  },
  getActivePrice(id) {
    return api.get(`/services/${id}/price/active`)
  },
  setPrice(id, data) {
    return api.post(`/services/${id}/price`, data)
  },
  delete(id) {          
    return api.delete(`/services/${id}`)
  },
  getMaterials(serviceId) {
    return api.get(`/services/${serviceId}/materials`)
  },
  addMaterial(serviceId, materialId) {
      return api.post(`/services/${serviceId}/materials`, { materialId })
  },
  removeMaterial(serviceId, materialId) {
    return api.delete(`/services/${serviceId}/materials/${materialId}`)
  },
}