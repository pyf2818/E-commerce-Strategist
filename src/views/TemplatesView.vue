<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAIStore } from '@/stores'
import { logger } from '@/utils/logger'

const router = useRouter()
const aiStore = useAIStore()

const USER_TEMPLATES_KEY = 'user-templates'

interface UserTemplate {
  id: string
  name: string
  contentType: string
  platform: string
  fields: Record<string, string>
  createdAt: number
}

const userTemplates = ref<UserTemplate[]>([])

const loadUserTemplates = () => {
  try {
    const stored = localStorage.getItem(USER_TEMPLATES_KEY)
    if (stored) {
      userTemplates.value = JSON.parse(stored)
    }
  } catch (e) {
    logger.error('加载用户模板失败:', e)
  }
}

const deleteUserTemplate = (id: string) => {
  if (!confirm('确定要删除这个模板吗？')) return
  userTemplates.value = userTemplates.value.filter(t => t.id !== id)
  localStorage.setItem(USER_TEMPLATES_KEY, JSON.stringify(userTemplates.value))
}

const useUserTemplate = (template: UserTemplate) => {
  if (!aiStore.isConfigured) {
    alert('请先在设置页面配置 AI API')
    router.push('/settings')
    return
  }
  router.push({
    path: '/content',
    query: { templateData: encodeURIComponent(JSON.stringify(template)) }
  })
}

onMounted(() => {
  loadUserTemplates()
})
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
          我的模板
        </h2>
        <span class="text-sm text-gray-500">
          共 {{ userTemplates.length }} 个模板
        </span>
      </div>

      <div
        v-if="userTemplates.length === 0"
        class="text-center py-12"
      >
        <span class="text-6xl">📭</span>
        <p class="mt-4 text-gray-500 dark:text-gray-400">
          暂无保存的模板<br>
          <span class="text-sm">在内容创作页面填写信息后，点击 💾 按钮保存为模板</span>
        </p>
      </div>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div
          v-for="template in userTemplates"
          :key="template.id"
          class="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
          @click="useUserTemplate(template)"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-gray-800 dark:text-gray-200">{{ template.name }}</span>
            <button
              class="text-gray-400 hover:text-danger-500 p-1"
              title="删除模板"
              @click.stop="deleteUserTemplate(template.id)"
            >
              🗑️
            </button>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ template.contentType }} | {{ template.platform }}
          </p>
          <div class="mt-3 text-xs text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
            点击使用 →
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        批量生成
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        一键为多个商品生成标题或描述，大幅提升效率
      </p>
    </div>
  </div>
</template>
