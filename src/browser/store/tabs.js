import { defineStore } from 'pinia'

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    tabs: [],
    activeTab: null,
    nextId: 1
  }),

  getters: {
    currentTab: (state) => state.tabs.find(tab => tab.id === state.activeTab)
  },

  actions: {
    addTab(url = 'about:blank') {
      const tab = {
        id: this.nextId++,
        url: url || 'https://www.google.com',
        title: 'New Tab',
        favicon: null,
        loading: false
      }
      this.tabs.push(tab)
      this.activeTab = tab.id
      return tab.id
    },

    closeTab(id) {
      const index = this.tabs.findIndex(tab => tab.id === id)
      if (index > -1) {
        this.tabs.splice(index, 1)
        if (this.activeTab === id) {
          this.activeTab = this.tabs[Math.min(index, this.tabs.length - 1)]?.id
        }
      }
    },

    updateTab(data) {
      const tab = this.tabs.find(t => t.id === data.id)
      if (tab) {
        Object.assign(tab, data)
      }
    },

    switchTab(id) {
      this.activeTab = id
    }
  }
}) 