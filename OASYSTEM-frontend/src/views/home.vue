<template>
  <div class="home-container">
    <h2 class="welcome">歡迎回來</h2>
    <!-- 這裡可以放置儀表板的內容，比如統計數據、圖表等 -->
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>
.home-container {
  padding: 2rem;
}

.welcome {
  font-size: 1.8rem;
  font-weight: 500;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #007AFF, #5856D6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style> 