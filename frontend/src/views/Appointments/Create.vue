<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
      <router-link to="/appointments" class="text-blue-600 hover:underline">← Назад</router-link>
      <h1 class="text-2xl font-bold">Новая запись</h1>
    </div>

    <form @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow p-6 space-y-6">
      <!-- Клиент -->
      <div class="border-b pb-4">
        <h3 class="text-lg font-medium mb-3">Клиент</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Телефон *</label>
            <div class="flex gap-2">
              <input
                type="text"
                v-model="clientPhone"
                placeholder="+7 (999) 123-45-67"
                class="flex-1 border rounded px-3 py-2"
                @input="onPhoneInput"
              />
              <AppButton
                type="button"
                variant="secondary"
                @click="checkClient"
                :disabled="!clientPhone || checking"
              >
                {{ checking ? 'Проверка...' : 'Проверить' }}
              </AppButton>
            </div>
            <div v-if="clientFound === true" class="text-sm text-green-600 mt-1">
              ✓ Клиент найден: {{ foundClient?.full_name }}
            </div>
            <div v-if="clientFound === false" class="text-sm text-yellow-600 mt-1">
              ⚠️ Клиент не найден. Введите ФИО вручную.
            </div>
          </div>
          <div v-if="showFullNameInput">
            <label class="block text-sm font-medium mb-1">ФИО клиента *</label>
            <input
              type="text"
              v-model="form.clientFullName"
              class="w-full border rounded px-3 py-2"
              placeholder="Иванов Иван Иванович"
              required
            />
          </div>
          <div v-else-if="foundClient">
            <label class="block text-sm font-medium mb-1">ФИО клиента</label>
            <div class="font-medium">{{ foundClient.full_name }}</div>
          </div>
        </div>
        <input type="hidden" v-model="form.clientId" />
      </div>

      <!-- Вид услуг (категория) -->
      <div>
        <label class="block text-sm font-medium mb-1">Вид услуг (категория) *</label>
        <select
          v-model="selectedCategoryId"
          class="w-full border rounded px-3 py-2"
          required
          @change="onCategoryChange"
        >
          <option value="">Выберите вид услуг</option>
          <option v-for="cat in categoryServices" :key="cat.id" :value="cat.id">
            {{ cat.short_name || cat.name }}
          </option>
        </select>
      </div>

      <!-- Мастер -->
      <div>
        <label class="block text-sm font-medium mb-1">Мастер *</label>
        <select
          v-model="form.masterId"
          class="w-full border rounded px-3 py-2"
          required
          @change="onMasterChange"
        >
          <option value="">Выберите мастера</option>
          <option v-for="m in filteredMasters" :key="m.id" :value="m.id">
            {{ masterDisplayName(m) }}
          </option>
        </select>
      </div>

      <!-- Дата -->
      <div>
        <label class="block text-sm font-medium mb-1">Дата *</label>
        <input
          type="date"
          v-model="form.date"
          class="w-full border rounded px-3 py-2"
          :min="minDate"
          required
          @change="onDateChange"
        />
      </div>

      <!-- Слоты с учётом загрузки -->
      <div v-if="loadingSlots" class="text-sm text-gray-500">
        Загрузка доступного времени...
      </div>
      <div v-else-if="slots.length > 0">
        <label class="block text-sm font-medium mb-2">Доступное время</label>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="slot in slots"
            :key="slot.start"
            type="button"
            class="border rounded px-3 py-2 hover:bg-blue-50 transition"
            :class="{ 'border-blue-600 bg-blue-50': selectedSlot === slot.start }"
            @click="selectSlot(slot.start)"
          >
            {{ formatLocalTime(slot.start) }}
          </button>
        </div>
        <p v-if="!selectedSlot" class="text-sm text-gray-500 mt-2">Выберите время</p>
        <div v-if="selectedSlot" class="text-sm text-gray-600 mt-2">
          Выбрано: {{ formatLocalDateTime(selectedSlot) }}
        </div>
      </div>
      <div v-else-if="form.masterId && selectedCategoryId && form.date && !loadingSlots" class="text-sm text-gray-500">
        Нет доступных слотов на выбранную дату
      </div>
      <div v-else class="text-sm text-gray-400">
        Выберите категорию, мастера и дату для просмотра свободного времени
      </div>

      <!-- Комментарий -->
      <div>
        <label class="block text-sm font-medium mb-1">Комментарий</label>
        <textarea
          v-model="form.comment"
          rows="3"
          class="w-full border rounded px-3 py-2"
          placeholder="Дополнительная информация"
        />
      </div>

      <!-- Кнопки -->
      <div class="flex gap-4">
        <AppButton type="submit" variant="primary" :disabled="!isFormValid">
          Создать запись
        </AppButton>
        <AppButton type="button" variant="secondary" @click="$router.push('/appointments')">
          Отмена
        </AppButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { formatLocalDateTime, formatLocalTime } from '@/utils/date'
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppointmentsStore } from '@/stores/appointments'
import { useMastersStore } from '@/stores/masters'
import { useServicesStore } from '@/stores/services'
import { useClientsStore } from '@/stores/clients'
import AppButton from '@/components/ui/AppButton.vue'
import { showToast } from '@/utils/toast'

const router = useRouter()
const appointmentsStore = useAppointmentsStore()
const mastersStore = useMastersStore()
const servicesStore = useServicesStore()
const clientsStore = useClientsStore()

// Клиент
const clientPhone = ref('')
const clientFound = ref(null)
const foundClient = ref(null)
const checking = ref(false)
const showFullNameInput = ref(false)

// Форма записи
const form = reactive({
  clientId: null,
  clientFullName: '',
  masterId: '',
  date: '',
  comment: '',
})

const selectedCategoryId = ref('')
const slots = ref([])
const selectedSlot = ref(null)
const loadingSlots = ref(false)

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

// Список категорий
const categoryServices = computed(() => {
  return servicesStore.list.filter(s => s.parent_id === null && s.is_active !== false)
})

// Мастера по выбранной категории
const filteredMasters = computed(() => {
  if (!selectedCategoryId.value) return mastersStore.list
  return mastersStore.list.filter(master => {
    const services = master.masterServices || []
    return services.some(ms => ms.service_id === selectedCategoryId.value)
  })
})

const masterDisplayName = (master) => {
  return master.user?.full_name || master.full_name || `Мастер #${master.id}`
}

// Валидность формы
const isFormValid = computed(() => {
  const hasClient = form.clientId || (clientFound.value === false && form.clientFullName)
  return hasClient && form.masterId && selectedCategoryId.value && form.date && selectedSlot.value
})

// Проверка клиента
const checkClient = async () => {
  if (!clientPhone.value || clientPhone.value.length < 10) {
    showToast.warning('Введите корректный номер телефона')
    return
  }
  checking.value = true
  try {
    const result = await clientsStore.findByPhone(clientPhone.value)
    if (result) {
      clientFound.value = true
      foundClient.value = result
      form.clientId = result.id
      showFullNameInput.value = false
      form.clientFullName = ''
    } else {
      clientFound.value = false
      foundClient.value = null
      form.clientId = null
      showFullNameInput.value = true
    }
  } catch (error) {
    console.error('Ошибка проверки клиента:', error)
    showToast.warning('Не удалось проверить клиента')
  } finally {
    checking.value = false
  }
}

// При вводе телефона сбрасываем состояние
const onPhoneInput = () => {
  clientFound.value = null
  foundClient.value = null
  form.clientId = null
  showFullNameInput.value = false
  form.clientFullName = ''
}

// Обработчики для слотов
const onCategoryChange = () => {
  selectedSlot.value = null
  if (form.masterId && form.date) fetchSlots()
}

const onMasterChange = () => {
  selectedSlot.value = null
  if (selectedCategoryId.value && form.date) fetchSlots()
}

const onDateChange = () => {
  selectedSlot.value = null
  if (form.masterId && selectedCategoryId.value) fetchSlots()
}

const fetchSlots = async () => {
  if (!form.masterId || !selectedCategoryId.value || !form.date) return
  loadingSlots.value = true
  try {
    const data = await appointmentsStore.getSlots(
      form.masterId,
      form.date,
      selectedCategoryId.value
    )
    slots.value = data || []
  } catch (error) {
    console.error('Ошибка загрузки слотов:', error)
    slots.value = []
  } finally {
    loadingSlots.value = false
  }
}

const selectSlot = (start) => {
  selectedSlot.value = start
}

// Отправка формы
const handleSubmit = async () => {
  if (!isFormValid.value) {
    showToast.warning('Заполните все обязательные поля')
    return
  }

  const payload = {
    masterId: form.masterId,
    serviceId: selectedCategoryId.value,
    startTime: selectedSlot.value,
    comment: form.comment,
  }

  if (form.clientId) {
    payload.clientId = form.clientId
  } else {
    payload.clientPhone = clientPhone.value
    payload.clientFullName = form.clientFullName
  }

  try {
    await appointmentsStore.create(payload)
    await router.push('/appointments')
  } catch (error) {
    console.error('Ошибка создания записи:', error)
    showToast.warning('Не удалось создать запись. Проверьте данные.')
  }
}

// Загрузка справочников при монтировании
onMounted(async () => {
  await Promise.all([
    mastersStore.fetchList(),
    servicesStore.fetchList(),
  ])
})

// Автообновление слотов при изменении полей
watch(
  () => [form.masterId, selectedCategoryId.value, form.date],
  () => {
    if (form.masterId && selectedCategoryId.value && form.date) {
      fetchSlots()
    }
  }
)
</script>