import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/home'  // 將根路徑重定向到 /home
    },
    {
      path: '/home',
      name: 'home',
      component: Home
    }
  ]
})

export default router 