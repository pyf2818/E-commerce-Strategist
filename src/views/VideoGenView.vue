<script setup lang="ts">
import { ref } from 'vue'
import { useAIStore, useContentStore } from '@/stores'
import ModelSelector from '@/components/common/ModelSelector.vue'

const aiStore = useAIStore()
const contentStore = useContentStore()

// 视频生成表单
const prompt = ref('')
const style = ref('product')
const duration = ref(5)
const resolution = ref('720p')
const isGenerating = ref(false)
const error = ref('')

// 风格选项
const styleOptions = [
  { value: 'product', label: '商品展示', icon: '🛍️' },
  { value: 'lifestyle', label: '生活场景', icon: '🏠' },
  { value: 'promotional', label: '促销广告', icon: '📢' },
  { value: 'tutorial', label: '使用教程', icon: '📚' },
  { value: 'story', label: '品牌故事', icon: '📖' },
  { value: 'creative', label: '创意短片', icon: '🎨' }
]

// 时长选项
const durationOptions = [
  { value: 3, label: '3秒' },
  { value: 5, label: '5秒' },
  { value: 10, label: '10秒' }
]

// 分辨率选项
const resolutionOptions = [
  { value: '480p', label: '480p' },
  { value: '720p', label: '720p' },
  { value: '1080p', label: '1080p' }
]

// 示例提示词
const examplePrompts = [
  { category: '商品展示', prompts: ['无线耳机产品展示，旋转展示，科技感背景', '护肤品瓶身特写，自然光线，清新风格'] },
  { category: '生活场景', prompts: ['咖啡机使用场景，温馨厨房，晨光氛围', '运动鞋街头展示，动感十足，时尚风格'] },
  { category: '促销广告', prompts: ['双11大促，红包雨动画，热情洋溢', '新品上市，震撼登场，高级质感'] }
]

// 生成历史
const generatedVideos = ref<Array<{
  id: string
  prompt: string
  style: string
  duration: number
  resolution: string
  videoUrl: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: number
}>>([])

// 生成视频
const generateVideo = async () => {
  if (!aiStore.isVideoEnabled) {
    error.value = '请先在设置页面配置视频生成模型的 API Key'
    return
  }

  if (!prompt.value.trim()) {
    error.value = '请输入视频描述'
    return
  }

  isGenerating.value = true
  error.value = ''

  const originalPrompt = prompt.value
  let optimizedPrompt = originalPrompt

  try {
    // 使用文本模型优化视频提示词
    if (aiStore.isTextEnabled) {
      const textService = aiStore.getTextService()
      const optimizeResult = await textService.chat([
        { role: 'user', content: `请将以下商品视频描述优化为英文的 AI 视频生成提示词，要求：
1. 添加专业的视频拍摄关键词（如：cinematic, smooth camera movement, professional lighting）
2. 描述镜头运动和场景转换
3. 风格：${styleOptions.find(s => s.value === style.value)?.label}
4. 时长：${duration.value}秒
5. 控制在 80 词以内，直接输出英文提示词，不要解释

视频描述：${originalPrompt}` }
      ], '你是一位专业的视频导演和 AI 视频生成提示词专家。只输出优化后的英文提示词。')

      if (optimizeResult.success && optimizeResult.content) {
        optimizedPrompt = optimizeResult.content
      }
    }

    // 使用视频服务生成视频
    const videoService = aiStore.getVideoService()
    const videoResult = await videoService.generateVideo(optimizedPrompt)

    let videoUrl = ''
    let status: 'pending' | 'completed' | 'failed' = 'completed'
    
    if (videoResult.success && videoResult.videoUrl) {
      videoUrl = videoResult.videoUrl
    } else {
      status = 'failed'
      error.value = videoResult.error || '视频生成失败，请检查 API 配置'
    }
    
    // 添加到历史记录
    const newVideo = {
      id: `video-${Date.now()}`,
      prompt: originalPrompt,
      style: style.value,
      duration: duration.value,
      resolution: resolution.value,
      videoUrl,
      status,
      createdAt: Date.now()
    }
    generatedVideos.value.unshift(newVideo)
    
    // 保存到历史记录
    if (videoUrl) {
      contentStore.addContent({
        type: 'short-video',
        platform: 'other',
        title: originalPrompt.slice(0, 50) + (originalPrompt.length > 50 ? '...' : ''),
        content: `视频链接: ${videoUrl}\n\n**描述**: ${originalPrompt}\n\n**风格**: ${styleOptions.find(s => s.value === style.value)?.label}\n**时长**: ${duration.value}秒\n**分辨率**: ${resolution.value}`,
        params: { 
          prompt: originalPrompt, 
          optimizedPrompt, 
          style: style.value, 
          duration: String(duration.value),
          resolution: resolution.value,
          videoUrl 
        }
      })
    }

    prompt.value = ''
  } catch (e) {
    error.value = e instanceof Error ? e.message : '视频生成失败'
  } finally {
    isGenerating.value = false
  }
}

// 使用示例
const useExample = (text: string) => {
  prompt.value = text
}

// 下载视频
const downloadVideo = async (videoUrl: string) => {
  try {
    window.open(videoUrl, '_blank')
  } catch {
    window.open(videoUrl, '_blank')
  }
}



// 删除视频
const deleteVideo = (id: string) => {
  const index = generatedVideos.value.findIndex(v => v.id === id)
  if (index > -1) {
    generatedVideos.value.splice(index, 1)
  }
}

// 清空历史
const clearHistory = () => {
  if (confirm('确定要清空所有生成历史吗？')) {
    generatedVideos.value = []
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- 顶部工具栏 -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">
        AI 视频生成
      </h2>
      <ModelSelector
        model-type="video"
        :show-label="true"
        size="md"
      />
    </div>
    
    <!-- 生成表单 -->
    <div class="card">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">
        视频描述与设置
      </h3>
      
      <!-- 提示词输入 -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          视频描述
        </label>
        <textarea
          v-model="prompt"
          rows="3"
          placeholder="描述你想要生成的视频内容，例如：一款无线耳机的产品展示视频，旋转展示产品细节，科技感背景..."
          class="input"
        />
      </div>

      <!-- 风格选择 -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          视频风格
        </label>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <button
            v-for="option in styleOptions"
            :key="option.value"
            class="p-3 rounded-xl border-2 text-center transition-all"
            :class="style === option.value
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'"
            @click="style = option.value"
          >
            <span class="text-2xl">{{ option.icon }}</span>
            <div class="text-xs mt-1">
              {{ option.label }}
            </div>
          </button>
        </div>
      </div>

      <!-- 时长和分辨率 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            视频时长
          </label>
          <div class="flex gap-3">
            <button
              v-for="option in durationOptions"
              :key="option.value"
              class="flex-1 px-4 py-2 rounded-lg border-2 text-sm transition-all"
              :class="duration === option.value
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'"
              @click="duration = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            视频分辨率
          </label>
          <div class="flex gap-3">
            <button
              v-for="option in resolutionOptions"
              :key="option.value"
              class="flex-1 px-4 py-2 rounded-lg border-2 text-sm transition-all"
              :class="resolution === option.value
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'"
              @click="resolution = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- 生成按钮 -->
      <button
        :disabled="isGenerating || !aiStore.isVideoEnabled"
        class="btn-primary w-full py-3"
        @click="generateVideo"
      >
        {{ isGenerating ? '🎬 生成中...' : '🎬 生成视频' }}
      </button>

      <!-- 错误提示 -->
      <div
        v-if="error"
        class="mt-4 p-4 bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 rounded-lg"
      >
        {{ error }}
      </div>
    </div>

    <!-- 示例提示词 -->
    <div class="card">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        示例提示词
      </h3>
      <div class="space-y-4">
        <div
          v-for="example in examplePrompts"
          :key="example.category"
        >
          <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            {{ example.category }}
          </h4>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(text, index) in example.prompts"
              :key="index"
              class="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
              @click="useExample(text)"
            >
              {{ text }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 生成历史 -->
    <div
      v-if="generatedVideos.length > 0"
      class="card"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
          生成历史
        </h3>
        <button
          class="text-sm text-danger-500 hover:text-danger-600"
          @click="clearHistory"
        >
          清空历史
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="video in generatedVideos"
          :key="video.id"
          class="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
        >
          <!-- 视频预览区域 -->
          <div class="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <video 
              v-if="video.videoUrl && video.status === 'completed'"
              :src="video.videoUrl"
              class="w-full h-full object-cover"
              controls
            />
            <div
              v-else
              class="text-center text-gray-400"
            >
              <span class="text-4xl">🎬</span>
              <p class="mt-2 text-sm">
                {{ video.status === 'failed' ? '生成失败' : '处理中...' }}
              </p>
            </div>
          </div>
          
          <div class="p-3">
            <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
              {{ video.prompt }}
            </p>
            <div class="flex items-center justify-between text-xs text-gray-400">
              <span>{{ video.duration }}秒 · {{ video.resolution }}</span>
              <div class="flex gap-2">
                <button
                  v-if="video.videoUrl"
                  class="text-primary-500 hover:text-primary-600"
                  @click="downloadVideo(video.videoUrl)"
                >
                  下载
                </button>
                <button
                  class="text-danger-500 hover:text-danger-600"
                  @click="deleteVideo(video.id)"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="card bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
      <h3 class="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-3">
        📖 使用说明
      </h3>
      <div class="text-sm text-purple-700 dark:text-purple-400 space-y-2">
        <p>1. <strong>描述视频</strong>：详细描述你想要生成的视频内容，包括场景、动作、风格</p>
        <p>2. <strong>选择风格</strong>：根据用途选择合适的视频风格</p>
        <p>3. <strong>设置参数</strong>：选择视频时长和分辨率</p>
        <p>4. <strong>生成视频</strong>：AI 会自动优化提示词并生成视频</p>
      </div>
      <div class="mt-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-sm text-purple-700 dark:text-purple-400">
        💡 <strong>提示</strong>：视频生成需要较长时间（通常 30 秒到 2 分钟），请耐心等待。目前支持智谱 CogVideoX 和通义万相视频模型。
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
