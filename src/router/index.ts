import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/Home.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('../views/Users.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'attendance',
          name: 'attendance',
          component: () => import('../views/Attendance.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('../views/Settings.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/Profile.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'crm/stranger',
          name: 'crm-stranger',
          component: () => import('../views/crm/StrangerCustomers.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'crm/potential',
          name: 'crm-potential',
          component: () => import('../views/crm/PotentialCustomers.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'crm/cooperated',
          name: 'crm-cooperated',
          component: () => import('../views/crm/CooperatedCustomers.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'finance',
          name: 'finance',
          component: () => import('../views/finance/Index.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'schedule',
          name: 'schedule',
          component: () => import('../views/schedule/Index.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/task',
          name: 'task',
          component: () => import('@/views/task/Index.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/task/:id',
          name: 'taskDetail',
          component: () => import('@/views/task/Detail.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/task/report',
          name: 'taskReport',
          component: () => import('@/views/task/Report.vue'),
          meta: { requiresAuth: true }
        }
      ]
    }
  ]
})

// 路由守衛
router.beforeEach((to, _from, next) => {
  if (to.path !== '/login' && !localStorage.getItem('token')) {
    next('/login')
  } else {
    next()
  }
})

export default router 