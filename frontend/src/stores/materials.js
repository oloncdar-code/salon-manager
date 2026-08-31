import { defineStore } from 'pinia'
import { materialsApi } from '@/api/materials'

export const useMaterialsStore = defineStore('materials', {
  state: () => ({
    list: [],
    currentMaterial: null,
    loading: false,
  }),

  getters: {
    // Активная цена материала
    getActivePrice: (state) => (materialId) => {
      const material = state.list.find(m => m.id === materialId)
      return material?.prices?.find(p => p.is_active) || null
    },
    // Материалы для конкретной услуги (через service_materials)
    getByService: (state) => (serviceId) => {
      return state.list.filter(m =>
        m.serviceMaterials?.some(sm => sm.service_id === serviceId)
      )
    },
  },

  actions: {
    async fetchList(params = {}) {
      this.loading = true
      try {
        const { data } = await materialsApi.getList(params)
        this.list = data || []
      } catch (error) {
        console.error('Ошибка загрузки материалов:', error)
        this.list = []
      } finally {
        this.loading = false
      }
    },

    async fetchById(id) {
      this.loading = true
      try {
        const { data } = await materialsApi.getById(id)
        this.currentMaterial = data
        return data
      } catch (error) {
        console.error('Ошибка загрузки материала:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async create(data) {
      try {
        const { data: response } = await materialsApi.create(data)
        await this.fetchList()
        return response
      } catch (error) {
        console.error('Ошибка создания материала:', error)
        throw error
      }
    },

    async update(id, data) {
      try {
        const { data: response } = await materialsApi.update(id, data)
        await this.fetchList()
        return response
      } catch (error) {
        console.error('Ошибка обновления материала:', error)
        throw error
      }
    },

    async remove(id) {
      try {
        await materialsApi.delete(id)
        await this.fetchList()
      } catch (error) {
        console.error('Ошибка удаления материала:', error)
        throw error
      }
    },

    async setPrice(materialId, price) {
      try {
        const { data } = await materialsApi.setPrice(materialId, { price })
        await this.fetchList()
        return data
      } catch (error) {
        console.error('Ошибка установки цены:', error)
        throw error
      }
    },

    async addToService(materialId, serviceId) {
      try {
        const { data } = await materialsApi.addToService(materialId, serviceId)
        await this.fetchList()
        return data
      } catch (error) {
        console.error('Ошибка привязки материала к услуге:', error)
        throw error
      }
    },

    async removeFromService(serviceMaterialId) {
      try {
        await materialsApi.removeFromService(serviceMaterialId)
        await this.fetchList()
      } catch (error) {
        console.error('Ошибка отвязки материала от услуги:', error)
        throw error
      }
    },
  },
})