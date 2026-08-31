import { defineStore } from 'pinia'
import { workScheduleApi } from '@/api/workSchedule'

    export const useWorkScheduleStore = defineStore('workSchedule', {
    state: () => ({
        entries: [], // все записи
        loading: false,
    }),

    getters: {
        getEntriesByMaster: (state) => (masterId) => {
        return state.entries.filter(e => e.master_id === masterId)
        },
    },

    actions: {
        async fetchByMonth(masterId, year, month) {
        this.loading = true
        try {
            const { data } = await workScheduleApi.getByMonth(masterId, year, month)
            // Обновляем entries: удаляем старые для этого мастера и добавляем новые
            this.entries = this.entries.filter(e => e.master_id !== masterId)
            this.entries.push(...data)
            return data
        } catch (error) {
            console.error('Ошибка загрузки графика:', error)
            throw error
        } finally {
            this.loading = false
        }
    },

    async upsert(data) {
      try {
        const { data: response } = await workScheduleApi.upsert(data)
        // обновляем локальный список, если запись относится к текущему месяцу
        const idx = this.entries.findIndex(e => e.id === response.id)
        if (idx !== -1) {
          this.entries[idx] = response
        } else {
          this.entries.push(response)
        }
        return response
      } catch (error) {
        console.error('Ошибка сохранения графика:', error)
        throw error
      }
    },

    async delete(id) {
      try {
        await workScheduleApi.delete(id)
        this.entries = this.entries.filter(e => e.id !== id)
      } catch (error) {
        console.error('Ошибка удаления графика:', error)
        throw error
      }
    }
  }
})