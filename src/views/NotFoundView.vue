<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh]">
    <span class="text-8xl mb-6">🔍</span>
    <h1 class="text-3xl font-bold text-gray-800 mb-2">
      页面不存在
    </h1>
    <p class="text-gray-500 mb-6">
      你访问的页面可能已被移除或不存在
    </p>
    <button
      class="btn-primary"
      @click="router.push('/')"
    >
      返回首页
    </button>
  </div>
</template>
