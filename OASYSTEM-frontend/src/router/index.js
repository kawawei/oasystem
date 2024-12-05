import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/login.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/register.vue')
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true }
    }
  ]
});

// 路由守衛
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  if (to.meta.requiresAuth && !token) {
    // 需要認證但沒有 token，跳轉到登入頁
    next('/login');
  } else if (token && (to.path === '/login' || to.path === '/register')) {
    // 已登入用戶訪問登入或註冊頁，跳轉到儀表板
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
