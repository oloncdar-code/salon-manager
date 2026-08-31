<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
      <router-link to="/masters" class="text-blue-600 hover:underline">← Назад</router-link>
      <h1 class="text-2xl font-bold">
        {{ isEditMode ? 'Редактирование мастера' : 'Создание мастера' }}
      </h1>
    </div>

    <div v-if="loading" class="text-center py-8">Загрузка...</div>

    <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow p-6 space-y-6">
      <!-- Основные поля -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Пользователь *</label>
          <select v-model="form.userId" required class="w-full border rounded px-3 py-2">
            <option value="">Выберите пользователя</option>
            <option v-for="u in usersStore.list" :key="u.id" :value="u.id">
              {{ u.full_name }} ({{ u.phone }})
            </option>
          </select>
          <p class="text-xs text-gray-500 mt-1">Пользователь должен иметь роль 'master'</p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Рейтинг</label>
          <input
            type="number"
            v-model.number="form.rating"
            min="0"
            max="5"
            step="0.1"
            class="w-full border rounded px-3 py-2"
            placeholder="0–5"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Bio (о себе)</label>
        <textarea v-model="form.bio" rows="3" class="w-full border rounded px-3 py-2" placeholder="Краткая информация о мастере..." />
      </div>

      <!-- Управление услугами мастера -->
      <div class="border-t pt-4">
        <h3 class="text-lg font-medium mb-3">Услуги мастера</h3>

        <!-- Добавление услуги -->
        <div class="flex items-end gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium mb-1">Добавить категорию</label>
            <select v-model="newServiceId" class="w-full border rounded px-3 py-2">
              <option value="">Выберите категорию</option>
              <option
                v-for="s in availableServices"
                :key="s.id"
                :value="s.id"
              >
                {{ s.short_name || s.name }}
              </option>
            </select>
          </div>
          <AppButton
            type="button"
            variant="primary"
            @click="addService"
            :disabled="!newServiceId || !masterId"
          >
            Добавить
          </AppButton>
        </div>

        <!-- Список услуг мастера -->
        <div v-if="masterServices.length > 0" class="mt-4">
          <h4 class="text-sm font-medium mb-2">Добавленные категории</h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="ms in masterServices"
              :key="ms.id"
              class="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
            >
              {{ ms.service?.short_name || ms.service?.name }}
              <button
                type="button"
                class="text-red-500 hover:text-red-700"
                @click="removeService(ms.id)"
              >
                ✕
              </button>
            </span>
          </div>
          <p v-if="masterServices.length === 0" class="text-sm text-gray-400">У мастера пока нет категорий</p>
        </div>
      </div>

      <!-- Активность -->
      <div>
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="form.isActive" />
          <span class="text-sm font-medium">Активен</span>
        </label>
      </div>

      <!-- Кнопки -->
      <div class="flex gap-4 border-t pt-4">
        <AppButton type="submit" variant="primary">
          {{ isEditMode ? 'Сохранить изменения' : 'Создать мастера' }}
        </AppButton>
        <AppButton type="button" variant="secondary" @click="$router.push('/masters')">
          Отмена
        </AppButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMastersStore } from '@/stores/masters'
import { useServicesStore } from '@/stores/services'
import { useUsersStore } from '@/stores/users'
import AppButton from '@/components/ui/AppButton.vue'

const route = useRoute()
const router = useRouter()
const mastersStore = useMastersStore()
const servicesStore = useServicesStore()
const usersStore = useUsersStore()

const loading = ref(false)
const isEditMode = computed(() => !!route.params.id)
const masterId = computed(() => Number(route.params.id) || null)

const form = reactive({
  userId: '',
  bio: '',
  rating: null,
  isActive: true,
})

const newServiceId = ref('')
const masterServices = ref([])

// Только категории (услуги 1-го уровня), которые ещё не добавлены мастеру
const availableServices = computed(() => {
  const existingIds = masterServices.value.map(ms => ms.service_id)
  return servicesStore.list
    .filter(s => s.parent_id === null && !existingIds.includes(s.id))
    .sort((a, b) => (a.short_name || a.name).localeCompare(b.short_name || b.name))
})

// Загрузка данных мастера для редактирования
const loadMaster = async () => {
  if (!isEditMode.value) return
  loading.value = true
  try {
    const master = await mastersStore.fetchById(masterId.value)
    form.userId = master.user_id
    form.bio = master.bio || ''
    form.rating = master.rating || null
    form.isActive = master.is_active !== false
    masterServices.value = master.masterServices || []
  } catch (error) {
    console.error('Ошибка загрузки мастера:', error)
    showToast.error('Не удалось загрузить мастера')
    router.push('/masters')
  } finally {
    loading.value = false
  }
}

// Добавление услуги мастеру
const addService = async () => {
  if (!newServiceId.value) return
  if (!masterId.value && !isEditMode.value) {
    showToast.error('Сначала сохраните мастера, чтобы добавить услуги')
    return
  }
  try {
    await mastersStore.addService(masterId.value, Number(newServiceId.value))
    await loadMaster()
    newServiceId.value = ''
    showToast.success('Категория добавлена')
  } catch (error) {
    console.error('Ошибка добавления категории:', error)
    showToast.error('Не удалось добавить категорию')
  }
}

// Удаление услуги у мастера
const removeService = async (masterServiceId) => {
  if (!confirm('Убрать эту категорию у мастера?')) return
  try {
    await mastersStore.removeService(masterServiceId) // только ID связи
    await loadMaster()
    showToast.success('Категория удалена')
  } catch (error) {
    console.error('Ошибка удаления категории:', error)
    showToast.error('Не удалось удалить категорию')
  }
}

// Сохранение мастера
const handleSubmit = async () => {
  if (!form.userId) {
    showToast.error('Выберите пользователя')
    return
  }

  const payload = {
    userId: form.userId,
    bio: form.bio || '',
    rating: form.rating || 0,
    is_active: form.isActive,
  }

  try {
    if (isEditMode.value) {
      await mastersStore.update(masterId.value, payload)
    } else {
      const created = await mastersStore.create(payload)
      // Если есть выбранная услуга, добавляем её
      if (newServiceId.value && created.id) {
        await mastersStore.addService(created.id, Number(newServiceId.value))
      }
    }
    router.push('/masters')
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    showToast.error('Не удалось сохранить мастера')
  }
}

// Загрузка данных при монтировании
onMounted(async () => {
  await Promise.all([
    usersStore.fetchList({ role: 'master' }),
    servicesStore.fetchList(),
  ])
  if (isEditMode.value) {
    await loadMaster()
  }
})
</script>