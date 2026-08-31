import { defineStore } from 'pinia'
import { servicesApi } from '@/api/services'

export const useServicesStore = defineStore('services', {
  state: () => ({
    list: [],
    currentService: null,
    loading: false,
  }),

  getters: {
    // Возвращает категории (услуги 1-го уровня)
    categories: (state) => state.list.filter(s => s.parent_id === null && s.is_active !== false),
    // Возвращает дочерние услуги по parent_id
    getChildren: (state) => (parentId) => {
      return state.list.filter(s => s.parent_id === parentId && s.is_active !== false)
    },
    // Активная цена для услуги
    getActivePrice: (state) => (serviceId) => {
      const service = state.list.find(s => s.id === serviceId)
      return service?.prices?.find(p => p.is_active) || null
    },
    serviceMaterials: [],
  },

  actions: {
    async fetchList(params = {}) {
      this.loading = true
      try {
        const { data } = await servicesApi.getList(params)
        this.list = data || []
      } catch (error) {
        console.error('Ошибка загрузки услуг:', error)
        this.list = []
      } finally {
        this.loading = false
      }
    },

    async fetchById(id) {
      this.loading = true
      try {
        const { data } = await servicesApi.getById(id)
        this.currentService = data
        return data
      } catch (error) {
        console.error('Ошибка загрузки услуги:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async create(data) {
      try {
        const { data: response } = await servicesApi.create(data)
        await this.fetchList()
        return response
      } catch (error) {
        console.error('Ошибка создания услуги:', error)
        throw error
      }
    },

    async update(id, data) {
      try {
        const { data: response } = await servicesApi.update(id, data)
        await this.fetchList()
        return response
      } catch (error) {
        console.error('Ошибка обновления услуги:', error)
        throw error
      }
    },

    async remove(id) {
      try {
        await servicesApi.delete(id)
        await this.fetchList()
      } catch (error) {
        console.error('Ошибка удаления услуги:', error)
        throw error
      }
    },

    async setPrice(serviceId, price) {
      try {
        const { data } = await servicesApi.setPrice(serviceId, { price })
        await this.fetchList()
        return data
      } catch (error) {
        console.error('Ошибка установки цены:', error)
        throw error
      }
    },

    async fetchMaterials(serviceId) {
      try {
      const { data } = await servicesApi.getMaterials(serviceId)
      this.serviceMaterials = data
      return data
    } catch (error) {
      console.error('Ошибка загрузки материалов услуги:', error)
      throw error
    }
    },

    async addMaterial(serviceId, materialId) {
      try {
      const { data } = await servicesApi.addMaterial(serviceId, materialId)
      await this.fetchMaterials(serviceId) // обновляем список
      return data
    } catch (error) {
      console.error('Ошибка привязки материала:', error)
      throw error
    }
    },

    async removeMaterial(serviceId, materialId) {
    try {
      await servicesApi.removeMaterial(serviceId, materialId)
      await this.fetchMaterials(serviceId)
    } catch (error) {
      console.error('Ошибка отвязки материала:', error)
      throw error
    }
    },
  },
})