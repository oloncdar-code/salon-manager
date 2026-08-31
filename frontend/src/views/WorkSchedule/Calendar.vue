<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold">Мой график работы</h1>

    <div class="bg-white p-4 rounded-lg shadow flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-2">
        <AppButton variant="secondary" @click="prevMonth">‹</AppButton>
        <span class="text-lg font-medium min-w-[150px] text-center">
          {{ monthName }} {{ currentYear }}
        </span>
        <AppButton variant="secondary" @click="nextMonth">›</AppButton>
      </div>
      <AppButton variant="secondary" @click="today">Сегодня</AppButton>
    </div>

    <div v-if="masterId" class="bg-white rounded-lg shadow p-4">
      <div v-if="store.loading" class="text-center py-8">Загрузка...</div>
      <div v-else>
        <div class="grid grid-cols-7 gap-1 mb-2 text-center font-medium text-gray-500">
          <div v-for="day in weekDays" :key="day">{{ day }}</div>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="day in calendarDays"
            :key="day.date"
            class="relative min-h-[80px] p-1 border rounded cursor-pointer hover:bg-gray-50 transition"
            :class="{
              'bg-gray-100 text-gray-400': day.isOtherMonth,
              'bg-blue-50 border-blue-300': day.isToday && !day.isOtherMonth,
              'border-green-400': day.isWorking,
              'border-red-400': day.isDayOff,
            }"
            @click="openModal(day)"
          >
            <div class="text-sm font-medium" :class="{ 'text-gray-400': day.isOtherMonth }">
              {{ day.day }}
            </div>
            <div v-if="day.isWorking && !day.isOtherMonth" class="text-xs text-green-600 mt-1">
              {{ day.startTime }} – {{ day.endTime }}
            </div>
            <div v-if="day.isDayOff && !day.isOtherMonth" class="text-xs text-red-500 mt-1">
              Выходной
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8 text-gray-500">
      Нет данных о вашем графике работы
    </div>

    <!-- Модалка редактирования (такая же, как раньше) -->
    <Modal v-if="showModal" @close="showModal = false">
      <template #header>
        {{ formatDateOnly(selectedDay?.date) }}
      </template>
      <template #body>
        <div class="space-y-4">
          <div>
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="editForm.isDayOff" />
              <span class="text-sm font-medium">Выходной</span>
            </label>
          </div>
          <div v-if="!editForm.isDayOff" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Начало работы</label>
              <input type="time" v-model="editForm.startTime" class="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Окончание работы</label>
              <input type="time" v-model="editForm.endTime" class="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <div v-if="!editForm.isDayOff" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Начало перерыва</label>
              <input type="time" v-model="editForm.breakStart" class="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Окончание перерыва</label>
              <input type="time" v-model="editForm.breakEnd" class="w-full border rounded px-3 py-2" />
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <AppButton variant="primary" @click="saveDay">Сохранить</AppButton>
        <AppButton variant="danger" @click="deleteDay" v-if="selectedDay?.id">Удалить</AppButton>
        <AppButton variant="secondary" @click="showModal = false">Отмена</AppButton>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useWorkScheduleStore } from '@/stores/workSchedule'
import { useMastersStore } from '@/stores/masters'
import { useAuthStore } from '@/stores/auth'
import AppButton from '@/components/ui/AppButton.vue'
import Modal from '@/components/ui/Modal.vue'
import { formatLocalTime, formatDateOnly } from '@/utils/date'

const store = useWorkScheduleStore()
const mastersStore = useMastersStore()
const authStore = useAuthStore()

const masterId = ref(null)
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const showModal = ref(false)
const selectedDay = ref(null)

const editForm = reactive({
  isDayOff: false,
  startTime: '',
  endTime: '',
  breakStart: '',
  breakEnd: '',
})

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const monthName = computed(() => {
  return new Date(currentYear.value, currentMonth.value).toLocaleString('ru-RU', { month: 'long' })
})

const loadSchedule = async () => {
  if (!masterId.value) return
  await store.fetchByMonth(
    masterId.value,
    currentYear.value,
    currentMonth.value + 1
  )
}

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()

  let startOffset = firstDay.getDay() - 1
  if (startOffset < 0) startOffset = 6

  const days = []
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // Предыдущий месяц
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i
    const dateObj = new Date(year, month - 1, d)
    const dateStr = dateObj.toLocaleDateString('sv')
    days.push({
      day: d,
      date: dateStr,
      isOtherMonth: true,
      isToday: false,
      isWorking: false,
      isDayOff: false,
    })
  }

  // Текущий месяц
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d)
    const dateStr = dateObj.toLocaleDateString('sv')
    const entry = store.entries.find(e => e.date === dateStr)
    const isToday = dateStr === todayStr

    days.push({
      day: d,
      date: dateStr,
      isOtherMonth: false,
      isToday,
      isWorking: entry && entry.is_working,
      isDayOff: entry && !entry.is_working,
      startTime: entry?.start_time ? formatLocalTime(entry.start_time) : null,
      endTime: entry?.end_time ? formatLocalTime(entry.end_time) : null,
      id: entry?.id || null,
      entry: entry || null,
    })
  }

  // Следующий месяц (заполнение до 42 ячеек)
  const totalDays = days.length
  const remaining = (7 - (totalDays % 7)) % 7
  for (let d = 1; d <= remaining; d++) {
    const dateObj = new Date(year, month + 1, d)
    const dateStr = dateObj.toLocaleDateString('sv')
    days.push({
      day: d,
      date: dateStr,
      isOtherMonth: true,
      isToday: false,
      isWorking: false,
      isDayOff: false,
    })
  }

  return days
})

const openModal = (day) => {
  if (day.isOtherMonth) return
  selectedDay.value = day
  if (day.entry) {
    editForm.isDayOff = !day.entry.is_working
    editForm.startTime = day.entry?.start_time ? formatLocalTime(day.entry.start_time) : ''
    editForm.endTime = day.entry?.end_time ? formatLocalTime(day.entry.end_time) : ''
    editForm.breakStart = day.entry?.break_start ? formatLocalTime(day.entry.break_start) : ''
    editForm.breakEnd = day.entry?.break_end ? formatLocalTime(day.entry.break_end) : ''
  } else {
    editForm.isDayOff = false
    editForm.startTime = '09:00'
    editForm.endTime = '18:00'
    editForm.breakStart = ''
    editForm.breakEnd = ''
  }
  showModal.value = true
}

const saveDay = async () => {
  if (!masterId.value || !selectedDay.value) return

  const dateStr = selectedDay.value.date
  const payload = {
    masterId: masterId.value,
    date: dateStr,
    isWorking: !editForm.isDayOff,
    startTime: editForm.isDayOff ? null : `${dateStr}T${editForm.startTime}:00+07:00`,
    endTime: editForm.isDayOff ? null : `${dateStr}T${editForm.endTime}:00+07:00`,
    breakStart: editForm.isDayOff || !editForm.breakStart ? null : `${dateStr}T${editForm.breakStart}:00+07:00`,
    breakEnd: editForm.isDayOff || !editForm.breakEnd ? null : `${dateStr}T${editForm.breakEnd}:00+07:00`,
  }

  try {
    await store.upsert(payload)
    showModal.value = false
    await loadSchedule()
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    showToast.error('Не удалось сохранить график')
  }
}

const deleteDay = async () => {
  if (!selectedDay.value?.id) return
  if (!confirm('Удалить запись для этого дня?')) return
  try {
    await store.delete(selectedDay.value.id)
    showModal.value = false
    await loadSchedule()
  } catch (error) {
    console.error('Ошибка удаления:', error)
    showToast.error('Не удалось удалить запись')
  }
}

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}
const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}
const today = () => {
  const d = new Date()
  currentYear.value = d.getFullYear()
  currentMonth.value = d.getMonth()
}

watch(
  [masterId, currentYear, currentMonth],
  () => {
    loadSchedule()
  },
  { immediate: true }
)

// Определяем masterId по текущему пользователю
onMounted(async () => {
  await mastersStore.fetchList()
  const user = authStore.user
  if (user && (user.role === 'admin' || user.role === 'master')) {
    const master = mastersStore.list.find(m => m.user_id === user.id)
    if (master) {
      masterId.value = master.id
    } else {
      // Если мастера нет, можно создать запись автоматически? Или показать сообщение.
      console.warn('Для текущего пользователя не найден мастер')
    }
  } else {
    // Если роль клиент или что-то ещё – перенаправить?
    console.warn('Доступ запрещён')
  }
})
</script>