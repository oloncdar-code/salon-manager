<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
      <router-link to="/services" class="text-blue-600 hover:underline">← Назад</router-link>
      <h1 class="text-2xl font-bold">
        {{ isEditMode ? 'Редактирование услуги' : 'Создание услуги' }}
      </h1>
    </div>

    <div v-if="loading" class="text-center py-8">Загрузка...</div>

    <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow p-6 space-y-6">
      <!-- Основные поля -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Полное название *</label>
          <input
            type="text"
            v-model="form.name"
            required
            class="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Краткое название *</label>
          <input
            type="text"
            v-model="form.shortName"
            required
            class="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Длительность (мин) *</label>
          <input
            type="number"
            v-model.number="form.duration"
            required
            min="1"
            class="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Родительская услуга (категория)</label>
          
          <!-- Поле поиска по категориям -->
          <div class="relative">
            <input
              type="text"
              v-model="parentSearch"
              placeholder="Поиск категории..."
              class="w-full border rounded px-3 py-2 mb-1"
            />
            <select
              v-model="form.parentId"
              class="w-full border rounded px-3 py-2"
              size="5"
              style="height: auto; min-height: 100px;"
            >
              <option :value="null">— Без категории (корневая) —</option>
              <option
                v-for="cat in filteredCategories"
                :key="cat.id"
                :value="cat.id"
                :disabled="isEditMode && cat.id === serviceId"
                class="py-1"
              >
                <span v-if="cat.parent_id" class="ml-4">↳</span>
                {{ cat.short_name || cat.name }}
                <span v-if="!cat.is_active" class="text-gray-400 text-xs">(неактивна)</span>
              </option>
            </select>
          </div>
          <p class="text-xs text-gray-500 mt-1">Если это категория, оставьте поле пустым</p>
        </div>
      </div>

      <div>
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="form.isActive" />
          <span class="text-sm font-medium">Активна</span>
        </label>
      </div>

      <!-- Управление ценой -->
      <div class="border-t pt-4">
        <h3 class="text-lg font-medium mb-3">Цена</h3>

        <!-- Текущая активная цена -->
        <div v-if="currentPrice" class="flex items-center gap-4 bg-gray-50 p-3 rounded">
          <span class="text-sm font-medium">Текущая активная цена:</span>
          <span class="text-lg font-bold">{{ currentPrice.price }} ₽</span>
          <span class="text-xs text-gray-500">(с {{ formatDate(currentPrice.created_at) }})</span>
        </div>

        <!-- Добавление новой цены -->
        <div class="flex items-end gap-4 mt-3">
          <div class="flex-1">
            <label class="block text-sm font-medium mb-1">Новая цена (₽)</label>
            <input
              type="number"
              v-model.number="newPrice"
              min="0"
              step="0.01"
              class="w-full border rounded px-3 py-2"
              placeholder="Введите цену"
            />
          </div>
          <AppButton
            type="button"
            variant="primary"
            @click="addPrice"
            :disabled="!newPrice || !serviceId"
          >
            Установить цену
          </AppButton>
        </div>

        <!-- История цен -->
        <div v-if="priceHistory.length > 0" class="mt-4">
          <h4 class="text-sm font-medium mb-2">История цен</h4>
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th class="px-3 py-2 text-left">Цена</th>
                <th class="px-3 py-2 text-left">Активна</th>
                <th class="px-3 py-2 text-left">Дата создания</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="price in priceHistory" :key="price.id" class="hover:bg-gray-50">
                <td class="px-3 py-2">{{ price.price }} ₽</td>
                <td class="px-3 py-2">
                  <span :class="price.is_active ? 'text-green-600' : 'text-gray-400'">
                    {{ price.is_active ? 'Да' : 'Нет' }}
                  </span>
                </td>
                <td class="px-3 py-2">{{ formatDate(price.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- Материалы для услуги -->
      <div class="border-t pt-4">
        <h3 class="text-lg font-medium mb-3">Материалы для услуги</h3>

        <div class="flex items-end gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium mb-1">Добавить материал</label>
            <select v-model="newMaterialId" class="w-full border rounded px-3 py-2">
              <option value="">Выберите материал</option>
              <option
                v-for="m in availableMaterials"
                :key="m.id"
                :value="m.id"
              >
                {{ m.short_name || m.name }}
              </option>
            </select>
          </div>
          <AppButton
            type="button"
            variant="primary"
            @click="addMaterial"
            :disabled="!newMaterialId || !serviceId"
          >
            Привязать
          </AppButton>
        </div>

        <div v-if="serviceMaterials.length > 0" class="mt-4">
          <h4 class="text-sm font-medium mb-2">Привязанные материалы</h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="sm in serviceMaterials"
              :key="sm.id"
              class="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
            >
              {{ sm.material?.short_name || sm.material?.name }}
              <button
                type="button"
                class="text-red-500 hover:text-red-700"
                @click="removeMaterial(sm.id)"
              >
                ✕
              </button>
            </span>
          </div>
          <p v-if="serviceMaterials.length === 0" class="text-sm text-gray-400">Материалы не привязаны</p>
        </div>
      </div>
      <!-- Кнопки -->
      <div class="flex gap-4 border-t pt-4">
        <AppButton type="submit" variant="primary">
          {{ isEditMode ? 'Сохранить изменения' : 'Создать услугу' }}
        </AppButton>
        <AppButton type="button" variant="secondary" @click="$router.push('/services')">
          Отмена
        </AppButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useServicesStore } from '@/stores/services'
import AppButton from '@/components/ui/AppButton.vue'
import { useMaterialsStore } from '@/stores/materials'

const route = useRoute()
const router = useRouter()
const store = useServicesStore()

const loading = ref(false)
const isEditMode = computed(() => !!route.params.id)
const serviceId = computed(() => Number(route.params.id) || null)

const form = reactive({
  name: '',
  shortName: '',
  duration: 30,
  parentId: null,
  isActive: true,
})

const newPrice = ref(null)
const priceHistory = ref([])
const currentPrice = ref(null)
const parentSearch = ref('')

// Категории (услуги 1-го уровня) с учётом поиска
const categories = computed(() => {
  return store.list.filter(s => s.parent_id === null && s.is_active !== false)
})

const filteredCategories = computed(() => {
  if (!parentSearch.value) return categories.value
  const search = parentSearch.value.toLowerCase()
  return categories.value.filter(cat => 
    cat.name.toLowerCase().includes(search) || 
    (cat.short_name && cat.short_name.toLowerCase().includes(search))
  )
})

// Загрузка данных для редактирования
const loadService = async () => {
  if (!isEditMode.value) return
  loading.value = true
  try {
    const service = await store.fetchById(serviceId.value)
    form.name = service.name
    form.shortName = service.short_name
    form.duration = service.duration
    form.parentId = service.parent_id
    form.isActive = service.is_active
    priceHistory.value = service.prices || []
    currentPrice.value = priceHistory.value.find(p => p.is_active) || null
    serviceMaterials.value = service.serviceMaterials || []
  } catch (error) {
    console.error('Ошибка загрузки услуги:', error)
    showToast.error('Не удалось загрузить услугу')
    router.push('/services')
  } finally {
    loading.value = false
  }
}

const addPrice = async () => {
  if (!newPrice.value || newPrice.value <= 0) {
    showToast.error('Введите корректную цену')
    return
  }
  if (!serviceId.value) {
    showToast.error('Сначала сохраните услугу, чтобы добавить цену')
    return
  }
  try {
    await store.setPrice(serviceId.value, newPrice.value)
    await loadService()
    newPrice.value = null
    showToast.success('Цена установлена')
  } catch (error) {
    console.error('Ошибка установки цены:', error)
    showToast.error('Не удалось установить цену')
  }
}

const handleSubmit = async () => {
  if (!form.name || !form.shortName || !form.duration) {
    showToast.error('Заполните все обязательные поля')
    return
  }

  const payload = {
    name: form.name,
    shortName: form.shortName,
    duration: form.duration,
    parentId: form.parentId || null,
    isActive: form.isActive,
  }

  try {
    if (isEditMode.value) {
      await store.update(serviceId.value, payload)
    } else {
      const created = await store.create(payload)
      // Если при создании указана цена, устанавливаем её
      if (newPrice.value && created.id) {
        await store.setPrice(created.id, newPrice.value)
      }
    }
    router.push('/services')
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    showToast.error('Не удалось сохранить услугу')
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const materialsStore = useMaterialsStore()
const newMaterialId = ref('')
const serviceMaterials = ref([])

// Доступные материалы (активные и ещё не привязанные к данной услуге)
const availableMaterials = computed(() => {
  const existingIds = serviceMaterials.value.map(sm => sm.material_id)
  return materialsStore.list.filter(m => m.is_active !== false && !existingIds.includes(m.id))
})

// Привязка материала
const addMaterial = async () => {
  if (!newMaterialId.value) return
  if (!serviceId.value) {
    showToast.error('Сначала сохраните услугу')
    return
  }
  try {
    await materialsStore.addToService(newMaterialId.value, serviceId.value)
    await loadService()
    newMaterialId.value = ''
    showToast.success('Материал привязан')
  } catch (error) {
    console.error('Ошибка привязки материала:', error)
    showToast.error('Не удалось привязать материал')
  }
}

// Отвязка материала
const removeMaterial = async (serviceMaterialId) => {
  if (!confirm('Отвязать этот материал от услуги?')) return
  try {
    await materialsStore.removeFromService(serviceMaterialId)
    await loadService() // перезагружаем услугу, чтобы обновить список
    showToast.success('Материал отвязан')
  } catch (error) {
    console.error('Ошибка отвязки материала:', error)
    showToast.error('Не удалось отвязать материал')
  }
}

// При монтировании загружаем список услуг для выбора категорий
onMounted(async () => {
  loading.value = true
  try {
    await servicesStore.fetchList()
    await materialsStore.fetchList()
    if (isEditMode.value) {
      await loadService()
    }
  } finally {
    loading.value = false
  }
})
</script>