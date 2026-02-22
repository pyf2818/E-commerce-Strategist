<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAIStore } from '@/stores'

interface Props {
  collapsed: boolean
}

defineProps<Props>()

const route = useRoute()
const router = useRouter()
const aiStore = useAIStore()

interface NavItem {
  path: string
  name: string
  icon: string
  description: string
  gradient?: string
}

const navItems: NavItem[] = [
  { path: '/', name: '首页', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', description: '工作台概览', gradient: 'from-blue-500 to-cyan-400' },
  { path: '/content', name: '内容创作', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', description: 'AI内容生成', gradient: 'from-purple-500 to-pink-500' },
  { path: '/history', name: '历史记录', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', description: '内容管理', gradient: 'from-amber-500 to-orange-500' },
  { path: '/templates', name: '模板库', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z', description: '行业模板', gradient: 'from-emerald-500 to-teal-500' },
  { path: '/image-gen', name: 'AI绘图', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', description: '商品图片生成', gradient: 'from-rose-500 to-pink-500' },
  { path: '/video-gen', name: 'AI视频', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', description: '商品视频生成', gradient: 'from-violet-500 to-purple-500' },
  { path: '/ai-assistant', name: 'AI助手', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', description: '智能问答', gradient: 'from-indigo-500 to-violet-500' },
  { path: '/knowledge', name: '知识学院', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', description: '电商课程', gradient: 'from-sky-500 to-blue-500' },
  { path: '/tools', name: '工具箱', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', description: '实用工具', gradient: 'from-orange-500 to-red-500' },
  { path: '/settings', name: '设置', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', description: '系统配置', gradient: 'from-gray-500 to-slate-500' }
]

const isActive = (path: string) => {
  return route.path === path
}

const navigate = async (path: string) => {
  try {
    await router.push(path)
  } catch (error) {
    console.error('Navigation error:', error)
  }
}
</script>

<template>
  <aside 
    class="fixed left-0 top-0 h-full z-20 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-r border-gray-200/50 dark:border-gray-700/30"
    :class="collapsed ? 'w-20' : 'w-56'"
  >
    <!-- Logo -->
    <div 
      class="flex items-center h-18 px-4 border-b border-gray-200/50 dark:border-gray-700/30"
      :class="collapsed ? 'justify-center' : 'justify-between'"
    >
      <div
        v-if="!collapsed"
        class="flex items-center gap-3"
      >
        <!-- Logo 图标 -->
        <div class="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary-500/25 overflow-hidden group">
          <!-- 光晕效果 -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
          <!-- 图标 -->
          <svg
            class="w-6 h-6 text-white relative z-10"
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
        <div class="flex flex-col">
          <span class="font-bold text-lg bg-gradient-to-r from-primary-600 to-teal-600 dark:from-primary-400 dark:to-teal-400 bg-clip-text text-transparent">电商军师</span>
          <span class="text-xs text-gray-400 -mt-0.5">智能电商创作平台</span>
        </div>
      </div>
      <!-- 折叠状态下的Logo -->
      <div
        v-else
        class="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary-500/25 overflow-hidden"
      >
        <svg
          class="w-6 h-6 text-white"
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
    </div>

    <!-- 导航菜单 -->
    <nav class="p-3 space-y-1.5 overflow-y-auto h-[calc(100%-7.5rem)]">
      <button
        v-for="item in navItems"
        :key="item.path"
        class="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative"
        :class="isActive(item.path) 
          ? 'bg-gradient-to-r from-primary-500/10 to-teal-500/10 shadow-lg shadow-primary-500/10' 
          : 'hover:bg-white/60 dark:hover:bg-gray-800/60'"
        @click="navigate(item.path)"
      >
        <!-- 活跃指示器 -->
        <div 
          v-if="isActive(item.path)"
          class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-primary-500 to-teal-500 shadow-lg shadow-primary-500/50"
        />
        
        <!-- 图标 -->
        <div 
          class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 relative overflow-hidden"
          :class="isActive(item.path) 
            ? `bg-gradient-to-br ${item.gradient} shadow-lg` 
            : 'bg-gray-100 dark:bg-gray-800 group-hover:scale-110 group-hover:shadow-md'"
        >
          <!-- 图标背景闪烁 -->
          <div 
            v-if="isActive(item.path)"
            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" 
          />
          <svg 
            class="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-110" 
            :class="isActive(item.path) ? 'text-white' : 'text-gray-600 dark:text-gray-400'"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="item.icon"
            />
          </svg>
        </div>
        
        <!-- 文字 -->
        <span
          v-if="!collapsed"
          class="font-medium text-sm transition-colors truncate flex-1 text-left"
          :class="isActive(item.path) 
            ? 'text-primary-600 dark:text-primary-400 font-semibold' 
            : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200'"
        >{{ item.name }}</span>
        
        <!-- 折叠时的 tooltip -->
        <div 
          v-if="collapsed"
          class="absolute left-full ml-3 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-200 text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-2xl border border-gray-700/50"
        >
          {{ item.name }}
          <div class="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-900 dark:bg-gray-800 rotate-45 border-l border-b border-gray-700/50" />
        </div>
      </button>
    </nav>

    <!-- API 配置状态 -->
    <div 
      v-if="!collapsed"
      class="absolute bottom-4 left-3 right-3"
    >
      <div 
        class="p-4 rounded-2xl transition-all duration-300 border backdrop-blur-xl"
        :class="aiStore.isConfigured 
          ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20' 
          : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20'"
      >
        <div class="flex items-center gap-3">
          <!-- 状态指示器 -->
          <div class="relative">
            <div 
              class="w-3 h-3 rounded-full"
              :class="aiStore.isConfigured ? 'bg-emerald-500' : 'bg-amber-500'"
            />
            <div 
              v-if="aiStore.isConfigured"
              class="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-75"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <span
                class="text-sm font-medium truncate"
                :class="aiStore.isConfigured ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'"
              >
                {{ aiStore.isConfigured ? 'API 已连接' : '未配置 API' }}
              </span>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {{ aiStore.isConfigured ? aiStore.providerName : '点击配置 AI 服务' }}
            </div>
          </div>
        </div>
        <button 
          v-if="!aiStore.isConfigured"
          class="mt-3 w-full text-sm text-amber-600 dark:text-amber-400 hover:text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 py-2 rounded-xl transition-colors font-medium"
          @click="navigate('/settings')"
        >
          前往配置
        </button>
      </div>
    </div>
  </aside>
</template>
