<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAIStore } from '@/stores'
import type { ModelType } from '@/types'
import { PROVIDER_NAMES } from '@/types'

interface Props {
  modelType: ModelType
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true,
  size: 'md'
})

const router = useRouter()
const aiStore = useAIStore()

// 下拉菜单状态
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// 获取当前模型配置
const currentConfig = computed(() => {
  return aiStore.config[props.modelType]
})

// 当前选中的显示名称
const currentModelName = computed(() => {
  const config = currentConfig.value
  if (!config.apiKey) return '未配置'
  return `${PROVIDER_NAMES[config.provider]} - ${config.model}`
})

// 是否已配置
const isConfigured = computed(() => {
  return !!currentConfig.value.apiKey
})

// 尺寸样式
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'text-xs px-2 py-1'
    case 'lg': return 'text-base px-4 py-3'
    default: return 'text-sm px-3 py-2'
  }
})

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 切换到设置页面
const goToSettings = () => {
  isOpen.value = false
  router.push('/settings')
}

// 切换下拉
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div
    ref="dropdownRef"
    class="relative"
  >
    <!-- 触发按钮 -->
    <button
      class="flex items-center gap-2 rounded-lg border transition-all"
      :class="[
        sizeClasses,
        isOpen 
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800',
        !isConfigured && 'border-warning-300 dark:border-warning-700 bg-warning-50 dark:bg-warning-900/20'
      ]"
      @click.stop="toggleDropdown"
    >
      <!-- 图标 -->
      <span class="text-base">
        <template v-if="modelType === 'text'">📝</template>
        <template v-else-if="modelType === 'image'">🎨</template>
        <template v-else>🎬</template>
      </span>
      
      <!-- 标签 -->
      <span
        v-if="showLabel"
        class="text-gray-500 dark:text-gray-400"
      >
        {{ modelType === 'text' ? '文本模型' : modelType === 'image' ? '图像模型' : '视频模型' }}:
      </span>
      
      <!-- 当前模型名称 -->
      <span 
        class="font-medium truncate max-w-[200px]"
        :class="isConfigured ? 'text-gray-800 dark:text-gray-200' : 'text-warning-700 dark:text-warning-400'"
      >
        {{ currentModelName }}
      </span>
      
      <!-- 状态指示 -->
      <span
        v-if="isConfigured"
        class="w-2 h-2 rounded-full bg-success-500"
      />
      <span
        v-else
        class="w-2 h-2 rounded-full bg-warning-500"
      />
      
      <!-- 下拉箭头 -->
      <svg 
        class="w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform"
        :class="isOpen && 'rotate-180'"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
    
    <!-- 下拉菜单 -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 mt-2 w-72 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden"
      >
        <!-- 当前配置 -->
        <div class="p-3 border-b border-gray-200 dark:border-gray-700">
          <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">
            当前配置
          </div>
          <div
            v-if="isConfigured"
            class="flex items-center gap-2 p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20"
          >
            <span class="text-lg">
              {{ modelType === 'text' ? '📝' : modelType === 'image' ? '🎨' : '🎬' }}
            </span>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                {{ PROVIDER_NAMES[currentConfig.provider] }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ currentConfig.model }}
              </div>
            </div>
            <span class="text-success-500 text-sm">✓</span>
          </div>
          <div
            v-else
            class="flex items-center gap-2 p-2 rounded-lg bg-warning-50 dark:bg-warning-900/20"
          >
            <span class="text-lg">⚠️</span>
            <div class="flex-1">
              <div class="text-sm text-warning-700 dark:text-warning-400">
                尚未配置模型
              </div>
              <div class="text-xs text-warning-600 dark:text-warning-500">
                请先配置 API Key
              </div>
            </div>
          </div>
        </div>
        
        <!-- 快捷操作 -->
        <div class="p-2">
          <button
            class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:bg-gray-700 transition-colors text-left"
            @click="goToSettings"
          >
            <span>⚙️</span>
            <span class="text-gray-700 dark:text-gray-300">配置模型设置</span>
            <span class="ml-auto text-gray-500 dark:text-gray-400">→</span>
          </button>
        </div>
        
        <!-- 提示信息 -->
        <div class="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            💡 在设置页面可以配置不同的 AI 模型，配置后可在此快速切换
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>
