<template>
  <div class="tab-bar">
    <div class="tabs">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="tab"
        :class="{ active: tab.id === activeTab }"
        @click="$emit('switch', tab.id)"
      >
        <img v-if="tab.favicon" :src="tab.favicon" class="favicon" />
        <span class="title">{{ tab.title }}</span>
        <button 
          class="close-btn"
          @click.stop="$emit('close', tab.id)"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    <button class="new-tab-btn" @click="$emit('add')">
      <i class="fas fa-plus"></i>
    </button>
  </div>
</template>

<script setup>
defineProps({
  tabs: {
    type: Array,
    required: true,
    default: () => []
  },
  activeTab: {
    type: [String, Number],
    default: null
  }
})

defineEmits(['switch', 'close', 'add'])
</script>

<style scoped>
.tab-bar {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 8px;
  background: var(--toolbar-bg);
  border-bottom: 1px solid var(--border-color);
}

.tabs {
  display: flex;
  flex-wrap: nowrap;
  min-width: 0;
  overflow-x: auto;
  gap: 2px;
}

.tab {
  display: flex;
  align-items: center;
  min-width: 140px;
  max-width: 200px;
  height: 32px;
  padding: 0 8px;
  background: var(--tab-bg);
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.tab.active {
  background: var(--tab-active-bg);
}

.favicon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

.title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.close-btn,
.new-tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover,
.new-tab-btn:hover {
  background: var(--hover-bg);
}
</style> 