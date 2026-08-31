<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Услуги</h1>
      <router-link to="/services/new">
        <AppButton variant="primary">+ Создать услугу</AppButton>
      </router-link>
    </div>

    <!-- Фильтры -->
    <div class="bg-white p-4 rounded-lg shadow space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Поиск по названию</label>
          <input
            type="text"
            v-model="filters.search"
            @input="applyFilters"
            class="w-full border rounded px-3 py-2"
            placeholder="Название услуги..."
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Категория</label>
          <select v-model="filters.parentId" @change="applyFilters" class="w-full border rounded px-3 py-2">
            <option value="">Все категории</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.short_name || cat.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Статус</label>
          <select v-model="filters.isActive" @change="applyFilters" class="w-full border rounded px-3 py-2">
            <option value="">Все</option>
            <option :value="true">Активные</option>
            <option :value="false">Неактивные</option>
          </select>
        </div>
      </div>
      <div class="flex justify-end">
        <AppButton variant="secondary" @click="resetFilters">Сбросить</AppButton>
      </div>
    </div>

    <!-- Таблица услуг -->
    <div class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Длительность (мин)</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена (₽)</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Категория</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading">
            <td colspan="7" class="px-6 py-4 text-center">Загрузка...</td>
          </tr>
          <tr v-else-if="filteredServices.length === 0">
            <td colspan="7" class="px-6 py-4 text-center text-gray-500">Услуг не найдено</td>
          </tr>
          <tr
            v-for="service in filteredServices"
            :key="service.id"
            class="hover:bg-gray-50 cursor-pointer"
            @click="goToEdit(service.id)"
          >
            <td class="px-6 py-4 whitespace-nowrap">{{ service.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <span v-if="service.parent_id" class="text-gray-400 text-xs">↳</span>
                <span>{{ service.short_name || service.name }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">{{ service.duration }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ getActivePrice(service.id)?.price || '—' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ getCategoryName(service.parent_id) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    class="px-2 py-1 rounded-full text-xs">
                {{ service.is_active ? 'Активна' : 'Неактивна' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap space-x-2" @click.stop>
              <router-link :to="`/services/${service.id}/edit`" class="text-blue-600 hover:underline">Редактировать</router-link>
              <button @click="deleteService(service.id)" class="text-red-600 hover:underline">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useServicesStore } from '@/stores/services'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const store = useServicesStore()
const loading = ref(false)

const filters = reactive({
  search: '',
  parentId: '',
  isActive: '',
})

const categories = computed(() => store.categories)

const filteredServices = computed(() => {
  let list = store.list

  if (filters.search) {
    const s = filters.search.toLowerCase()
    list = list.filter(item => 
      (item.name?.toLowerCase().includes(s) || item.short_name?.toLowerCase().includes(s))
    )
  }
  if (filters.parentId) {
    const parentIdStr = String(filters.parentId)
    list = list.filter(item => String(item.parent_id) === parentIdStr)
  }
  if (filters.isActive !== '') {
    list = list.filter(item => item.is_active === filters.isActive)
  }

  // Сортировка по иерархии: сначала категории (parent_id === null), затем дочерние
  // Каждая дочерняя услуга следует за своей категорией
  const sorted = []
  const categories = list.filter(item => item.parent_id === null)
  const children = list.filter(item => item.parent_id !== null)

  // Сортируем категории по имени
  categories.sort((a, b) => (a.name || '').localeCompare(b.name || ''))

  // Для каждой категории добавляем её в sorted, затем её дочерние услуги (отсортированные по имени)
  categories.forEach(cat => {
    sorted.push(cat)
    const catChildren = children
      .filter(child => child.parent_id === cat.id)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    sorted.push(...catChildren)
  })

  // Если есть дочерние услуги без родителя (parent_id не null, но категория отсутствует)
  const orphanChildren = children.filter(child => !categories.some(cat => cat.id === child.parent_id))
  sorted.push(...orphanChildren)

  return sorted
})

const getActivePrice = (serviceId) => {
  return store.getActivePrice(serviceId)
}

const getCategoryName = (parentId) => {
  if (!parentId) return '—'
  const cat = store.list.find(s => s.id === parentId)
  return cat ? (cat.short_name || cat.name) : '—'
}

const applyFilters = () => {
}

const resetFilters = () => {
  filters.search = ''
  filters.parentId = ''
  filters.isActive = ''
}

const goToEdit = (id) => {
  router.push(`/services/${id}/edit`)
}

const deleteService = async (id) => {
  if (!confirm('Удалить эту услугу? (будет деактивирована)')) return
  try {
    await store.remove(id)
    showToast.success('Услуга удалена')
  } catch (error) {
    console.error('Ошибка удаления:', error)
    showToast.error('Не удалось удалить услугу')
  }
}

onMounted(async () => {
  loading.value = true
  await store.fetchList()
  loading.value = false
})
</script>