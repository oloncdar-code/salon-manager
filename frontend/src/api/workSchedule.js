import api from './index'

export const workScheduleApi = {
  // Получить график по мастеру и месяцу
  getByMonth(masterId, year, month) {
    return api.get(`/work-schedule`, {
      params: { masterId, year, month }
    })
  },
  // Получить конкретный день
  getByDate(masterId, date) {
    return api.get(`/work-schedule/${masterId}/${date}`)
  },
  // Создать/обновить запись графика
  upsert(data) {
    return api.post('/work-schedule', data)
  },
  // Удалить запись
  delete(id) {
    return api.delete(`/work-schedule/${id}`)
  }
}