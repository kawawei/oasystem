<template>
  <div class="settings-panel">
    <div class="panel-header">
      <h3>瀏覽器設置</h3>
      <button class="close-btn" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="settings-content">
      <div class="setting-group">
        <h4>一般設置</h4>
        <div class="setting-item">
          <label>
            <input 
              type="checkbox" 
              v-model="settings.openLinksInNewTab"
            >
            在新標籤頁中打開連結
          </label>
        </div>
        <div class="setting-item">
          <label>
            <input 
              type="checkbox" 
              v-model="settings.showBookmarkBar"
            >
            顯示書籤列
          </label>
        </div>
      </div>

      <div class="setting-group">
        <h4>搜尋引擎</h4>
        <select v-model="settings.searchEngine">
          <option value="google">Google</option>
          <option value="bing">Bing</option>
          <option value="duckduckgo">DuckDuckGo</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue'

export default {
  setup() {
    const settings = reactive({
      openLinksInNewTab: true,
      showBookmarkBar: true,
      searchEngine: 'google'
    })

    return {
      settings
    }
  }
}
</script>

<style scoped>
.settings-panel {
  width: 400px;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow-color);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.settings-content {
  padding: 16px;
}

.setting-group {
  margin-bottom: 24px;
}

.setting-item {
  margin: 12px 0;
}
</style> 