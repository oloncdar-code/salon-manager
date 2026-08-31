<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Материалы</h1>
      <router-link to="/materials/new">
        <AppButton variant="primary">+ Создать материал</AppButton>
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
            placeholder="Название материала..."
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Статус</label>
          <select v-model="filters.isActive" @change="applyFilters" class="w-full border rounded px-3 py-2">
            <option value="">Все</option>
            <option :value="true">Активные</option>
            <option :value="false">Неактивные</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Привязан к услуге</label>
          <select v-model="filters.serviceId" @change="applyFilters" class="w-full border rounded px-3 py-2">
            <option value="">Все</option>
            <option v-for="s in servicesStore.list" :key="s.id" :value="s.id">
              {{ s.short_name || s.name }}
            </option>
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
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена (₽)</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Привязан к услугам</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="materialsStore.loading">
            <td colspan="6" class="px-6 py-4 text-center">Загрузка...</td>
          </tr>
          <tr v-else-if="filteredMaterials.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">Материалов не найдено</td>
          </tr>
          <tr
            v-for="material in filteredMaterials"
            :key="material.id"
            class="hover:bg-gray-50 cursor-pointer"
            @click="goToEdit(material.id)"
          >
            <td class="px-6 py-4 whitespace-nowrap">{{ material.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ material.short_name || material.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ getActivePrice(material.id)?.price || '—' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span v-for="(sm, idx) in material.serviceMaterials" :key="idx" class="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-1">
                {{ sm.service?.short_name || sm.service?.name }}
              </span>
              <span v-if="!material.serviceMaterials?.length" class="text-gray-400">—</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="material.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    class="px-2 py-1 rounded-full text-xs">
                {{ material.is_active ? 'Активен' : 'Неактивен' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap space-x-2" @click.stop>
              <router-link :to="`/materials/${material.id}/edit`" class="text-blue-600 hover:underline">Редактировать</router-link>
              <button @click="deleteMaterial(material.id)" class="text-red-600 hover:underline">Удалить</button>
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
import { useMaterialsStore } from '@/stores/materials'
import { useServicesStore } from '@/stores/services'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const materialsStore = useMaterialsStore()
const servicesStore = useServicesStore()

const filters = reactive({
  search: '',
  isActive: '',
  serviceId: '',
})

const filteredMaterials = computed(() => {
  let list = materialsStore.list

  if (filters.search) {
    const s = filters.search.toLowerCase()
    list = list.filter(m =>
      m.name.toLowerCase().includes(s) ||
      (m.short_name && m.short_name.toLowerCase().includes(s))
    )
  }
  if (filters.isActive !== '') {
    list = list.filter(m => m.is_active === filters.isActive)
  }
  if (filters.serviceId) {
    const serviceId = Number(filters.serviceId)
    list = list.filter(m =>
      m.serviceMaterials?.some(sm => sm.service_id === serviceId)
    )
  }
  return list
})

const getActivePrice = (materialId) => {
  return materialsStore.getActivePrice(materialId)
}

const applyFilters = () => {}
const resetFilters = () => {
  filters.search = ''
  filters.isActive = ''
  filters.serviceId = ''
}

const goToEdit = (id) => {
  router.push(`/materials/${id}/edit`)
}

const deleteMaterial = async (id) => {
  if (!confirm('Удалить этот материал? (будет деактивирован)')) return
  try {
    await materialsStore.remove(id)
    showToast.success('Материал удалён')
  } catch (error) {
    console.error('Ошибка удаления:', error)
    showToast.error('Не удалось удалить материал')
  }
}

// Загружаем данные при монтировании
onMounted(async () => {
  console.log('🔄 Загрузка материалов...')
  await materialsStore.fetchList()
  console.log('📦 Материалы загружены:', materialsStore.list.length)
  await servicesStore.fetchList()
})
</script>