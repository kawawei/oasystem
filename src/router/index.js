import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { public: true }
  },
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
    path: '/oa',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/oa/dashboard'
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
      },
      {
        path: 'projects',
        name: '專案管理',
        component: () => import('../views/project/ProjectList.vue')
      },
      {
        path: 'projects/:id',
        name: '專案詳情',
        component: () => import('../views/project/ProjectDetail.vue'),
        props: true
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
  } else if (isAuthenticated && isPublic && to.path !== '/home') {
    next('/oa/dashboard')
  } else {
    next()
  }
})

export default router 