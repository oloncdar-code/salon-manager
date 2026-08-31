<template>
  <div
    v-if="appointment && appointment.id"
    class="bg-white p-3 rounded shadow hover:shadow-md transition cursor-pointer border-l-4"
    :class="borderColor"
    @click="$emit('click', appointment)"
  >
    <div class="flex justify-between items-start">
      <span class="text-xs font-medium text-gray-500">{{ formatTime }}</span>
      <span class="text-xs text-gray-400">#{{ appointment.id }}</span>
    </div>
    <div class="font-medium text-sm mt-1">{{ clientName }}</div>
    <div class="text-xs text-gray-600">{{ serviceName }}</div>
    <div v-if="showMaster" class="text-xs text-gray-500 mt-1">👤 {{ masterName }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatLocalTime } from '@/utils/date'

const props = defineProps({
  appointment: Object,
  showMaster: Boolean,
})

defineEmits(['click'])

const formatTime = computed(() => {
  return props.appointment?.start_time ? formatLocalTime(props.appointment.start_time) : ''
})

const clientName = computed(() => {
  return props.appointment?.client?.user?.full_name || 'Клиент'
})

const serviceName = computed(() => {
  return props.appointment?.service?.short_name || props.appointment?.service?.name || 'Услуга'
})

const masterName = computed(() => {
  return props.appointment?.master?.user?.full_name || 'Мастер'
})

const borderColor = computed(() => {
  const colors = {
    created: 'border-gray-400',
    await_confirm: 'border-yellow-400',
    confirmed: 'border-blue-400',
    completed: 'border-green-400',
    cancelled: 'border-red-400',
  }
  return colors[props.appointment?.status] || 'border-gray-300'
})
</script>