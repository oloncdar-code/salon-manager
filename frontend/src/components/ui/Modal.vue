<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div v-if="$slots.header" class="text-lg font-semibold border-b pb-2 mb-4">
        <slot name="header" />
      </div>
      <div class="mb-4">
        <slot name="body" />
      </div>
      <div class="flex justify-end gap-2 border-t pt-3">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['close'])
</script>