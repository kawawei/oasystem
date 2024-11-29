<template>
  <el-config-provider :locale="zhTw">
    <router-view />
    <div style="display: none">
      登入狀態: {{ isLoggedIn }}
    </div>
    <ChatWindow />
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
import { computed, onMounted } from 'vue'
import { useUserStore } from './stores/user'
import zhTw from 'element-plus/dist/locale/zh-tw.mjs'
import ChatWindow from '@/components/chat/ChatWindow.vue'

const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.isLoggedIn)

// 添加調試代碼
onMounted(() => {
  console.log('App mounted')
  console.log('isLoggedIn:', isLoggedIn.value)
  console.log('userStore:', userStore)
})
</script>
