import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: '儀表板',
        component: () => import('../views/dashboard/index.vue')
      },
      {
        path: 'task',
        name: '任務管理',
        component: () => import('../views/task/TaskList.vue')
      },
      {
        path: 'chat',
        name: '聊天室',
        component: () => import('../views/chat/ChatRoom.vue')
      },
      {
        path: 'search',
        name: '搜尋',
        component: () => import('../views/search/index.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (import.meta.env.VITE_DEV_MODE === 'true') {
    next()
    return
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isPublic = to.matched.some(record => record.meta.public)
  const isAuthenticated = localStorage.getItem('token')

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (isAuthenticated && isPublic) {
    next('/')
  } else {
    next()
  }
})

export default router 