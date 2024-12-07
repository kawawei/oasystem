<template>
  <div class="note-editor"
    :style="{ 
      backgroundColor: note?.paperColor || '#ffffff',
      backgroundImage: getBackgroundPattern()
    }"
  >
    <!-- 其他編輯器內容 -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

// 創建 axios 實例
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000
})

const route = useRoute()
const note = ref(null)

// 修改 fetchNote 方法
const fetchNote = async () => {
  try {
    const response = await api.get(`/api/notes/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    note.value = response.data.data
    console.log('Note data:', note.value)
  } catch (error) {
    console.error('Fetch note error:', error)
  }
}

onMounted(() => {
  fetchNote()
})

const coverTemplates = [
  { 
    id: 1, 
    name: '空白', 
    pattern: null
  },
  { 
    id: 2, 
    name: '方格', 
    pattern: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
        <path d="M 20 0 L 0 0 0 20" stroke="rgba(0, 0, 0, 0.1)" stroke-width="1" fill="none"/>
        <path d="M 0 20 L 20 20 20 0" stroke="rgba(0, 0, 0, 0.1)" stroke-width="1" fill="none"/>
      </svg>
    `.trim())
  },
  { 
    id: 3, 
    name: '橫線', 
    pattern: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="100%" height="20" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="19" x2="100%" y2="19" stroke="rgba(0, 0, 0, 0.1)" stroke-width="1"/>
      </svg>
    `.trim())
  }
]

// 添加這個方法來處理背景圖案
const getBackgroundPattern = () => {
  console.log('Current note:', note.value)
  if (!note.value) return null
  if (note.value.coverStyle) return null
  const template = coverTemplates[note.value.template - 1]
  console.log('Selected template:', template)
  const pattern = template?.pattern ? `url(${template.pattern})` : null
  console.log('Generated pattern:', pattern)
  return pattern
}
</script>

<style scoped>
.note-editor {
  min-height: 100vh;
  padding: 2rem;
  background-repeat: repeat !important;
  background-position: top left !important;
  background-size: auto !important;
  transition: all 0.3s ease;
}
</style> 