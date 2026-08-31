<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Записи</h1>
      <router-link to="/appointments/new">
        <AppButton variant="primary">Новая запись</AppButton>
      </router-link>
    </div>

    <!-- Фильтры -->
    <div class="bg-white p-4 rounded-lg shadow space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Статус</label>
          <select v-model="filters.status" @change="applyFilters" class="w-full border rounded px-3 py-2 pr-8">
            <option value="">Все</option>
            <option value="created">Создана</option>
            <option value="await_confirm">Ожидает подтверждения</option>
            <option value="confirmed">Подтверждена</option>
            <option value="completed">Выполнена</option>
            <option value="cancelled">Отменена</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Дата от</label>
          <input type="date" v-model="filters.dateFrom" @change="applyFilters" class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Дата до</label>
          <input type="date" v-model="filters.dateTo" @change="applyFilters" class="w-full border rounded px-3 py-2" />
        </div>
        <div class="flex items-end">
          <AppButton variant="secondary" @click="resetFilters" class="w-full">Сбросить фильтры</AppButton>
        </div>
      </div>
    </div>

    <!-- Таблица -->
    <div class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клиент</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Мастер</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Услуга</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Время начала</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Время окончания</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading">
            <td colspan="6" class="px-6 py-4 text-center">Загрузка...</td>
          </tr>
          <tr v-else-if="!store.list.length">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">Записей нет</td>
          </tr>
          <tr v-for="item in store.list" :key="item.id">
            <td class="px-6 py-4 whitespace-nowrap">{{ item.client?.user?.full_name || 'Не указан' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ item.master?.user?.full_name || 'Не указан' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ item.service?.short_name || item.service?.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ formatLocalDateTime(item.start_time) }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ formatLocalDateTime(item.end_time) }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="statusClass(item.status)" class="px-2 py-1 rounded-full text-xs">
                {{ statusLabel(item.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <router-link :to="`/appointments/${item.id}`" class="text-blue-600 hover:underline">Детали</router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Пагинация -->
    <div class="flex justify-between items-center" v-if="store.total > store.pagination.limit">
      <div class="text-sm text-gray-500">
        Показано {{ store.list.length }} из {{ store.total }}
      </div>
      <div class="flex gap-2">
        <AppButton
          variant="secondary"
          :disabled="store.pagination.page <= 1"
          @click="prevPage"
        >
          Назад
        </AppButton>
        <AppButton
          variant="secondary"
          :disabled="store.list.length < store.pagination.limit"
          @click="nextPage"
        >
          Вперед
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatLocalDateTime } from '@/utils/date';
import { ref, reactive } from 'vue'
import { useAppointmentsStore } from '@/stores/appointments'
import AppButton from '@/components/ui/AppButton.vue'

const store = useAppointmentsStore()
const loading = ref(false)

const filters = reactive({
  status: '',
  dateFrom: '',
  dateTo: '',
})

const applyFilters = () => {
  console.log('📌 Применяем фильтры:', filters)
  store.setFilters({
    status: filters.status || null,
    dateFrom: filters.dateFrom || null,
    dateTo: filters.dateTo || null,
  })
  console.log('📌 store.filters после setFilters:', store.filters)
  loading.value = true
  store.fetchList().finally(() => loading.value = false)
}

const resetFilters = () => {
  filters.status = ''
  filters.dateFrom = ''
  filters.dateTo = ''
  store.resetFilters()
  loading.value = true
  store.fetchList().finally(() => loading.value = false)
}

const prevPage = () => {
  if (store.pagination.page > 1) {
    store.setPage(store.pagination.page - 1)
    loading.value = true
    store.fetchList().finally(() => loading.value = false)
  }
}

const nextPage = () => {
  store.setPage(store.pagination.page + 1)
  loading.value = true
  store.fetchList().finally(() => loading.value = false)
}

// Определяем локальный часовой пояс пользователя
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

const statusClass = (status) => {
  const classes = {
    created: 'bg-gray-200 text-gray-700',
    await_confirm: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return classes[status] || 'bg-gray-100 text-gray-600'
}

const statusLabel = (status) => {
  const labels = {
    created: 'Создана',
    await_confirm: 'Ожидает',
    confirmed: 'Подтверждена',
    completed: 'Выполнена',
    cancelled: 'Отменена',
  }
  return labels[status] || status
}

// Первая загрузка
loading.value = true
store.fetchList().finally(() => loading.value = false)
</script>