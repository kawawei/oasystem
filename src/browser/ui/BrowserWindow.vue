<template>
  <div class="browser-window">
    <div class="browser-toolbar">
      <AddressBar 
        v-model="currentUrl"
        @navigate="handleNavigate"
      />
      <TabBar 
        :tabs="tabs"
        :activeTab="activeTab"
        @switch="switchTab"
        @close="closeTab"
        @add="addTab"
      />
    </div>
    <div class="browser-content">
      <iframe
        v-for="tab in tabs"
        :key="tab.id"
        :src="tab.url"
        :style="{ display: tab.id === activeTab ? 'flex' : 'none' }"
        @load="(event) => handleLoad(event, tab)"
        sandbox="allow-scripts allow-popups allow-forms"
        referrerpolicy="no-referrer"
        allow="fullscreen"
      ></iframe>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useTabsStore } from '../store/tabs'
import AddressBar from './AddressBar.vue'
import TabBar from './TabBar.vue'

export default {
  components: {
    AddressBar,
    TabBar
  },
  setup() {
    const tabsStore = useTabsStore()
    const tabs = computed(() => tabsStore.tabs)
    const activeTab = computed(() => tabsStore.activeTab)
    const currentUrl = ref('')
    
    onMounted(() => {
      if (tabs.value.length === 0) {
        tabsStore.addTab('/proxy/search')
      }
    })
    
    const handleLoad = (event, tab) => {
      try {
        const title = event.target.contentDocument?.title
        if (title) {
          tabsStore.updateTab({
            id: tab.id,
            title
          })
        }
      } catch (e) {
        console.log('無法訪問 iframe 內容')
      }
    }

    const handleNavigate = (url) => {
      if (typeof url === 'string') {
        tabsStore.updateTab({
          id: activeTab.value,
          url,
          title: url
        })
        currentUrl.value = url
      }
    }

    return {
      tabs,
      activeTab,
      currentUrl,
      handleNavigate,
      handleLoad,
      switchTab: (id) => tabsStore.switchTab(id),
      closeTab: (id) => tabsStore.closeTab(id),
      addTab: () => tabsStore.addTab()
    }
  }
}
</script>

<style scoped>
.browser-window {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-color);
}

.browser-toolbar {
  display: grid;
  grid-template-rows: auto auto;
  background: var(--toolbar-bg);
}

.browser-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.browser-content iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style> 