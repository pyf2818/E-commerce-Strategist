import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GeneratedContent, ContentType } from '@/types'

export const useContentStore = defineStore('content', () => {
  // 状态
  const contents = ref<GeneratedContent[]>([])
  const favorites = ref<Set<string>>(new Set())

  // 计算属性
  const recentContents = computed(() => {
    return [...contents.value].sort((a, b) => b.createdAt - a.createdAt).slice(0, 20)
  })

  const favoriteContents = computed(() => {
    return contents.value.filter(c => favorites.value.has(c.id))
  })

  const contentsByType = computed(() => {
    const map = new Map<ContentType, GeneratedContent[]>()
    contents.value.forEach(c => {
      const list = map.get(c.type) || []
      list.push(c)
      map.set(c.type, list)
    })
    return map
  })

  // Actions
  const addContent = (content: Omit<GeneratedContent, 'id' | 'createdAt'>) => {
    const newContent: GeneratedContent = {
      ...content,
      id: `content-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: Date.now()
    }
    contents.value.unshift(newContent)
    return newContent
  }

  const deleteContent = (id: string) => {
    const index = contents.value.findIndex(c => c.id === id)
    if (index > -1) {
      contents.value.splice(index, 1)
      favorites.value.delete(id)
    }
  }

  const toggleFavorite = (id: string) => {
    if (favorites.value.has(id)) {
      favorites.value.delete(id)
    } else {
      favorites.value.add(id)
    }
  }

  const isFavorite = (id: string) => {
    return favorites.value.has(id)
  }

  const clearAll = () => {
    contents.value = []
    favorites.value.clear()
  }

  const getContentById = (id: string) => {
    return contents.value.find(c => c.id === id)
  }

  return {
    // 状态
    contents,
    favorites,
    recentContents,
    favoriteContents,
    contentsByType,
    // 方法
    addContent,
    deleteContent,
    toggleFavorite,
    isFavorite,
    clearAll,
    getContentById
  }
}, {
  persist: {
    key: 'content-history',
    storage: localStorage,
    paths: ['contents', 'favorites'],
    serializer: {
      serialize: (state) => JSON.stringify({
        contents: state.contents,
        favorites: Array.from(state.favorites)
      }),
      deserialize: (value) => {
        const parsed = JSON.parse(value)
        return {
          contents: parsed.contents || [],
          favorites: new Set(parsed.favorites || [])
        }
      }
    }
  }
})
