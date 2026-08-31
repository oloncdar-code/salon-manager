import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

vi.mock('@/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('login sets token and user', async () => {
    const mockToken = 'fake-jwt-token'
    const mockUser = { id: 1, role: 'admin' }
    api.post.mockResolvedValue({ data: { access_token: mockToken, user: mockUser } })

    const store = useAuthStore()
    await store.login({ phone: '123', password: 'pass' })

    expect(store.token).toBe(mockToken)
    expect(store.user).toEqual(mockUser)
    expect(localStorage.getItem('token')).toBe(mockToken)
  })

  it('logout clears token and user', () => {
    const store = useAuthStore()
    store.token = 'token'
    store.user = { id: 1 }
    store.logout()

    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
  })
})