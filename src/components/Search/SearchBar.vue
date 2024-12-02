<template>
  <div class="search-bar">
    <div class="search-input-wrapper">
      <i class="fas fa-search search-icon"></i>
      <input 
        type="text" 
        v-model="searchQuery"
        placeholder="搜尋..."
        @input="handleSearch"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  data() {
    return {
      searchQuery: ''
    }
  },
  methods: {
    handleSearch() {
      // TODO: 實現搜尋邏輯
      this.$emit('search', this.searchQuery)
    }
  }
}
</script>

<style scoped>
.search-bar {
  width: 100%;
  max-width: 600px;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #86868b;
}

input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: none;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.05);
  font-size: 1rem;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 0 2px #0071e3;
}
</style> 