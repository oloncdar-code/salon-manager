import { defineStore } from 'pinia'
import { usersApi } from '@/api/users'

export const useUsersStore = defineStore('users', {
  state: () => ({
    list: [],
    loading: false,
  }),
  actions: {
    async fetchList(params = {}) {
      this.loading = true
      try {
        const { data } = await usersApi.getList(params)
        this.list = data || []
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error)
        this.list = []
      } finally {
        this.loading = false
      }
    },
  },
})