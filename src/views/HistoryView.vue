<script setup lang="ts">
import { ref, computed } from 'vue'
import { useContentStore } from '@/stores'
import type { ContentType } from '@/types'

const contentStore = useContentStore()

// 搜索和筛选
const searchQuery = ref('')
const filterType = ref<ContentType | 'all'>('all')
const filterFavorite = ref(false)
const selectedIds = ref<Set<string>>(new Set())
const selectAll = ref(false)

// 内容类型名称
const contentTypeNames: Record<ContentType, string> = {
  'product-title': '商品标题',
  'product-desc': '商品描述',
  'short-video': '短视频脚本',
  'live-script': '直播话术',
  'marketing-copy': '营销文案',
  'customer-service': '客服话术',
  'social-media': '社媒文案'
}

// 检测内容是否有图片
const hasImage = (item: any): boolean => {
  return !!item.params?.imageUrl
}

// 检测内容是否有视频
const hasVideo = (item: any): boolean => {
  return !!item.params?.videoUrl
}

// 图片预览弹窗
const showImageModal = ref(false)
const selectedImageUrl = ref('')

const openImageModal = (url: string) => {
  selectedImageUrl.value = url
  showImageModal.value = true
}

const closeImageModal = () => {
  showImageModal.value = false
  selectedImageUrl.value = ''
}

// 筛选后的内容
const filteredContents = computed(() => {
  let result = [...contentStore.contents]

  // 搜索
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c => 
      c.title.toLowerCase().includes(query) ||
      c.content.toLowerCase().includes(query)
    )
  }

  // 类型筛选
  if (filterType.value !== 'all') {
    result = result.filter(c => c.type === filterType.value)
  }

  // 收藏筛选
  if (filterFavorite.value) {
    result = result.filter(c => contentStore.isFavorite(c.id))
  }

  // 按时间排序
  return result.sort((a, b) => b.createdAt - a.createdAt)
})

// 全选/取消全选
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedIds.value = new Set(filteredContents.value.map(c => c.id))
  } else {
    selectedIds.value = new Set()
  }
}

// 切换单个选择
const toggleSelect = (id: string) => {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
  selectAll.value = selectedIds.value.size === filteredContents.value.length
}

// 批量删除
const batchDelete = () => {
  if (selectedIds.value.size === 0) return
  
  if (confirm(`确定要删除选中的 ${selectedIds.value.size} 条记录吗？`)) {
    selectedIds.value.forEach(id => {
      contentStore.deleteContent(id)
    })
    selectedIds.value = new Set()
    selectAll.value = false
  }
}

// 批量收藏
const batchFavorite = () => {
  if (selectedIds.value.size === 0) return
  
  selectedIds.value.forEach(id => {
    if (!contentStore.isFavorite(id)) {
      contentStore.toggleFavorite(id)
    }
  })
}

// 导出选中内容
const exportSelected = (format: 'txt' | 'json' | 'csv') => {
  if (selectedIds.value.size === 0) return

  const selectedContents = filteredContents.value.filter(c => selectedIds.value.has(c.id))
  
  let content = ''
  let filename = ''
  let mimeType = ''

  if (format === 'txt') {
    content = selectedContents.map(c => 
      `【${contentTypeNames[c.type]}】${c.title}\n${'='.repeat(40)}\n${c.content}\n`
    ).join('\n\n')
    filename = `电商军师-导出-${Date.now()}.txt`
    mimeType = 'text/plain'
  } else if (format === 'json') {
    content = JSON.stringify(selectedContents, null, 2)
    filename = `电商军师-导出-${Date.now()}.json`
    mimeType = 'application/json'
  } else {
    // CSV
    const headers = ['类型', '标题', '内容', '平台', '创建时间']
    const rows = selectedContents.map(c => [
      contentTypeNames[c.type],
      c.title,
      `"${c.content.replace(/"/g, '""')}"`,
      c.platform,
      new Date(c.createdAt).toLocaleString()
    ])
    content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    filename = `电商军师-导出-${Date.now()}.csv`
    mimeType = 'text/csv'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// 导出单条内容
const exportContent = (id: string, format: 'txt' | 'json') => {
  const item = contentStore.getContentById(id)
  if (!item) return

  let content = ''
  let filename = ''
  let mimeType = ''

  if (format === 'txt') {
    content = `【${contentTypeNames[item.type]}】${item.title}\n${'='.repeat(40)}\n${item.content}`
    filename = `${item.title}.txt`
    mimeType = 'text/plain'
  } else {
    content = JSON.stringify(item, null, 2)
    filename = `${item.title}.json`
    mimeType = 'application/json'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// 复制内容
const copyContent = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    alert('已复制到剪贴板')
  } catch {
    alert('复制失败')
  }
}

// 删除单条
const deleteSingle = (id: string) => {
  if (confirm('确定要删除这条记录吗？')) {
    contentStore.deleteContent(id)
  }
}

// 格式化日期
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

// 清空所有
const clearAll = () => {
  if (confirm('确定要清空所有历史记录吗？此操作不可恢复！')) {
    contentStore.clearAll()
  }
}
</script>

<template>
  <div>
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- 顶部工具栏 -->
      <div class="card">
        <div class="flex flex-wrap items-center gap-4">
          <!-- 搜索 -->
          <div class="flex-1 min-w-[200px]">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索标题或内容..."
              class="input"
            >
          </div>

          <!-- 类型筛选 -->
          <select
            v-model="filterType"
            class="input w-auto"
          >
            <option value="all">
              全部类型
            </option>
            <option
              v-for="(name, type) in contentTypeNames"
              :key="type"
              :value="type"
            >
              {{ name }}
            </option>
          </select>

          <!-- 收藏筛选 -->
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="filterFavorite"
              type="checkbox"
              class="rounded"
            >
            <span class="text-sm text-gray-500 dark:text-gray-400">只看收藏</span>
          </label>

          <!-- 批量操作 -->
          <div class="flex gap-2">
            <button
              v-if="selectedIds.size > 0"
              class="btn bg-danger-500 text-white hover:bg-danger-600 text-sm"
              @click="batchDelete"
            >
              🗑️ 删除 ({{ selectedIds.size }})
            </button>
            <button
              v-if="selectedIds.size > 0"
              class="btn-secondary text-sm"
              @click="batchFavorite"
            >
              ⭐ 批量收藏
            </button>
            <div
              v-if="selectedIds.size > 0"
              class="relative group"
            >
              <button class="btn-secondary text-sm">
                📥 导出
              </button>
              <div class="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:block z-10">
                <button
                  class="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:bg-gray-700"
                  @click="exportSelected('txt')"
                >
                  TXT 格式
                </button>
                <button
                  class="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:bg-gray-700"
                  @click="exportSelected('json')"
                >
                  JSON 格式
                </button>
                <button
                  class="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:bg-gray-700"
                  @click="exportSelected('csv')"
                >
                  CSV 格式
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>共 {{ filteredContents.length }} 条记录</span>
        <button
          v-if="contentStore.contents.length > 0"
          class="text-danger-500 hover:text-danger-600"
          @click="clearAll"
        >
          清空全部
        </button>
      </div>

      <!-- 内容列表 -->
      <div
        v-if="filteredContents.length > 0"
        class="space-y-4"
      >
        <!-- 全选 -->
        <div class="card py-3">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="selectAll"
              type="checkbox"
              class="rounded"
              @change="toggleSelectAll"
            >
            <span class="text-sm text-gray-500 dark:text-gray-400">全选</span>
          </label>
        </div>

        <!-- 内容卡片 -->
        <div
          v-for="item in filteredContents"
          :key="item.id"
          class="card hover:shadow-md transition-shadow"
        >
          <div class="flex items-start gap-4">
            <!-- 选择框 -->
            <input
              :checked="selectedIds.has(item.id)"
              type="checkbox"
              class="rounded mt-1"
              @change="toggleSelect(item.id)"
            >

            <!-- 内容 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs rounded">
                  {{ contentTypeNames[item.type] }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(item.createdAt) }}</span>
                <span
                  v-if="contentStore.isFavorite(item.id)"
                  class="text-yellow-500"
                >⭐</span>
                <span
                  v-if="hasImage(item)"
                  class="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded"
                >🖼️ 图片</span>
                <span
                  v-if="hasVideo(item)"
                  class="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded"
                >🎬 视频</span>
              </div>
              <h3 class="font-medium text-gray-800 dark:text-gray-200 mb-2">
                {{ item.title }}
              </h3>
              <!-- 图片预览 -->
              <div
                v-if="hasImage(item)"
                class="mb-3"
              >
                <img
                  :src="item.params.imageUrl"
                  :alt="item.title"
                  class="max-w-xs max-h-32 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  @click="openImageModal(item.params.imageUrl)"
                >
              </div>
              <!-- 视频预览 -->
              <div
                v-if="hasVideo(item)"
                class="mb-3"
              >
                <video
                  :src="item.params.videoUrl"
                  class="max-w-xs max-h-32 rounded-lg"
                  controls
                />
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 whitespace-pre-wrap">
                {{ item.content.slice(0, 200) }}{{ item.content.length > 200 ? '...' : '' }}
              </p>
            </div>

            <!-- 操作按钮 -->
            <div class="flex flex-col gap-2">
              <button
                class="p-2 rounded-lg hover:bg-gray-100 dark:bg-gray-700 transition-colors"
                :title="contentStore.isFavorite(item.id) ? '取消收藏' : '收藏'"
                @click="contentStore.toggleFavorite(item.id)"
              >
                {{ contentStore.isFavorite(item.id) ? '⭐' : '☆' }}
              </button>
              <button
                class="p-2 rounded-lg hover:bg-gray-100 dark:bg-gray-700 transition-colors"
                title="复制"
                @click="copyContent(item.content)"
              >
                📋
              </button>
              <div class="relative group">
                <button
                  class="p-2 rounded-lg hover:bg-gray-100 dark:bg-gray-700 transition-colors"
                  title="导出"
                >
                  📥
                </button>
                <div class="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:block z-10">
                  <button
                    class="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:bg-gray-700"
                    @click="exportContent(item.id, 'txt')"
                  >
                    TXT 格式
                  </button>
                  <button
                    class="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:bg-gray-700"
                    @click="exportContent(item.id, 'json')"
                  >
                    JSON 格式
                  </button>
                </div>
              </div>
              <button
                class="p-2 rounded-lg hover:bg-danger-100 dark:bg-danger-900/30 transition-colors text-danger-500"
                title="删除"
                @click="deleteSingle(item.id)"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-else
        class="card text-center py-12"
      >
        <span class="text-6xl">📭</span>
        <p class="mt-4 text-gray-500 dark:text-gray-400">
          {{ searchQuery || filterType !== 'all' || filterFavorite ? '没有找到匹配的内容' : '暂无历史记录，快去创作吧！' }}
        </p>
      </div>

      <!-- 图片预览弹窗 -->
      <div
        v-if="showImageModal && selectedImageUrl"
        class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
        @click="closeImageModal"
      >
        <div
          class="relative max-w-[90vw] max-h-[90vh]"
          @click.stop
        >
          <img
            :src="selectedImageUrl"
            alt="预览图片"
            class="max-w-full max-h-[85vh] object-contain rounded-lg"
          >
          <button
            class="absolute top-2 right-2 text-white text-2xl bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70"
            @click="closeImageModal"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
