<template>
  <div class="emoji-picker">
    <!-- 表情包分類 -->
    <div class="emoji-categories">
      <el-button-group>
        <el-button 
          v-for="category in categories" 
          :key="category.id"
          type="primary"
          link
          :class="{ active: currentCategory === category.id }"
          @click="currentCategory = category.id"
        >
          <el-icon>
            <component :is="category.icon" />
          </el-icon>
        </el-button>
      </el-button-group>
    </div>

    <!-- 表情包列表 -->
    <div class="emoji-list">
      <div 
        v-for="emoji in currentEmojis" 
        :key="emoji.id"
        class="emoji-item"
        @click="selectEmoji(emoji)"
      >
        {{ emoji.char }}
      </div>
    </div>

    <!-- 最近使用 -->
    <div v-if="recentEmojis.length" class="recent-emojis">
      <div class="section-title">最近使用</div>
      <div class="emoji-list">
        <div 
          v-for="emoji in recentEmojis" 
          :key="emoji.id"
          class="emoji-item"
          @click="selectEmoji(emoji)"
        >
          {{ emoji.char }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Sunny, 
  Food, 
  Football, 
  Clock,
  Star 
} from '@element-plus/icons-vue'

// 表情分類
const categories = [
  { id: 'recent', name: '最近使用', icon: 'Clock' },
  { id: 'smileys', name: '表情', icon: 'Sunny' },
  { id: 'food', name: '食物', icon: 'Food' },
  { id: 'activity', name: '活動', icon: 'Football' },
  { id: 'symbols', name: '符號', icon: 'Star' }
]

// 表情數據
const emojiData = {
  smileys: [
    { id: 'smile', char: '😊', keywords: ['smile', 'happy'] },
    { id: 'laugh', char: '😄', keywords: ['laugh', 'haha'] },
    { id: 'wink', char: '😉', keywords: ['wink'] },
    { id: 'love', char: '😍', keywords: ['love', 'heart'] },
    { id: 'cool', char: '😎', keywords: ['cool', 'sunglasses'] }
  ],
  food: [
    { id: 'pizza', char: '🍕', keywords: ['pizza'] },
    { id: 'burger', char: '🍔', keywords: ['burger'] },
    { id: 'coffee', char: '☕', keywords: ['coffee'] },
    { id: 'cake', char: '🍰', keywords: ['cake'] }
  ],
  activity: [
    { id: 'ball', char: '⚽', keywords: ['soccer', 'football'] },
    { id: 'game', char: '🎮', keywords: ['game', 'play'] },
    { id: 'music', char: '🎵', keywords: ['music', 'note'] }
  ],
  symbols: [
    { id: 'heart', char: '❤️', keywords: ['heart', 'love'] },
    { id: 'star', char: '⭐', keywords: ['star'] },
    { id: 'check', char: '✅', keywords: ['check', 'done'] }
  ]
}

const currentCategory = ref('smileys')
const recentEmojis = ref<typeof emojiData.smileys>([])

// 當前分類的表情
const currentEmojis = computed(() => {
  return currentCategory.value === 'recent' 
    ? recentEmojis.value 
    : emojiData[currentCategory.value as keyof typeof emojiData] || []
})

// 選擇表情
const emit = defineEmits<{
  (e: 'select', emoji: { id: string; char: string }): void
}>()

const selectEmoji = (emoji: { id: string; char: string }) => {
  emit('select', emoji)
  addToRecent(emoji)
}

// 添加到最近使用
const addToRecent = (emoji: { id: string; char: string }) => {
  const index = recentEmojis.value.findIndex(e => e.id === emoji.id)
  if (index > -1) {
    recentEmojis.value.splice(index, 1)
  }
  recentEmojis.value.unshift(emoji)
  if (recentEmojis.value.length > 20) {
    recentEmojis.value.pop()
  }
}
</script>

<style scoped>
.emoji-picker {
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 10px;
}

.emoji-categories {
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.emoji-list {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 5px;
  padding: 5px;
}

.emoji-item {
  font-size: 20px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.emoji-item:hover {
  background-color: #f5f7fa;
}

.section-title {
  font-size: 12px;
  color: #909399;
  margin: 10px 0 5px;
  padding: 0 5px;
}

.recent-emojis {
  border-top: 1px solid #eee;
  margin-top: 10px;
  padding-top: 5px;
}
</style> 