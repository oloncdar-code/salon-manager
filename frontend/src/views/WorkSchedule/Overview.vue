<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Общий график работы</h1>
    </div>

    <!-- Навигация -->
    <div class="bg-white p-4 rounded-lg shadow flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-2">
        <AppButton variant="secondary" @click="prevMonth">‹</AppButton>
        <span class="text-lg font-medium min-w-[150px] text-center">
          {{ monthName }} {{ currentYear }}
        </span>
        <AppButton variant="secondary" @click="nextMonth">›</AppButton>
      </div>
      <AppButton variant="secondary" @click="today">Сегодня</AppButton>
      <div class="flex items-center gap-4 ml-auto">
        <span class="flex items-center gap-1 text-sm">
          <span class="w-3 h-3 bg-green-200 rounded"></span> Работает
        </span>
        <span class="flex items-center gap-1 text-sm">
          <span class="w-3 h-3 bg-red-200 rounded"></span> Выходной
        </span>
        <span class="flex items-center gap-1 text-sm">
          <span class="w-3 h-3 bg-gray-100 rounded"></span> Не задано
        </span>
      </div>
    </div>

    <!-- Таблица -->
    <div v-if="loading" class="text-center py-8">Загрузка...</div>
    <div v-else-if="mastersStore.list.length === 0" class="text-center py-8 text-gray-500">
      Нет мастеров
    </div>
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="sticky left-0 bg-gray-50 z-10 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase min-w-[150px]">
                Мастер
              </th>
              <th
                v-for="day in days"
                :key="day"
                class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase min-w-[60px]"
                :class="{ 'bg-blue-50': day === todayDay }"
              >
                {{ day }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="master in mastersStore.list" :key="master.id">
              <td class="sticky left-0 bg-white z-10 px-4 py-2 text-sm font-medium border-r">
                {{ master.user?.full_name || `Мастер #${master.id}` }}
              </td>
              <td
                v-for="day in days"
                :key="`${master.id}-${day}`"
                class="px-2 py-2 text-center text-sm cursor-pointer hover:bg-gray-50 transition"
                :class="getCellClass(master.id, day)"
                @click="openModal(master.id, day)"
              >
                {{ getCellText(master.id, day) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Модалка редактирования -->
    <DayEditModal
      v-model:show="showModal"
      :day="selectedDay"
      :master-id="selectedMasterId"
      :on-saved="loadOverview"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useWorkScheduleStore } from '@/stores/workSchedule'
import { useMastersStore } from '@/stores/masters'
import AppButton from '@/components/ui/AppButton.vue'
import DayEditModal from './DayEditModal.vue'
import { formatLocalTime } from '@/utils/date' // <-- добавлен импорт

const store = useWorkScheduleStore()
const mastersStore = useMastersStore()

const loading = ref(false)
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const showModal = ref(false)
const selectedDay = ref(null)
const selectedMasterId = ref(null)

const scheduleData = ref({})

const monthName = computed(() => {
  return new Date(currentYear.value, currentMonth.value).toLocaleString('ru-RU', { month: 'long' })
})

// Дни месяца
const days = computed(() => {
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => i + 1)
})

const todayDay = computed(() => {
  const now = new Date()
  if (now.getFullYear() === currentYear.value && now.getMonth() === currentMonth.value) {
    return now.getDate()
  }
  return null
})

// Загрузка общего графика (для всех мастеров)
const loadOverview = async () => {
  if (mastersStore.list.length === 0) return
  loading.value = true
  try {
    const year = currentYear.value
    const month = currentMonth.value + 1

    const promises = mastersStore.list.map(master =>
      store.fetchByMonth(master.id, year, month)
    )
    await Promise.all(promises)

    const data = {}
    mastersStore.list.forEach(master => {
      const entries = store.getEntriesByMaster(master.id)
      data[master.id] = {}
      entries.forEach(entry => {
        data[master.id][entry.date] = entry
      })
    })
    scheduleData.value = data
  } catch (error) {
    console.error('Ошибка загрузки общего графика:', error)
    alert('Не удалось загрузить график')
  } finally {
    loading.value = false
  }
}

// Получить запись для мастера и дня
const getEntry = (masterId, day) => {
  const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return scheduleData.value[masterId]?.[dateStr] || null
}

// Класс ячейки
const getCellClass = (masterId, day) => {
  const entry = getEntry(masterId, day)
  if (!entry) return 'bg-gray-50'
  if (entry.is_working) return 'bg-green-100'
  return 'bg-red-100'
}

// Текст в ячейке (с использованием formatLocalTime)
const getCellText = (masterId, day) => {
  const entry = getEntry(masterId, day)
  if (!entry) return '—'
  if (!entry.is_working) return 'Вых'
  // Используем formatLocalTime для корректного отображения локального времени
  const start = entry.start_time ? formatLocalTime(entry.start_time) : ''
  const end = entry.end_time ? formatLocalTime(entry.end_time) : ''
  return start && end ? `${start}-${end}` : 'Работает'
}

// Открыть модалку
const openModal = (masterId, day) => {
  const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const entry = getEntry(masterId, day)
  selectedMasterId.value = masterId
  selectedDay.value = {
    date: dateStr,
    entry: entry,
    id: entry?.id || null,
    isWorking: entry?.is_working || false,
    isDayOff: entry ? !entry.is_working : false,
    startTime: entry?.start_time || null,
    endTime: entry?.end_time || null,
  }
  showModal.value = true
}

// Навигация
const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
  loadOverview()
}
const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
  loadOverview()
}
const today = () => {
  const d = new Date()
  currentYear.value = d.getFullYear()
  currentMonth.value = d.getMonth()
  loadOverview()
}

onMounted(async () => {
  await mastersStore.fetchList()
  await loadOverview()
})
</script>

<style scoped>
.sticky {
  position: sticky;
}
</style>