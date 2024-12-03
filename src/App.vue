<template>
  <router-view></router-view>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
:root {
  --bg-color: #ffffff;
  --text-primary: #1a202c;
  --text-secondary: #4a5568;
}

body.dark {
  --bg-color: #1a202c;
  --text-primary: #f7fafc;
  --text-secondary: #a0aec0;
}
</style> 