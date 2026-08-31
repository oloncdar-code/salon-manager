<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Канбан-доска</h1>
    </div>

    <!-- Фильтры -->
    <div class="bg-white p-4 rounded-lg shadow flex flex-wrap items-end gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Дата</label>
        <input
          type="date"
          v-model="selectedDate"
          class="border rounded px-3 py-2"
          @change="loadBoard"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Мастер</label>
        <select v-model="selectedMasterId" class="border rounded px-3 py-2" @change="loadBoard">
          <option value="">Все мастера</option>
          <option v-for="m in mastersStore.list" :key="m.id" :value="m.id">
            {{ m.user?.full_name || `Мастер #${m.id}` }}
          </option>
        </select>
      </div>
      <AppButton variant="primary" @click="loadBoard">Обновить</AppButton>
    </div>

    <!-- Загрузка -->
    <div v-if="store.loading" class="text-center py-8">Загрузка...</div>

    <!-- Доска -->
    <div v-else-if="hasData" class="flex gap-4 overflow-x-auto pb-4">
      <KanbanColumn
        v-for="col in columns"
        :key="col.status"
        :title="col.title"
        :status="col.status"
        :items="store.boardData[col.status] || []"
        :show-master="!selectedMasterId"
        @update-status="updateStatus"
        @card-click="goToDetail"
      />
    </div>
    <div v-else class="text-center py-8 text-gray-500">
      Нет записей на выбранную дату
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppointmentsStore } from '@/stores/appointments'
import { useMastersStore } from '@/stores/masters'
import AppButton from '@/components/ui/AppButton.vue'
import KanbanColumn from './components/KanbanColumn.vue'

const router = useRouter()
const store = useAppointmentsStore()
const mastersStore = useMastersStore()

// Текущая дата (локальная)
const today = new Date()
const year = today.getFullYear()
const month = String(today.getMonth() + 1).padStart(2, '0')
const day = String(today.getDate()).padStart(2, '0')
const selectedDate = ref(`${year}-${month}-${day}`)
const selectedMasterId = ref('')

const columns = [
  { status: 'created', title: 'Создана' },
  { status: 'await_confirm', title: 'Ожидает подтверждения' },
  { status: 'confirmed', title: 'Подтверждена' },
  { status: 'completed', title: 'Выполнена' },
  { status: 'cancelled', title: 'Отменена' },
]

const hasData = computed(() => {
  return Object.values(store.boardData).some(arr => arr.length > 0)
})

const loadBoard = async () => {
  if (!selectedDate.value) return
  await store.fetchForBoard(selectedDate.value, selectedMasterId.value || null)
}

const updateStatus = async ({ id, status }) => {
  try {
    await store.updateStatus(id, status)
    await loadBoard()
  } catch (error) {
    console.error('Ошибка обновления статуса:', error)
    alert('Не удалось изменить статус')
  }
}

const goToDetail = (appointment) => {
  if (!appointment?.id) return
  router.push(`/appointments/${appointment.id}`)
}

onMounted(async () => {
  await mastersStore.fetchList()
  await loadBoard()
})
</script>