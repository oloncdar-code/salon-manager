import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAppointmentsStore } from '@/stores/appointments'
import { appointmentsApi } from '@/api/appointments'

// Мокаем API
vi.mock('@/api/appointments', () => ({
  appointmentsApi: {
    getList: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
    deleteService: vi.fn(),
    getSlots: vi.fn(),
  },
}))

describe('appointmentsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fetchList fetches appointments and updates state', async () => {
    const mockData = [{ id: 1, client: {} }, { id: 2 }]
    appointmentsApi.getList.mockResolvedValue({ data: mockData })

    const store = useAppointmentsStore()
    await store.fetchList()

    expect(store.list).toEqual(mockData)
    expect(store.total).toBe(2)
    expect(store.loading).toBe(false)
  })

  it('create sends correct payload and refetches list', async () => {
    const payload = {
      masterId: 1,
      serviceId: 2,
      startTime: '2026-08-31T10:00:00.000Z',
      clientPhone: '+79990001133',
      clientFullName: 'Иванов Иван',
    }
    const created = { id: 100 }
    appointmentsApi.create.mockResolvedValue({ data: created })
    appointmentsApi.getList.mockResolvedValue({ data: [] })

    const store = useAppointmentsStore()
    const result = await store.create(payload)

    expect(appointmentsApi.create).toHaveBeenCalledWith(payload)
    expect(result).toEqual(created)
    expect(appointmentsApi.getList).toHaveBeenCalled()
  })

  it('updateStatus updates status in list and current appointment', async () => {
    const store = useAppointmentsStore()
    store.list = [{ id: 1, status: 'created' }]
    store.currentAppointment = { id: 1, status: 'created' }

    appointmentsApi.updateStatus.mockResolvedValue({ data: {} })

    await store.updateStatus(1, 'confirmed')

    expect(store.list[0].status).toBe('confirmed')
    expect(store.currentAppointment.status).toBe('confirmed')
  })

  // В развитии добавить тесты для removeService, getSlots и т.д.
})