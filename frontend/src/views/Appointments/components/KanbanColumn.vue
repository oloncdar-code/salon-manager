<template>
  <div class="flex-1 min-w-[200px] bg-gray-50 rounded-lg p-3">
    <div class="flex justify-between items-center mb-3">
      <h3 class="font-medium text-sm uppercase tracking-wide text-gray-600">
        {{ title }}
      </h3>
      <span class="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
        {{ items.length }}
      </span>
    </div>
    <draggable
      :list="items"
      group="appointments"
      item-key="id"
      class="space-y-2 min-h-[100px]"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <KanbanCard
          :appointment="element"
          :show-master="showMaster"
          @click="onCardClick"
        />
      </template>
    </draggable>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable'
import KanbanCard from './KanbanCard.vue'

const props = defineProps({
  title: String,
  status: String,
  items: Array,
  showMaster: Boolean,
})

const emit = defineEmits(['update-status', 'card-click'])

const onDragEnd = (evt) => {
  const item = props.items[evt.newIndex]
  if (item && item.status !== props.status) {
    emit('update-status', { id: item.id, status: props.status })
  }
}

const onCardClick = (appointment) => {
  emit('card-click', appointment)
}
</script>