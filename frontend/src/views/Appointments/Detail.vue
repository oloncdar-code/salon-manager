<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Навигация -->
    <div class="flex items-center gap-4">
      <router-link to="/appointments" class="text-blue-600 hover:underline">← Назад к списку</router-link>
      <h1 class="text-2xl font-bold">
        {{ isEditing ? 'Редактирование записи' : `Запись #${appointment?.id}` }}
      </h1>
    </div>

    <div v-if="loading" class="text-center py-8">Загрузка...</div>
    <div v-else-if="!appointment" class="text-center py-8 text-gray-500">Запись не найдена</div>

    <div v-else class="bg-white rounded-lg shadow p-6 space-y-6">
      <!-- Панель статуса и кнопок -->
      <div class="flex flex-wrap justify-between items-center gap-4">
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-500">Статус:</span>
          <span :class="statusClass(appointment.status)" class="px-3 py-1 rounded-full text-sm">
            {{ statusLabel(appointment.status) }}
          </span>
        </div>
        <div class="flex gap-2 flex-wrap">
          <AppButton
            v-if="canConfirm"
            variant="primary"
            size="sm"
            @click="changeStatus('confirmed')"
          >
            Подтвердить
          </AppButton>
          <AppButton
            v-if="canComplete"
            variant="primary"
            size="sm"
            @click="changeStatus('completed')"
          >
            Выполнена
          </AppButton>
          <AppButton
            v-if="canCancel"
            variant="danger"
            size="sm"
            @click="changeStatus('cancelled')"
          >
            Отменить
          </AppButton>
          <AppButton
            v-if="!isEditing"
            variant="secondary"
            size="sm"
            @click="enableEditing"
          >
            ✏️ Редактировать
          </AppButton>
          <template v-else>
            <AppButton variant="primary" size="sm" @click="save">💾 Сохранить</AppButton>
            <AppButton variant="secondary" size="sm" @click="cancelEditing">Отмена</AppButton>
          </template>
        </div>
      </div>

      <!-- Клиент и мастер -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
        <div>
          <div class="text-sm text-gray-500">Клиент</div>
          <div class="font-medium">{{ clientName }}</div>
          <div class="text-sm text-gray-500 mt-2">Телефон</div>
          <div class="font-medium">{{ clientPhone }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500">Мастер *</div>
          <template v-if="isEditing">
            <select v-model="form.masterId" class="w-full border rounded px-3 py-2" required>
              <option value="">Выберите мастера</option>
              <option v-for="m in mastersStore.list" :key="m.id" :value="m.id">
                {{ masterDisplayName(m) }}
              </option>
            </select>
          </template>
          <template v-else>
            <div class="font-medium">{{ masterName }}</div>
            <div v-if="masterSpecializations.length" class="text-sm text-gray-500 mt-2">
              Специализация: {{ masterSpecializations.join(', ') }}
            </div>
          </template>
        </div>
      </div>

      <!-- Основная услуга и время -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
        <div>
          <div class="text-sm text-gray-500">Основная услуга (категория) *</div>
          <template v-if="isEditing">
            <select v-model="form.serviceId" class="w-full border rounded px-3 py-2" required>
              <option value="">Выберите категорию</option>
              <option v-for="s in categoryServices" :key="s.id" :value="s.id">
                {{ s.short_name || s.name }}
              </option>
            </select>
          </template>
          <template v-else>
            <div class="font-medium">{{ appointment.service?.short_name || appointment.service?.name || 'Не указана' }}</div>
          </template>
        </div>
        <div>
          <div class="text-sm text-gray-500">Дата и время</div>
          <template v-if="isEditing">
            <div class="space-y-2">
              <input type="date" v-model="form.date" class="w-full border rounded px-3 py-2" :min="minDate" />
              <div v-if="slots.length > 0" class="mt-2">
                <label class="block text-sm font-medium mb-1">Доступное время</label>
                <div class="grid grid-cols-4 gap-2">
                  <button
                    v-for="slot in slots"
                    :key="slot.start"
                    type="button"
                    class="border rounded px-3 py-2 text-sm hover:bg-blue-50 transition"
                    :class="{ 'border-blue-600 bg-blue-50': form.startTime === slot.start }"
                    @click="selectSlot(slot.start)"
                  >
                    {{ formatLocalTime(slot.start) }}
                  </button>
                </div>
                <div v-if="form.startTime" class="text-sm text-gray-600 mt-2">
                  Выбрано: {{ formatLocalDateTime(form.startTime) }}
                </div>
              </div>
              <div v-else-if="form.masterId && form.serviceId && form.date" class="text-sm text-gray-500">
                Нет доступных слотов
              </div>
            </div>
          </template>
          <template v-else>
            <div class="font-medium">{{ formatLocalDateTime(appointment.start_time) }}</div>
            <div class="text-sm text-gray-500 mt-2">Окончание</div>
            <div class="font-medium">{{ formatLocalDateTime(appointment.end_time) }}</div>
          </template>
        </div>
      </div>

      <!-- Комментарий -->
      <div class="border-t pt-4">
        <div class="text-sm text-gray-500">Комментарий</div>
        <template v-if="isEditing">
          <textarea v-model="form.comment" rows="3" class="w-full border rounded px-3 py-2 mt-1" placeholder="Дополнительная информация" />
        </template>
        <template v-else>
          <div class="mt-1">{{ appointment.comment || '—' }}</div>
        </template>
      </div>

      <!-- Дополнительные услуги -->
      <div class="border-t pt-4">
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500">Дополнительные услуги</div>
          <AppButton
            v-if="isEditing && canManageMaterials"
            variant="secondary"
            size="sm"
            @click="openAddServiceModal"
          >
            + Добавить услугу
          </AppButton>
        </div>
        <div v-if="appointmentServices.length === 0" class="text-sm text-gray-400 mt-2">
          Нет дополнительных услуг
        </div>
        <div v-else class="mt-2 space-y-2">
          <div
            v-for="item in appointmentServices"
            :key="item.id"
            class="flex justify-between items-center border-b pb-2"
          >
            <div>
              <span class="font-medium">
                {{ item.service?.short_name || item.service?.name || `Услуга #${item.service_id}` }}
              </span>
              <span v-if="item.material_id" class="text-sm text-gray-500 ml-2">
                (материал: {{ getMaterialName(item.material_id) }})
              </span>
              <span v-if="item.service_price" class="text-sm text-gray-600 ml-2">
                {{ item.service_price }} ₽
              </span>
              <span v-if="item.material_price" class="text-sm text-gray-600">
                + {{ item.material_price }} ₽
              </span>
              <span v-if="item.discount" class="text-sm text-green-600 ml-2">
                скидка {{ item.discount }} ₽
              </span>
            </div>
            <AppButton
              v-if="isEditing && canManageMaterials"
              variant="danger"
              size="xs"
              @click="removeService(item.id)"
            >
              ✕
            </AppButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка добавления дополнительной услуги -->
    <Modal v-if="showAddServiceModal" @close="closeAddServiceModal">
      <template #header>Добавить дополнительную услугу</template>
      <template #body>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Услуга *</label>
            <select v-model="newService.serviceId" class="w-full border rounded px-3 py-2">
              <option value="">Выберите услугу</option>
              <option
                v-for="s in availableChildServices"
                :key="s.id"
                :value="s.id"
              >
                {{ s.short_name || s.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Материал (опционально)</label>
            <select v-model="newService.materialId" class="w-full border rounded px-3 py-2">
              <option value="">Без материала</option>
              <option
                v-for="m in availableMaterialsForService"
                :key="m.id"
                :value="m.id"
              >
                {{ m.short_name || m.name }} ({{ getMaterialPrice(m.id) || 0 }} ₽)
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Скидка (₽)</label>
            <input
              type="number"
              v-model="newService.discount"
              min="0"
              step="0.01"
              class="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <AppButton variant="primary" @click="addService">Добавить</AppButton>
        <AppButton variant="secondary" @click="closeAddServiceModal">Отмена</AppButton>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { formatLocalDateTime, formatLocalTime } from '@/utils/date'
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppointmentsStore } from '@/stores/appointments'
import { useMastersStore } from '@/stores/masters'
import { useServicesStore } from '@/stores/services'
import { useMaterialsStore } from '@/stores/materials'
import { useAuthStore } from '@/stores/auth'
import AppButton from '@/components/ui/AppButton.vue'
import Modal from '@/components/ui/Modal.vue'

const route = useRoute()
const router = useRouter()
const appointmentsStore = useAppointmentsStore()
const mastersStore = useMastersStore()
const servicesStore = useServicesStore()
const materialsStore = useMaterialsStore()
const authStore = useAuthStore()

const canManageMaterials = computed(() => authStore.canManageMaterials)

const loading = ref(false)
const isEditing = ref(false)
const showAddServiceModal = ref(false)

const newService = reactive({
  serviceId: '',
  materialId: '',
  discount: 0,
})

const appointment = computed(() => appointmentsStore.currentAppointment)

const clientName = computed(() => appointment.value?.client?.user?.full_name || 'Не указан')
const clientPhone = computed(() => appointment.value?.client?.user?.phone || 'Не указан')
const masterName = computed(() => appointment.value?.master?.user?.full_name || 'Не указан')

const masterSpecializations = computed(() => {
  const master = appointment.value?.master
  if (!master) return []
  const services = master.masterServices || []
  return services.map(ms => ms.service?.name).filter(Boolean)
})

const masterDisplayName = (master) => {
  return master.user?.full_name || master.full_name || `Мастер #${master.id}`
}

const form = reactive({
  masterId: null,
  serviceId: null,
  date: '',
  startTime: null,
  comment: '',
})

const slots = ref([])
const minDate = computed(() => new Date().toISOString().split('T')[0])

const canConfirm = computed(() => ['created', 'await_confirm'].includes(appointment.value?.status))
const canComplete = computed(() => appointment.value?.status === 'confirmed')
const canCancel = computed(() => !['cancelled', 'completed'].includes(appointment.value?.status))

const categoryServices = computed(() => {
  return servicesStore.list.filter(s => s.parent_id === null && s.is_active !== false)
})

const appointmentServices = computed(() => {
  return appointment.value?.appointmentServices || []
})

const availableChildServices = computed(() => {
  const mainService = appointment.value?.service
  if (!mainService) return []
  const parentId = mainService.parent_id || mainService.id
  return servicesStore.list.filter(s => s.parent_id === parentId && s.is_active !== false)
})

const availableMaterialsForService = computed(() => {
  if (newService.serviceId) {
    return materialsStore.list.filter(m =>
      m.serviceMaterials?.some(sm => sm.service_id === newService.serviceId)
    )
  }
  return []
})

const loadAppointment = async () => {
  const id = Number(route.params.id)
  if (!id) return
  loading.value = true
  try {
    await appointmentsStore.fetchById(id)
    if (appointment.value) {
      form.masterId = appointment.value.master_id
      form.serviceId = appointment.value.service_id
      form.date = appointment.value.start_time ? appointment.value.start_time.split('T')[0] : ''
      form.startTime = appointment.value.start_time || null
      form.comment = appointment.value.comment || ''
    }
  } catch (error) {
    console.error('Ошибка загрузки записи:', error)
  } finally {
    loading.value = false
  }
}

const loadDictionaries = async () => {
  if (!mastersStore.list.length) await mastersStore.fetchList()
  if (!servicesStore.list.length) await servicesStore.fetchList()
  if (!materialsStore.list.length) await materialsStore.fetchList()
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser()
  }
}

const enableEditing = () => {
  isEditing.value = true
  fetchSlots()
}

const cancelEditing = () => {
  isEditing.value = false
  if (appointment.value) {
    form.masterId = appointment.value.master_id
    form.serviceId = appointment.value.service_id
    form.date = appointment.value.start_time ? appointment.value.start_time.split('T')[0] : ''
    form.startTime = appointment.value.start_time || null
    form.comment = appointment.value.comment || ''
  }
}

const save = async () => {
  if (!form.masterId || !form.serviceId || !form.date || !form.startTime) {
    showToast.warning('Заполните все обязательные поля (мастер, основная услуга, дата и время)')
    return
  }
  try {
    await appointmentsStore.update(appointment.value.id, {
      masterId: form.masterId,
      serviceId: form.serviceId,
      startTime: form.startTime,
      comment: form.comment,
    })
    await loadAppointment()
    isEditing.value = false
    showToast.success('Запись обновлена')
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    showToast.warning('Не удалось сохранить изменения')
  }
}

const changeStatus = async (status) => {
  if (!confirm(`Изменить статус на "${statusLabel(status)}"?`)) return
  try {
    await appointmentsStore.updateStatus(appointment.value.id, status)
    await loadAppointment()
  } catch (error) {
    console.error('Ошибка изменения статуса:', error)
    showToast.warning('Не удалось изменить статус')
  }
}

const fetchSlots = async () => {
  if (!form.masterId || !form.serviceId || !form.date) {
    slots.value = []
    return
  }
  try {
    const data = await appointmentsStore.getSlots(form.masterId, form.date, form.serviceId)
    slots.value = data || []
  } catch (error) {
    console.error('Ошибка загрузки слотов:', error)
    slots.value = []
  }
}

const selectSlot = (start) => {
  form.startTime = start
}

const getMaterialPrice = (materialId) => {
  const price = materialsStore.getActivePrice(materialId)
  return price?.price ?? 0
}

const getMaterialName = (materialId) => {
  const mat = materialsStore.list.find(m => m.id === materialId)
  return mat ? (mat.short_name || mat.name) : `Материал #${materialId}`
}

const openAddServiceModal = () => {
  newService.serviceId = ''
  newService.materialId = ''
  newService.discount = 0
  showAddServiceModal.value = true
}

const closeAddServiceModal = () => {
  showAddServiceModal.value = false
}

const addService = async () => {
  if (!newService.serviceId) {
    showToast.warning('Выберите услугу')
    return
  }
  try {
    const servicePrice = servicesStore.getActivePrice?.(newService.serviceId) || null
    const materialPrice = newService.materialId ? getMaterialPrice(newService.materialId) : null

    await appointmentsStore.addService({
      appointmentId: appointment.value.id,
      serviceId: newService.serviceId,
      materialId: newService.materialId || null,
      servicePrice: servicePrice?.price || null,
      materialPrice: materialPrice,
      discount: newService.discount || 0,
    })
    await loadAppointment()
    closeAddServiceModal()
    showToast.success('Дополнительная услуга добавлена')
  } catch (error) {
    console.error('Ошибка добавления услуги:', error)
    showToast.warning('Не удалось добавить услугу')
  }
}

const removeService = async (id) => {
  if (!confirm('Удалить эту дополнительную услугу?')) return
  try {
    await appointmentsStore.removeService(id)
    await loadAppointment()
    showToast.success('Услуга удалена')
  } catch (error) {
    console.error('Ошибка удаления услуги:', error)
    showToast.warning('Не удалось удалить услугу')
  }
}

const statusClass = (status) => ({
  created: 'bg-gray-200 text-gray-700',
  await_confirm: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}[status] || 'bg-gray-100 text-gray-600')

const statusLabel = (status) => ({
  created: 'Создана',
  await_confirm: 'Ожидает',
  confirmed: 'Подтверждена',
  completed: 'Выполнена',
  cancelled: 'Отменена',
}[status] || status)

watch(
  () => [form.masterId, form.serviceId, form.date],
  () => {
    if (isEditing.value) {
      form.startTime = null
      fetchSlots()
    }
  }
)

onMounted(async () => {
  await loadDictionaries()
  await loadAppointment()
})
</script>