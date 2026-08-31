<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Мастера</h1>
      <router-link to="/masters/new">
        <AppButton variant="primary">+ Добавить мастера</AppButton>
      </router-link>
    </div>

    <!-- Фильтры -->
    <div class="bg-white p-4 rounded-lg shadow space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Поиск по имени</label>
          <input
            type="text"
            v-model="filters.search"
            @input="applyFilters"
            class="w-full border rounded px-3 py-2"
            placeholder="Имя мастера..."
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Услуга (категория)</label>
          <select v-model="filters.serviceId" @change="applyFilters" class="w-full border rounded px-3 py-2">
            <option value="">Все категории</option>
            <option v-for="s in categoryServices" :key="s.id" :value="s.id">
              {{ s.short_name || s.name }}
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

    <!-- Таблица -->
    <div class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Телефон</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Услуги</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Рейтинг</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading">
            <td colspan="7" class="px-6 py-4 text-center">Загрузка...</td>
          </tr>
          <tr v-else-if="filteredMasters.length === 0">
            <td colspan="7" class="px-6 py-4 text-center text-gray-500">Мастеров не найдено</td>
          </tr>
          <tr
            v-for="master in filteredMasters"
            :key="master.id"
            class="hover:bg-gray-50 cursor-pointer"
            @click="goToEdit(master.id)"
          >
            <td class="px-6 py-4 whitespace-nowrap">{{ master.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ master.user?.full_name || 'Не указано' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ master.user?.phone || '—' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span v-for="(ms, idx) in master.masterServices" :key="idx" class="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-1">
                {{ ms.service?.short_name || ms.service?.name }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">{{ master.rating || '—' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="master.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    class="px-2 py-1 rounded-full text-xs">
                {{ master.is_active !== false ? 'Активен' : 'Неактивен' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap space-x-2" @click.stop>
              <router-link :to="`/masters/${master.id}/edit`" class="text-blue-600 hover:underline">Редактировать</router-link>
              <button @click="deleteMaster(master.id)" class="text-red-600 hover:underline">Удалить</button>
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
import { useMastersStore } from '@/stores/masters'
import { useServicesStore } from '@/stores/services'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const mastersStore = useMastersStore()
const servicesStore = useServicesStore()
const loading = ref(false)

const filters = reactive({
  search: '',
  serviceId: '',
  isActive: '',
})

// Только категории (услуги 1-го уровня)
const categoryServices = computed(() => {
  return servicesStore.list.filter(s => s.parent_id === null)
})

const filteredMasters = computed(() => {
  let list = mastersStore.list

  if (filters.search) {
    const s = filters.search.toLowerCase()
    list = list.filter(m =>
      m.user?.full_name?.toLowerCase().includes(s) ||
      m.user?.phone?.includes(s)
    )
  }
  if (filters.serviceId) {
    const serviceIdStr = String(filters.serviceId)
    list = list.filter(m => {
      const services = m.masterServices || []
      return services.some(ms => String(ms.service_id) === serviceIdStr)
    })
  }
  if (filters.isActive !== '') {
    list = list.filter(m => (m.is_active !== false) === filters.isActive)
  }
  return list
})

const applyFilters = () => {}
const resetFilters = () => {
  filters.search = ''
  filters.serviceId = ''
  filters.isActive = ''
}

const goToEdit = (id) => {
  router.push(`/masters/${id}/edit`)
}

const deleteMaster = async (id) => {
  if (!confirm('Удалить этого мастера?')) return
  try {
    await mastersStore.remove(id)
    showToast.success('Мастер удалён')
  } catch (error) {
    console.error('Ошибка удаления:', error)
    showToast.error('Не удалось удалить мастера')
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([
    mastersStore.fetchList(),
    servicesStore.fetchList(),
  ])
  loading.value = false
})
</script>