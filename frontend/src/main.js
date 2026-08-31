import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'
import router from './router'  
import App from './App.vue'
import './style.css'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'


const app = createApp(App)
const pinia = createPinia()

app.use(createPinia())
app.use(router)

const authStore = useAuthStore()
if (authStore.token) {
  await authStore.fetchUser() // или .then()
}

const toastOptions = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
}

app.use(Toast, toastOptions)

app.mount('#app')