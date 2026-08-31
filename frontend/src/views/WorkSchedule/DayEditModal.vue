<template>
  <Modal v-if="show" @close="close">
    <template #header>
      {{ formatDateOnly(day?.date) }}
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
      <AppButton variant="primary" @click="save">Сохранить</AppButton>
      <AppButton variant="danger" @click="deleteDay" v-if="day?.id">Удалить</AppButton>
      <AppButton variant="secondary" @click="close">Отмена</AppButton>
    </template>
  </Modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { formatLocalTime, formatDateOnly } from '@/utils/date'
import { useWorkScheduleStore } from '@/stores/workSchedule'

const store = useWorkScheduleStore()

const props = defineProps({
  show: Boolean,
  day: Object, // { date, id, entry, startTime, endTime, isWorking, isDayOff }
  masterId: Number,
  onSaved: Function,
})

const emit = defineEmits(['update:show'])

const editForm = reactive({
  isDayOff: false,
  startTime: '',
  endTime: '',
  breakStart: '',
  breakEnd: '',
})

watch(
  () => props.show,
  (val) => {
    if (val && props.day) {
      if (props.day.entry) {
        editForm.isDayOff = !props.day.entry.is_working
        editForm.startTime = props.day.entry.start_time ? formatLocalTime(props.day.entry.start_time) : ''
        editForm.endTime = props.day.entry.end_time ? formatLocalTime(props.day.entry.end_time) : ''
        editForm.breakStart = props.day.entry.break_start ? formatLocalTime(props.day.entry.break_start) : ''
        editForm.breakEnd = props.day.entry.break_end ? formatLocalTime(props.day.entry.break_end) : ''
      } else {
        editForm.isDayOff = false
        editForm.startTime = '09:00'
        editForm.endTime = '18:00'
        editForm.breakStart = ''
        editForm.breakEnd = ''
      }
    }
  }
)

const close = () => {
  emit('update:show', false)
}

const save = async () => {
  if (!props.masterId || !props.day) return
  const dateStr = props.day.date
  const payload = {
    masterId: props.masterId,
    date: dateStr,
    isWorking: !editForm.isDayOff,
    startTime: editForm.isDayOff ? null : `${dateStr}T${editForm.startTime}:00+07:00`,
    endTime: editForm.isDayOff ? null : `${dateStr}T${editForm.endTime}:00+07:00`,
    breakStart: editForm.isDayOff || !editForm.breakStart ? null : `${dateStr}T${editForm.breakStart}:00+07:00`,
    breakEnd: editForm.isDayOff || !editForm.breakEnd ? null : `${dateStr}T${editForm.breakEnd}:00+07:00`,
  }
  try {
    await store.upsert(payload)
    close()
    if (props.onSaved) props.onSaved()
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    showToast.error('Не удалось сохранить график')
  }
}

const deleteDay = async () => {
  if (!props.day?.id) return
  if (!confirm('Удалить запись для этого дня?')) return
  try {
    await store.delete(props.day.id)
    close()
    if (props.onSaved) props.onSaved()
  } catch (error) {
    console.error('Ошибка удаления:', error)
    showToast.error('Не удалось удалить запись')
  }
}
</script>