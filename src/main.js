import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import '@fortawesome/fontawesome-free/css/all.css'
import './assets/styles/global.css'
import './assets/styles/theme.css'

const app = createApp(App)
const pinia = createPinia()

// 添加路由錯誤處理
router.onError((error) => {
  console.error('Router error:', error)
})

app.use(pinia)
app.use(router)
app.mount('#app') 