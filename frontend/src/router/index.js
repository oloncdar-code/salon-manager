import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { guest: true },
  },
  {
    path: '/',
    redirect: '/appointments',
  },
  {
    path: '/appointments',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Appointments',
        component: () => import('@/views/Appointments/List.vue'),
      },
      {
        path: 'new',
        name: 'AppointmentCreate',
        component: () => import('@/views/Appointments/Create.vue'),
      },
      {
        path: ':id',
        name: 'AppointmentDetail',
        component: () => import('@/views/Appointments/Detail.vue'),
      },
      {
        path: 'board',
        name: 'AppointmentsBoard',
        component: () => import('@/views/Appointments/Board.vue'),
      },
    ],
  },
  {
    path: '/services',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Services',
        component: () => import('@/views/Services/List.vue'),
      },
      {
        path: 'new',
        name: 'ServiceCreate',
        component: () => import('@/views/Services/Form.vue'),
      },
      {
        path: ':id/edit',
        name: 'ServiceEdit',
        component: () => import('@/views/Services/Form.vue'),
      },
    ],
  },
  {
    path: '/masters',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Masters',
        component: () => import('@/views/Masters/List.vue'),
      },
      {
        path: 'new',
        name: 'MasterCreate',
        component: () => import('@/views/Masters/Form.vue'),
      },
      {
        path: ':id/edit',
        name: 'MasterEdit',
        component: () => import('@/views/Masters/Form.vue'),
      },
    ],
  },
  {
    path: '/materials',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Materials',
        component: () => import('@/views/Materials/List.vue'),
      },
      {
        path: 'new',
        name: 'MaterialCreate',
        component: () => import('@/views/Materials/Form.vue'),
      },
      {
        path: ':id/edit',
        name: 'MaterialEdit',
        component: () => import('@/views/Materials/Form.vue'),
      },
    ],
  },
  {
    path: '/work-schedule',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'WorkSchedule',
        component: () => import('@/views/WorkSchedule/Calendar.vue'),
      },
    ],
  },
  {
    path: '/work-schedule/overview',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'WorkScheduleOverview',
        component: () => import('@/views/WorkSchedule/Overview.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.token) {
    return '/login'
  }
  if (to.meta.guest && authStore.token) {
    return '/appointments'
  }
  return true
})

export default router