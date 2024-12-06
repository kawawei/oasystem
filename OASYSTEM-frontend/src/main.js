import { createApp } from 'vue';
import { createStore } from 'vuex';
import App from './App.vue';
import router from './router/index.js';
import axios from 'axios';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

// 創建 axios 實例
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',  // 改為後端服務器地址
  timeout: 5000
});

// 添加請求攔截器
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 創建 store
const store = createStore({
  state() {
    return {
      // 添加您需要的狀態
      user: null,
      teams: []
    }
  },
  mutations: {
    // 添加您需要的 mutations
    setUser(state, user) {
      state.user = user
    },
    setTeams(state, teams) {
      state.teams = teams
    }
  }
});

const app = createApp(App);

// 註冊所有圖標
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 將 axios 實例添加到全局屬性
app.config.globalProperties.$axios = axiosInstance;

app.use(router);
app.use(store);
app.use(ElementPlus);
app.mount('#app');
