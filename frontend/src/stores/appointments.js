import { defineStore } from 'pinia'
import { appointmentsApi } from '@/api/appointments'

export const useAppointmentsStore = defineStore('appointments', {
  state: () => ({
    list: [],
    currentAppointment: null,
    loading: false,
    total: 0,
    boardData: {
      created: [],
      await_confirm: [],
      confirmed: [],
      completed: [],
      cancelled: [],
    },
    filters: {
      status: null,
      dateFrom: null,
      dateTo: null,
      masterId: null,
      clientId: null,
    },
    pagination: {
      page: 1,
      limit: 20,
    },
  }),

  actions: {
    async fetchList() {
      this.loading = true
      try {
        const params = {
          ...this.filters,
          page: this.pagination.page,
          limit: this.pagination.limit,
        }
        Object.keys(params).forEach(key => {
          if (params[key] === null || params[key] === undefined) delete params[key]
        })
        console.log('📥 Запрос списка с params:', params)
        const { data } = await appointmentsApi.getList(params)
        console.log('📥 Получен список:', data)
        if (Array.isArray(data)) {
          this.list = data
          this.total = data.length
        } else if (data && typeof data === 'object') {
          this.list = data.items || data.data || []
          this.total = data.total || this.list.length
        } else {
          this.list = []
          this.total = 0
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки записей:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchById(id) {
      this.loading = true
      try {
        console.log('📥 Запрос записи по ID:', id)
        const { data } = await appointmentsApi.getById(id)
        console.log('📥 Получена запись:', data)
        this.currentAppointment = data
        return data
      } catch (error) {
        console.error('❌ Ошибка загрузки записи:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async create(data) {
      try {
        console.log('📤 Отправка запроса на создание:', data)
        const response = await appointmentsApi.create(data)
        console.log('📥 Полный ответ от бэкенда:', response)
        console.log('📥 response.data:', response.data)
        const appointment = response.data
        console.log('📝 Созданная запись:', appointment)
        await this.fetchList()
        return appointment
      } catch (error) {
        console.error('❌ Ошибка в store.create:', error)
        console.error('❌ error.response:', error.response)
        console.error('❌ error.response?.data:', error.response?.data)
        throw error
      }
    },

    async updateStatus(id, status) {
      try {
        console.log('📤 Обновление статуса:', { id, status })
        const { data } = await appointmentsApi.updateStatus(id, status)
        const index = this.list.findIndex(item => item.id === id)
        if (index !== -1) this.list[index].status = status
        if (this.currentAppointment?.id === id) this.currentAppointment.status = status
        console.log('✅ Статус обновлён:', data)
        return data
      } catch (error) {
        console.error('❌ Ошибка обновления статуса:', error)
        throw error
      }
    },

    async update(id, data) {
      try {
        console.log('📤 Обновление записи:', { id, data })
        const { data: response } = await appointmentsApi.update(id, data)
        await this.fetchList()
        return response
      } catch (error) {
        console.error('❌ Ошибка обновления записи:', error)
        throw error
      }
    },

    async addService(data) {
      try {
        console.log('📤 Добавление услуги в запись:', data)
        const { data: response } = await appointmentsApi.addService(data)
        console.log('✅ Услуга добавлена:', response)
        if (this.currentAppointment) {
          await this.fetchById(this.currentAppointment.id)
        }
        return response
      } catch (error) {
        console.error('❌ Ошибка добавления услуги:', error)
        throw error
      }
    },

    async removeService(id) {
      try {
        await appointmentsApi.deleteService(id)
        if (this.currentAppointment) {
          await this.fetchById(this.currentAppointment.id)
        }
      } catch (error) {
        console.error('Ошибка удаления услуги:', error)
        throw error
      }
    },
    async getSlots(masterId, date, serviceId) {
      try {
        const { data } = await appointmentsApi.getSlots({ masterId, date, serviceId })
        return data
      } catch (error) {
        console.error('Ошибка загрузки слотов:', error)
        throw error
      }
    },

    async fetchForBoard(date, masterId = null) {
      this.loading = true
      try {
        const params = { dateFrom: date, dateTo: date }
        if (masterId) params.masterId = masterId
        const { data } = await appointmentsApi.getList(params)
        console.log('📥 Данные с бэкенда:', data)

        const grouped = {
          created: [],
          await_confirm: [],
          confirmed: [],
          completed: [],
          cancelled: [],
        }
        data.forEach(item => {
          if (grouped[item.status]) {
            grouped[item.status].push(item)
          } else {
            console.warn('⚠️ Неизвестный статус:', item.status)
          }
        })
        console.log('📊 Сгруппировано:', grouped)
        this.boardData = grouped
        return grouped
      } catch (error) {
        console.error('Ошибка загрузки записей для доски:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // === НОВЫЕ МЕТОДЫ ДЛЯ ФИЛЬТРОВ И ПАГИНАЦИИ ===
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
      this.pagination.page = 1 // сброс на первую страницу при фильтрации
      console.log('📌 Применяем фильтры:', this.filters)
    },

    resetFilters() {
      this.filters = {
        status: null,
        dateFrom: null,
        dateTo: null,
        masterId: null,
        clientId: null,
      }
      this.pagination.page = 1
      console.log('🔄 Фильтры сброшены')
    },

    setPage(page) {
      this.pagination.page = page
    },
  },
})