import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue'
import Task from '../views/task.vue'
import Setting from '../views/setting.vue'
import Notes from '../views/notes.vue'
import NoteEdit from '../views/noteEdit.vue'

const routes = [
  {
    path: '/',
    component: Dashboard,
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: {
          template: '<div></div>'
        },
        meta: { requiresAuth: true }
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: Task,
        meta: { requiresAuth: true }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Setting,
        meta: { requiresAuth: true }
      },
      {
        path: 'team',
        name: 'Team',
        component: () => import('../views/team.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'notes',
        name: 'Notes',
        component: Notes,
        meta: { requiresAuth: true }
      },
      {
        path: 'notes/:id',
        name: 'NoteEdit',
        component: NoteEdit,
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/register.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守衛
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router;