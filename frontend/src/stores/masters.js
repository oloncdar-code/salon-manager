import { defineStore } from 'pinia'
import { mastersApi } from '@/api/masters'

export const useMastersStore = defineStore('masters', {
  state: () => ({
    list: [],
    currentMaster: null,
    loading: false,
  }),

  getters: {
    getByService: (state) => (serviceId) => {
      return state.list.filter(m => 
        m.masterServices?.some(ms => ms.service_id === serviceId)
      )
    },
    // Получить список мастеров с отображением имени
    masterOptions: (state) => {
      return state.list.map(m => ({
        id: m.id,
        fullName: m.user?.full_name || `Мастер #${m.id}`
      }))
    }
  },

  actions: {
    async fetchList(params = {role: 'master'}) {
      this.loading = true
      try {
        const { data } = await mastersApi.getList(params)
        this.list = data || []
      } catch (error) {
        console.error('Ошибка загрузки мастеров:', error)
        this.list = []
      } finally {
        this.loading = false
      }
    },

    async fetchById(id) {
      this.loading = true
      try {
        const { data } = await mastersApi.getById(id)
        this.currentMaster = data
        return data
      } catch (error) {
        console.error('Ошибка загрузки мастера:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async create(data) {
      try {
        const { data: response } = await mastersApi.create(data)
        await this.fetchList()
        return response
      } catch (error) {
        console.error('Ошибка создания мастера:', error)
        throw error
      }
    },

    async update(id, data) {
      try {
        const { data: response } = await mastersApi.update(id, data)
        await this.fetchList()
        return response
      } catch (error) {
        console.error('Ошибка обновления мастера:', error)
        throw error
      }
    },

    async remove(id) {
      try {
        await mastersApi.delete(id)
        await this.fetchList()
      } catch (error) {
        console.error('Ошибка удаления мастера:', error)
        throw error
      }
    },

    async addService(masterId, serviceId) {
      try {
        const { data } = await mastersApi.addService(masterId, serviceId)
        await this.fetchList()
        return data
      } catch (error) {
        console.error('Ошибка добавления услуги мастеру:', error)
        throw error
      }
    },

    async removeService(masterServiceId) {
      try {
        await mastersApi.removeService(masterServiceId)
        await this.fetchList()
      } catch (error) {
        console.error('Ошибка удаления услуги у мастера:', error)
        throw error
      }
    },
  },
})