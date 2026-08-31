import axios from 'axios'
import { useToast } from 'vue-toastification'

export * from './appointments'
export * from './masters'
export * from './services'
export * from './materials'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
})

// Перехватчик запросов для добавления токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Перехватчик ответов для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const toast = useToast()
    
    // Обработка 401 (неавторизован)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      toast.error('Сессия истекла. Войдите заново.')
      return Promise.reject(error)
    }

    const message = error.response?.data?.message || 'Произошла ошибка. Попробуйте позже.'
    toast.error(message)
    
    return Promise.reject(error)
  }
)

export default api