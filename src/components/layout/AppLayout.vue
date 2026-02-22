<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

const sidebarCollapsed = ref(false)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <div class="min-h-screen relative">
    <!-- 动态背景 -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <!-- 主背景渐变 -->
      <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900" />
      
      <!-- 浅色模式 - 樱花元素 -->
      
      <!-- 深色模式 - 流星效果 -->
      <div class="block dark:hidden">
        <!-- 樱花元素 -->
        <div class="absolute top-20 left-10 w-3 h-3 bg-pink-300 rounded-full animate-falling" style="animation-delay: 0s;" />
        <div class="absolute top-40 right-20 w-2 h-2 bg-pink-400 rounded-full animate-falling" style="animation-delay: 1s;" />
        <div class="absolute bottom-40 left-30 w-3 h-3 bg-pink-200 rounded-full animate-falling" style="animation-delay: 2s;" />
        <div class="absolute top-60 right-40 w-2 h-2 bg-pink-300 rounded-full animate-falling" style="animation-delay: 3s;" />
        <div class="absolute bottom-20 right-60 w-3 h-3 bg-pink-400 rounded-full animate-falling" style="animation-delay: 4s;" />
        <div class="absolute top-80 left-40 w-2 h-2 bg-pink-200 rounded-full animate-falling" style="animation-delay: 5s;" />
        <div class="absolute bottom-60 right-30 w-3 h-3 bg-pink-300 rounded-full animate-falling" style="animation-delay: 6s;" />
        <div class="absolute top-30 left-60 w-2 h-2 bg-pink-400 rounded-full animate-falling" style="animation-delay: 7s;" />
      </div>
      
      <!-- 网格纹理 -->
      <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" 
        style="background-image: linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px); background-size: 50px 50px;" 
      />
    </div>
    
    <!-- 侧边栏 -->
    <AppSidebar
      :collapsed="sidebarCollapsed"
      @toggle="toggleSidebar"
    />
    
    <!-- 主内容区 -->
    <div 
      class="relative transition-all duration-300"
      :class="sidebarCollapsed ? 'ml-20' : 'ml-56'"
    >
      <!-- 顶部导航 -->
      <AppHeader
        :sidebar-collapsed="sidebarCollapsed"
        @toggle-sidebar="toggleSidebar"
      />
      
      <!-- 页面内容 -->
      <main class="p-6 min-h-[calc(100vh-4rem)]">
        <slot />
      </main>
      
      <!-- 底部版权栏 -->
      <footer class="py-4 text-center text-sm text-gray-400 dark:text-gray-500 border-t border-gray-200/50 dark:border-gray-700/30 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div class="space-y-1">
          <p>版权所有 © 2026 电商军师. All rights reserved.</p>
          <p class="flex items-center justify-center gap-4">
            <a href="mailto:2818932783@qq.com" class="hover:text-primary-500 dark:hover:text-primary-400 transition-colors">邮箱: 2818932783@qq.com</a>
            <span>|</span>
            <span>微信: anlan_0725</span>
          </p>
        </div>
      </footer>
    </div>
  </div>
</template>
