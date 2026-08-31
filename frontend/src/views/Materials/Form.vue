<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
      <router-link to="/materials" class="text-blue-600 hover:underline">← Назад</router-link>
      <h1 class="text-2xl font-bold">
        {{ isEditMode ? 'Редактирование материала' : 'Создание материала' }}
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

      <div>
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="form.isActive" />
          <span class="text-sm font-medium">Активен</span>
        </label>
      </div>

      <!-- Управление ценой -->
      <div class="border-t pt-4">
        <h3 class="text-lg font-medium mb-3">Цена</h3>

        <div v-if="currentPrice" class="flex items-center gap-4 bg-gray-50 p-3 rounded">
          <span class="text-sm font-medium">Текущая активная цена:</span>
          <span class="text-lg font-bold">{{ currentPrice.price }} ₽</span>
          <span class="text-xs text-gray-500">(с {{ formatDate(currentPrice.created_at) }})</span>
        </div>

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
            :disabled="!newPrice || !materialId"
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

      <!-- Управление привязкой к услугам -->
      <div class="border-t pt-4">
        <h3 class="text-lg font-medium mb-3">Привязка к услугам</h3>

        <div class="flex items-end gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium mb-1">Добавить услугу</label>
            <select v-model="newServiceId" class="w-full border rounded px-3 py-2">
              <option value="">Выберите услугу</option>
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
            :disabled="!newServiceId || !materialId"
          >
            Привязать
          </AppButton>
        </div>

        <div v-if="serviceMaterials.length > 0" class="mt-4">
          <h4 class="text-sm font-medium mb-2">Привязанные услуги</h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="sm in serviceMaterials"
              :key="sm.id"
              class="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
            >
              {{ sm.service?.short_name || sm.service?.name }}
              <button
                type="button"
                class="text-red-500 hover:text-red-700"
                @click="removeService(sm.id)"
              >
                ✕
              </button>
            </span>
          </div>
          <p v-if="serviceMaterials.length === 0" class="text-sm text-gray-400">Материал не привязан ни к одной услуге</p>
        </div>
      </div>

      <!-- Кнопки -->
      <div class="flex gap-4 border-t pt-4">
        <AppButton type="submit" variant="primary">
          {{ isEditMode ? 'Сохранить изменения' : 'Создать материал' }}
        </AppButton>
        <AppButton type="button" variant="secondary" @click="$router.push('/materials')">
          Отмена
        </AppButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMaterialsStore } from '@/stores/materials'
import { useServicesStore } from '@/stores/services'
import AppButton from '@/components/ui/AppButton.vue'

const route = useRoute()
const router = useRouter()
const materialsStore = useMaterialsStore()
const servicesStore = useServicesStore()

const loading = ref(false)
const isEditMode = computed(() => !!route.params.id)
const materialId = computed(() => Number(route.params.id) || null)

const form = reactive({
  name: '',
  shortName: '',
  isActive: true,
})

const newPrice = ref(null)
const priceHistory = ref([])
const currentPrice = ref(null)

const newServiceId = ref('')
const serviceMaterials = ref([])

// Услуги, к которым материал ещё не привязан
const availableServices = computed(() => {
  const existingIds = serviceMaterials.value.map(sm => sm.service_id)
  return servicesStore.list.filter(s => !existingIds.includes(s.id))
})

// Загрузка данных материала для редактирования
const loadMaterial = async () => {
  if (!isEditMode.value) return
  loading.value = true
  try {
    const material = await materialsStore.fetchById(materialId.value)
    form.name = material.name
    form.shortName = material.short_name
    form.isActive = material.is_active
    priceHistory.value = material.prices || []
    currentPrice.value = priceHistory.value.find(p => p.is_active) || null
    serviceMaterials.value = material.serviceMaterials || []
  } catch (error) {
    console.error('Ошибка загрузки материала:', error)
    console.error('Не удалось загрузить материал')
    router.push('/materials')
  } finally {
    loading.value = false
  }
}

// Добавление цены
const addPrice = async () => {
  if (!newPrice.value || newPrice.value <= 0) {
    console.error('Введите корректную цену')
    return
  }
  if (!materialId.value) {
    console.error('Сначала сохраните материал, чтобы добавить цену')
    return
  }
  try {
    await materialsStore.setPrice(materialId.value, newPrice.value)
    await loadMaterial()
    newPrice.value = null
    showToast.success('Цена установлена')
  } catch (error) {
    console.error('Ошибка установки цены:', error)
    showToast.error('Не удалось установить цену')
  }
}

// Привязка к услуге
const addService = async () => {
  if (!newServiceId.value) return
  if (!materialId.value) {
    showToast.error('Сначала сохраните материал, чтобы привязать услугу')
    return
  }
  try {
    await materialsStore.addToService(materialId.value, Number(newServiceId.value))
    await loadMaterial()
    newServiceId.value = ''
    showToast.success('Услуга привязана')
  } catch (error) {
    console.error('Ошибка привязки услуги:', error)
    showToast.error('Не удалось привязать услугу')
  }
}

// Отвязка от услуги
const removeService = async (serviceMaterialId) => {
  if (!confirm('Отвязать эту услугу от материала?')) return
  try {
    await materialsStore.removeFromService(materialId.value, serviceMaterialId)
    await loadMaterial()
    showToast.success('Услуга отвязана')
  } catch (error) {
    console.error('Ошибка отвязки услуги:', error)
    showToast.error('Не удалось отвязать услугу')
  }
}

// Сохранение материала
const handleSubmit = async () => {
  if (!form.name || !form.shortName) {
    showToast.error('Заполните все обязательные поля')
    return
  }

  const payload = {
    name: form.name,
    shortName: form.shortName,
    isActive: form.isActive,
  }

  try {
    if (isEditMode.value) {
      await materialsStore.update(materialId.value, payload)
    } else {
      const created = await materialsStore.create(payload)
      // Если есть выбранная услуга, привязываем
      if (newServiceId.value && created.id) {
        await materialsStore.addToService(created.id, Number(newServiceId.value))
      }
    }
    router.push('/materials')
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    showToast.error('Не удалось сохранить материал')
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(async () => {
  await servicesStore.fetchList()
  if (isEditMode.value) {
    await loadMaterial()
  }
})
</script>