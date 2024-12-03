import { defineStore } from 'pinia'

export const useBookmarksStore = defineStore('bookmarks', {
  state: () => ({
    bookmarks: [],
    folders: [],
    nextId: 1
  }),

  actions: {
    add(data) {
      const bookmark = {
        id: this.nextId++,
        url: data.url,
        title: data.title || data.url,
        favicon: data.favicon,
        folderId: data.folderId,
        createdAt: new Date().toISOString()
      }
      this.bookmarks.push(bookmark)
      return bookmark
    },

    remove(id) {
      const index = this.bookmarks.findIndex(b => b.id === id)
      if (index > -1) {
        this.bookmarks.splice(index, 1)
      }
    },

    addFolder(name) {
      const folder = {
        id: this.nextId++,
        name,
        createdAt: new Date().toISOString()
      }
      this.folders.push(folder)
      return folder
    },

    toggle(url) {
      const exists = this.bookmarks.find(b => b.url === url)
      if (exists) {
        this.remove(exists.id)
      } else {
        this.add({ url })
      }
    },

    isBookmarked(url) {
      return this.bookmarks.some(b => b.url === url)
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'bookmarks',
        storage: localStorage
      }
    ]
  }
}) 