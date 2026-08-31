<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h1 class="text-2xl font-bold mb-4">Вход</h1>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Телефон</label>
          <input
            v-model="phone"
            type="text"
            class="w-full border rounded px-3 py-2"
            placeholder="+79990001122"
          />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Пароль</label>
          <input
            v-model="password"
            type="password"
            class="w-full border rounded px-3 py-2"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Войти
        </button>
      </form>
      <p class="mt-4 text-sm text-center text-gray-500">
        Тестовый доступ: <br />
        Телефон: <span class="font-mono">+79990001122</span><br />
        Пароль: <span class="font-mono">test123</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const phone = ref('+79990001122')
const password = ref('test123')
const authStore = useAuthStore()

const handleLogin = async () => {
  try {
    await authStore.login({ phone: phone.value, password: password.value })
  } catch (error) {
    console.error('Ошибка входа:', error)
    showToast.error('Неверный телефон или пароль')
  }
}
</script>