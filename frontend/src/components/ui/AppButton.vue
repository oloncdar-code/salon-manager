<template>
  <button
    :type="type"
    class="px-4 py-2 rounded-md font-medium transition-colors"
    :class="{
      'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
      'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary',
      'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
    }"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' },
  disabled: Boolean,
})
defineEmits(['click'])
</script>