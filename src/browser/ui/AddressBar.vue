<template>
  <div class="address-bar">
    <div class="actions">
      <button 
        class="action-btn"
        @click="goBack"
        :disabled="!canGoBack"
      >
        <i class="fas fa-arrow-left"></i>
      </button>
      <button 
        class="action-btn"
        @click="goForward"
        :disabled="!canGoForward"
      >
        <i class="fas fa-arrow-right"></i>
      </button>
      <button 
        class="action-btn"
        @click="refresh"
      >
        <i class="fas fa-redo"></i>
      </button>
    </div>

    <div class="url-input">
      <input
        type="text"
        v-model="inputUrl"
        @keyup.enter="navigate"
        @focus="selectAll"
        placeholder="輸入網址或搜尋"
      />
      <div class="security-info" v-if="isHttps">
        <i class="fas fa-lock"></i>
      </div>
    </div>

    <div class="actions">
      <button class="action-btn" @click="toggleBookmark">
        <i class="fas" :class="isBookmarked ? 'fa-star' : 'fa-star-o'"></i>
      </button>
      <button class="action-btn" @click="showSettings">
        <i class="fas fa-ellipsis-v"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue'
import { useBookmarksStore } from '../store/bookmarks'

export default {
  props: {
    modelValue: String
  },

  emits: ['update:modelValue', 'navigate'],

  setup(props, { emit }) {
    const inputUrl = ref(props.modelValue)
    const canGoBack = ref(false)
    const canGoForward = ref(false)
    const isHttps = ref(false)
    const bookmarksStore = useBookmarksStore()

    watch(() => props.modelValue, (newUrl) => {
      if (typeof newUrl === 'string') {
        inputUrl.value = newUrl
        isHttps.value = newUrl?.startsWith('https://')
      }
    })

    const navigate = () => {
      let url = inputUrl.value
      if (!url) return

      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://www.google.com/search?q=${encodeURIComponent(url)}`
      }
      emit('navigate', url)
    }

    const selectAll = (e) => {
      e.target.select()
    }

    const isBookmarked = computed(() => {
      return bookmarksStore.isBookmarked(props.modelValue)
    })

    return {
      inputUrl,
      canGoBack,
      canGoForward,
      isHttps,
      isBookmarked,
      navigate,
      selectAll,
      goBack: () => window.history.back(),
      goForward: () => window.history.forward(),
      refresh: () => window.location.reload(),
      toggleBookmark: () => bookmarksStore.toggle(props.modelValue),
      showSettings: () => {/* TODO */}
    }
  }
}
</script>

<style scoped>
.address-bar {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 8px;
  gap: 8px;
}

.actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--hover-bg);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.url-input {
  flex: 1;
  position: relative;
  height: 32px;
}

.url-input input {
  width: 100%;
  height: 100%;
  padding: 0 36px 0 12px;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 14px;
}

.security-info {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--success-color);
}
</style> 