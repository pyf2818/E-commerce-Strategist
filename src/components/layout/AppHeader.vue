<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore, useContentStore } from '@/stores'

interface Props {
  sidebarCollapsed: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  toggleSidebar: []
}>()

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()
const contentStore = useContentStore()

const pageTitle = computed(() => {
  return (route.meta.title as string) || '首页'
})

const isDark = computed(() => themeStore.getActualTheme() === 'dark')

// 搜索功能
const searchQuery = ref('')
const searchResults = ref<{ type: 'content' | 'knowledge'; title: string; desc?: string; path: string }[]>([])
const showSearchResults = ref(false)

const knowledgeData = [
  { title: '商品标题优化', keywords: ['标题', '优化', '排名', '搜索'] },
  { title: '短视频脚本创作', keywords: ['短视频', '脚本', '直播', '带货'] },
  { title: '商品描述撰写', keywords: ['描述', '详情页', '文案', '卖点'] },
  { title: '营销活动策划', keywords: ['营销', '活动', '促销', '推广'] },
  { title: '客户评价管理', keywords: ['评价', '好评', '差评', 'DSR'] },
  { title: '类目选择策略', keywords: ['类目', '选择', '流量', '竞争'] },
  { title: '新品破零技巧', keywords: ['破零', '新品', '销量', '权重'] },
  { title: '搜索排名优化', keywords: ['排名', 'SEO', '权重', '流量'] },
]

const handleSearch = () => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    searchResults.value = []
    return
  }

  const results: { type: 'content' | 'knowledge'; title: string; desc?: string; path: string }[] = []

  // 搜索内容记录
  contentStore.contents.forEach(content => {
    const titleMatch = content.title.toLowerCase().includes(query)
    const contentMatch = content.content.toLowerCase().includes(query)
    if (titleMatch || contentMatch) {
      results.push({
        type: 'content',
        title: content.title,
        desc: content.type,
        path: `/content?id=${content.id}`
      })
    }
  })

  // 搜索知识库
  knowledgeData.forEach(item => {
    const match = item.title.toLowerCase().includes(query) || 
      item.keywords.some(k => k.toLowerCase().includes(query))
    if (match) {
      results.push({
        type: 'knowledge',
        title: item.title,
        path: '/knowledge'
      })
    }
  })

  searchResults.value = results.slice(0, 8)
  showSearchResults.value = results.length > 0
}

const goToResult = (result: { type: 'content' | 'knowledge'; title: string; path: string }) => {
  router.push(result.path)
  searchQuery.value = ''
  showSearchResults.value = false
}

watch(searchQuery, handleSearch)

const handleBlur = () => {
  setTimeout(() => {
    showSearchResults.value = false
  }, 200)
}

const handleFocus = () => {
  if (searchQuery.value.trim()) {
    handleSearch()
  }
}
</script>

<template>
  <header class="sticky top-0 h-18 z-30">
    <!-- 玻璃拟态背景 -->
    <div class="absolute inset-0 bg-white/70 dark:bg-gray-900/80 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-700/30" />
    
    <!-- 底部高光 -->
    <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

    <div class="relative flex items-center justify-between h-18 px-6">
      <!-- 左侧 -->
      <div class="flex items-center gap-5">
        <!-- 折叠按钮 -->
        <button 
          class="group p-2.5 rounded-xl bg-white/60 dark:bg-gray-800/60 hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-gray-200/50 dark:border-gray-700/30 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10"
          @click="emit('toggleSidebar')"
        >
          <svg 
            class="w-5 h-5 text-gray-600 dark:text-gray-300 transition-all duration-300 group-hover:scale-110 group-hover:text-primary-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        
        <!-- 页面标题 -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center shadow-lg shadow-primary-500/25 animate-pulse-glow">
            <svg
              class="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 class="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            {{ pageTitle }}
          </h1>
        </div>
      </div>

      <!-- 右侧 -->
      <div class="flex items-center gap-4">
        <!-- 搜索框 -->
        <div class="hidden md:flex items-center relative">
          <div class="relative group">
            <input 
              v-model="searchQuery" 
              type="text"
              placeholder="搜索功能..."
              class="w-64 pl-10 pr-4 py-2.5 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/30 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 backdrop-blur-xl dark:text-gray-100"
              @focus="handleFocus"
              @blur="handleBlur"
            >
            <svg
              class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <!-- 搜索结果下拉 -->
          <div 
            v-if="showSearchResults" 
            class="absolute top-full mt-2 w-80 right-0 md:right-auto md:left-0 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden z-50"
          >
            <div class="p-2">
              <div 
                v-for="result in searchResults" 
                :key="result.path + result.title"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 cursor-pointer transition-colors"
                @click="goToResult(result)"
              >
                <div 
                  class="w-8 h-8 rounded-lg flex items-center justify-center"
                  :class="result.type === 'content' ? 'bg-purple-100 dark:bg-purple-900/50' : 'bg-amber-100 dark:bg-amber-900/50'"
                >
                  <svg
                    v-if="result.type === 'content'"
                    class="w-4 h-4 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <svg
                    v-else
                    class="w-4 h-4 text-amber-600 dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                    {{ result.title }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ result.type === 'content' ? '内容记录' : '知识库' }}
                  </div>
                </div>
                <svg
                  class="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- 主题切换 -->
        <button
          class="group p-2.5 rounded-xl bg-white/60 dark:bg-gray-800/60 hover:bg-purple-50 dark:hover:bg-purple-900/30 border border-gray-200/50 dark:border-gray-700/30 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
          :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
          @click="themeStore.toggleTheme()"
        >
          <!-- 太阳图标 (浅色模式时显示) -->
          <svg 
            v-if="isDark"
            class="w-5 h-5 text-amber-400 transition-all duration-300 group-hover:rotate-180 group-hover:scale-110" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
          <!-- 月亮图标 (深色模式时显示) -->
          <svg 
            v-else
            class="w-5 h-5 text-indigo-500 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-110" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path
              fill-rule="evenodd"
              d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        <!-- 快捷操作 -->
        <router-link 
          to="/content"
          class="group relative px-5 py-2.5 rounded-xl font-medium text-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/25 hover:-translate-y-0.5"
        >
          <!-- 按钮背景 -->
          <div class="absolute inset-0 bg-gradient-to-r from-primary-500 via-teal-500 to-cyan-500 transition-all duration-300 group-hover:scale-105" />
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
          
          <!-- 按钮内容 -->
          <span class="relative flex items-center gap-2">
            <svg
              class="w-4 h-4 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>开始创作</span>
          </span>
        </router-link>
      </div>
    </div>
  </header>
</template>
