import { defineStore } from 'pinia'
import api from '@/api'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null, // { id, email, role, full_name, phone, ... }
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isMaster: (state) => state.user?.role === 'master',
    isClient: (state) => state.user?.role === 'client',
    canManageMaterials: (state) => {
      const role = state.user?.role
      return role === 'admin' || role === 'master'
    },
  },

  actions: {
  async login(credentials) {
    try {
      const { data } = await api.post('/auth/login', credentials)
      this.setToken(data.access_token)
      this.user = data.user  
      await router.push('/appointments')
    } catch (error) {
    throw error
  }
  },

  async fetchUser() {
    try {
      const { data } = await api.get('/auth/me')
      this.user = data
    } catch (error) {
      console.error('Ошибка загрузки пользователя:', error)
      this.logout() // если токен невалиден
    }
  },

    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      router.push('/login')
    },
  },
})