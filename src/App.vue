<template>
  <el-config-provider :locale="zhTw">
    <router-view />
    <ChatWindow v-if="isLoggedIn && !isLoginPage" />
  </el-config-provider>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  height: 100%;
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from './stores/user'
import { useRoute } from 'vue-router'
import zhTw from 'element-plus/es/locale/lang/zh-tw'
import ChatWindow from '@/components/chat/ChatWindow.vue'

const userStore = useUserStore()
const route = useRoute()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const isLoginPage = computed(() => route.path === '/login')
</script>
