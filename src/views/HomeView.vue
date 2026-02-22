<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAIStore, useContentStore } from '@/stores'

const router = useRouter()
const aiStore = useAIStore()
const contentStore = useContentStore()

const stats = computed(() => [
  { label: '创作内容', value: contentStore.contents.length, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'from-blue-500 to-cyan-400' },
  { label: '收藏数量', value: contentStore.favorites.size, icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', color: 'from-amber-500 to-orange-400' },
  { label: 'API 状态', value: aiStore.isConfigured ? '已配置' : '未配置', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', color: aiStore.isConfigured ? 'from-green-500 to-emerald-400' : 'from-gray-400 to-gray-500' }
])

const quickActions = [
  { title: '商品标题', desc: '生成吸引人的商品标题', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', path: '/content?type=product-title', gradient: 'from-pink-500 to-rose-500', iconBg: 'bg-pink-500' },
  { title: '短视频脚本', desc: '创作爆款短视频脚本', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', path: '/content?type=short-video', gradient: 'from-purple-500 to-violet-500', iconBg: 'bg-purple-500' },
  { title: '直播话术', desc: '专业的直播带货话术', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z', path: '/content?type=live-script', gradient: 'from-blue-500 to-indigo-500', iconBg: 'bg-blue-500' },
  { title: '商品描述', desc: '详情页文案生成', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', path: '/content?type=product-desc', gradient: 'from-cyan-500 to-teal-500', iconBg: 'bg-cyan-500' },
  { title: '营销文案', desc: '活动促销文案', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z', path: '/content?type=marketing-copy', gradient: 'from-orange-500 to-amber-500', iconBg: 'bg-orange-500' },
  { title: 'AI 问答', desc: '智能解决运营问题', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', path: '/ai-assistant', gradient: 'from-emerald-500 to-green-500', iconBg: 'bg-emerald-500' }
]

const recentContents = computed(() => contentStore.recentContents.slice(0, 5))

const getContentTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    'product-title': 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    'short-video': 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    'live-script': 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
    'product-desc': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    'marketing-copy': 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
    'customer-service': 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
    'social-media': 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
  }
  return icons[type] || 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
}
</script>

<template>
  <div class="space-y-8 relative">
    <!-- Hero 欢迎横幅 - 高级渐变设计 -->
    <div class="relative overflow-hidden rounded-3xl">
      <!-- 多层渐变背景 -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary-600 via-teal-600 to-emerald-700" />
      <div class="absolute inset-0 bg-gradient-to-tl from-cyan-500/20 via-transparent to-transparent" />
      
      <!-- 装饰性网格 -->
      <div 
        class="absolute inset-0 opacity-10"
        style="background-image: linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px); background-size: 40px 40px;" 
      />
      
      <!-- 浮动装饰圆 -->
      <div class="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-floating" />
      <div class="absolute -bottom-16 -left-16 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl animate-floating floating-delay-1" />
      <div class="absolute top-1/2 right-1/4 w-32 h-32 bg-cyan-300/15 rounded-full blur-2xl animate-breathing" />
      
      <!-- 装饰线条 -->
      <div class="absolute top-0 right-0 w-64 h-64 overflow-hidden">
        <div class="absolute top-8 right-8 w-px h-32 bg-white/20 rotate-45" />
        <div class="absolute top-8 right-8 w-px h-24 bg-white/10 rotate-45" />
      </div>
      
      <!-- 内容 -->
      <div class="relative px-8 py-10 md:px-12 md:py-14">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm mb-6 animate-slide-up">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI 驱动 · 智能创作
          </div>
          
          <h1 class="text-3xl md:text-5xl font-bold text-white mb-4 animate-slide-up animation-delay-100 leading-tight">
            欢迎使用 <span class="bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 via-cyan-200 to-white">电商军师</span>
            <span class="inline-block ml-2">👋</span>
          </h1>
          
          <p class="text-lg md:text-xl text-white/80 mb-8 max-w-xl animate-slide-up animation-delay-200 leading-relaxed">
            一站式电商内容创作与知识学习平台，AI 驱动，助你轻松搞定电商运营
          </p>
          
          <div class="flex flex-wrap gap-4 animate-slide-up animation-delay-300">
            <router-link
              to="/content"
              class="group relative px-7 py-3.5 bg-white text-primary-700 rounded-xl font-semibold hover:bg-white/95 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/25"
            >
              <span class="relative flex items-center gap-2">
                <svg
                  class="w-5 h-5"
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
                开始创作
                <svg
                  class="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </router-link>
            
            <router-link
              to="/knowledge"
              class="group px-7 py-3.5 bg-white/10 text-white rounded-xl font-semibold backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <span class="flex items-center gap-2">
                <svg
                  class="w-5 h-5"
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
                学习中心
              </span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 - 玻璃拟态设计 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div 
        v-for="(stat, index) in stats" 
        :key="stat.label"
        class="card-glass group stagger-item relative overflow-hidden"
        :style="{ animationDelay: `${index * 100}ms` }"
      >
        <!-- 背景渐变 -->
        <div 
          class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          :class="`bg-gradient-to-br ${stat.color}`"
          style="opacity: 0.05;"
        />
        
        <!-- 装饰 -->
        <div
          class="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-500"
          :class="`bg-gradient-to-br ${stat.color}`"
        />
        
        <div class="relative flex items-center gap-5">
          <div 
            class="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
            :class="`bg-gradient-to-br ${stat.color}`"
          >
            <svg
              class="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="stat.icon"
              />
            </svg>
          </div>
          <div>
            <div
              class="text-3xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r transition-all duration-300"
              :class="`bg-gradient-to-r ${stat.color}`"
            >
              {{ stat.value }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- API 配置提示 - 优雅警告卡片 -->
    <div 
      v-if="!aiStore.isConfigured"
      class="relative overflow-hidden rounded-2xl animate-slide-up"
    >
      <!-- 背景 -->
      <div class="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />
      
      <div class="relative p-6 md:p-8">
        <div class="flex items-start gap-6">
          <!-- 图标 -->
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/25 animate-floating">
              <svg
                class="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg">
              <div class="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
          </div>
          
          <div class="flex-1">
            <h3 class="font-bold text-xl text-amber-800 dark:text-amber-300 mb-2">
              请先配置 AI API
            </h3>
            <p class="text-amber-700/80 dark:text-amber-400/80 mb-5 leading-relaxed">
              为了使用内容创作和 AI 问答功能，你需要配置自己的大模型 API Key。
              支持 OpenAI、智谱 AI、通义千问等平台。
            </p>
            <router-link
              to="/settings"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-xl hover:shadow-amber-500/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              前往配置
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷入口 - 高级卡片设计 -->
    <div>
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-1 h-8 rounded-full bg-gradient-to-b from-primary-500 to-teal-500" />
          <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
            快捷创作
          </h2>
        </div>
        <router-link 
          to="/content" 
          class="group flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          查看全部
          <svg
            class="w-4 h-4 transition-transform group-hover:translate-x-1"
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
        </router-link>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="(action, index) in quickActions"
          :key="action.title"
          class="card-hover group relative overflow-hidden stagger-item"
          :style="{ animationDelay: `${index * 80}ms` }"
        >
          <!-- 悬停渐变背景 -->
          <div 
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            :class="`bg-gradient-to-br ${action.gradient}`"
          />
          
          <!-- 装饰 -->
          <div class="absolute -right-12 -top-12 w-40 h-40 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-white" />
          
          <div class="relative flex items-start gap-4">
            <div 
              class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
              :class="action.gradient"
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
                  :d="action.icon"
                />
              </svg>
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-white dark:group-hover:text-white transition-colors duration-300">
                {{ action.title }}
              </h4>
              <p class="text-sm text-gray-500 dark:text-gray-400 group-hover:text-white/80 dark:group-hover:text-white/80 mt-1 transition-colors duration-300">
                {{ action.desc }}
              </p>
            </div>
            <div class="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <svg
                class="w-5 h-5 text-white"
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
    </div>

    <!-- 最近创作 - 时间线设计 -->
    <div v-if="recentContents.length > 0">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-1 h-8 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
          <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
            最近创作
          </h2>
        </div>
        <router-link 
          to="/history" 
          class="group flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          查看历史
          <svg
            class="w-4 h-4 transition-transform group-hover:translate-x-1"
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
        </router-link>
      </div>
      
      <div class="space-y-4">
        <div
          v-for="(content, index) in recentContents"
          :key="content.id"
          class="card-hover flex items-center justify-between group stagger-item"
          :style="{ animationDelay: `${index * 60}ms` }"
        >
          <div class="flex items-center gap-5">
            <!-- 图标 -->
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg
                class="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="getContentTypeIcon(content.type)"
                />
              </svg>
            </div>
            
            <!-- 内容 -->
            <div>
              <h4 class="font-medium text-gray-800 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {{ content.title }}
              </h4>
              <div class="flex items-center gap-3 mt-1">
                <span class="text-xs text-gray-400">
                  {{ new Date(content.createdAt).toLocaleString('zh-CN') }}
                </span>
                <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span class="text-xs text-gray-500 capitalize">
                  {{ content.type.replace('-', ' ') }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <button
            class="group/btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all duration-300 opacity-0 group-hover:opacity-100"
            @click.stop="router.push(`/content?id=${content.id}`)"
          >
            <span>查看</span>
            <svg
              class="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
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
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
