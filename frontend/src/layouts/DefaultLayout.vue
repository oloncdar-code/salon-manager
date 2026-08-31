<template>
  <div class="flex h-screen">
    <aside class="w-64 bg-gray-800 text-white p-4">
      <h2 class="text-xl font-bold mb-6">Салон</h2>
      <nav>
        <!-- Записи видят все -->
        <router-link to="/appointments" class="block py-2 hover:bg-gray-700 px-2 rounded">Записи</router-link>
        <router-link to="/appointments/board" class="block py-2 hover:bg-gray-700 px-2 rounded">Доска</router-link>

        <!-- Администратор -->
        <template v-if="isAdmin">
          <router-link to="/services" class="block py-2 hover:bg-gray-700 px-2 rounded">Услуги</router-link>
          <router-link to="/masters" class="block py-2 hover:bg-gray-700 px-2 rounded">Мастера</router-link>
          <router-link to="/materials" class="block py-2 hover:bg-gray-700 px-2 rounded">Материалы</router-link>
          <router-link to="/work-schedule/overview" class="block py-2 hover:bg-gray-700 px-2 rounded">Общий график</router-link>
          <router-link to="/work-schedule" class="block py-2 hover:bg-gray-700 px-2 rounded">Мой график</router-link>
        </template>

        <!-- Мастер -->
        <template v-else-if="isMaster">
          <router-link to="/work-schedule" class="block py-2 hover:bg-gray-700 px-2 rounded">Мой график</router-link>
        </template>

        <!-- Клиент  -->

        <button
          @click="logout"
          class="block w-full text-left py-2 hover:bg-gray-700 px-2 rounded mt-4 border-t border-gray-700 pt-4"
        >
          Выйти
        </button>
      </nav>
    </aside>
    <main class="flex-1 p-6 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const isAdmin = computed(() => authStore.user?.role === 'admin')
const isMaster = computed(() => authStore.user?.role === 'master')
const isClient = computed(() => authStore.user?.role === 'client')

const logout = () => authStore.logout()
</script>