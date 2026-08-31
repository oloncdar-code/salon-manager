import { defineStore } from 'pinia'
import { usersApi } from '@/api/users'

export const useClientsStore = defineStore('clients', {
  actions: {
    async findByPhone(phone) {
      try {
        const { data } = await usersApi.findByPhone(phone)
        // Проверяем, что пользователь имеет роль 'client'
        if (data && data.role === 'client') {
          return data
        }
        return null
      } catch (error) {
        // Если 404 или другой статус – возвращаем null
        if (error.response?.status === 404) return null
        throw error
      }
    },
  },
})