<template>
  <div class="bookmark-manager">
    <div class="toolbar">
      <h2>書籤管理</h2>
      <button class="add-folder-btn" @click="showAddFolder">
        <i class="fas fa-folder-plus"></i>
        新增資料夾
      </button>
    </div>

    <div class="bookmark-list">
      <div v-for="folder in folders" :key="folder.id" class="folder">
        <div class="folder-header">
          <i class="fas fa-folder"></i>
          <span class="folder-name">{{ folder.name }}</span>
          <span class="bookmark-count">
            {{ getBookmarkCount(folder.id) }}
          </span>
        </div>
        
        <div class="bookmark-items">
          <div 
            v-for="bookmark in getBookmarks(folder.id)" 
            :key="bookmark.id"
            class="bookmark-item"
            @click="openBookmark(bookmark)"
          >
            <img :src="bookmark.favicon" class="favicon" />
            <span class="title">{{ bookmark.title }}</span>
            <button 
              class="remove-btn"
              @click.stop="removeBookmark(bookmark.id)"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useBookmarksStore } from '../store/bookmarks'

export default {
  setup() {
    const store = useBookmarksStore()

    const getBookmarks = (folderId) => {
      return store.bookmarks.filter(b => b.folderId === folderId)
    }

    const getBookmarkCount = (folderId) => {
      return getBookmarks(folderId).length
    }

    return {
      folders: computed(() => store.folders),
      getBookmarks,
      getBookmarkCount,
      removeBookmark: store.remove,
      openBookmark: (bookmark) => window.open(bookmark.url, '_blank'),
      showAddFolder: () => {
        const name = prompt('請輸入資料夾名稱')
        if (name) store.addFolder(name)
      }
    }
  }
}
</script>

<style scoped>
.bookmark-manager {
  padding: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.add-folder-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
}

.folder {
  margin-bottom: 16px;
}

.folder-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--folder-bg);
  border-radius: 8px;
}

.bookmark-items {
  margin-left: 24px;
}

.bookmark-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.bookmark-item:hover {
  background: var(--hover-bg);
}

.favicon {
  width: 16px;
  height: 16px;
}

.title {
  flex: 1;
}

.remove-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.bookmark-item:hover .remove-btn {
  opacity: 1;
}
</style> 