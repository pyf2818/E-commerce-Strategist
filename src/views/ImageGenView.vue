<script setup lang="ts">
import { ref } from 'vue'
import { useAIStore, useContentStore } from '@/stores'
import ModelSelector from '@/components/common/ModelSelector.vue'
import { logger } from '@/utils/logger'

const aiStore = useAIStore()
const contentStore = useContentStore()

// 图片生成表单
const prompt = ref('')
const style = ref('realistic')
const size = ref('1024x1024')
const isGenerating = ref(false)
const error = ref('')

// 风格选项
const styleOptions = [
  { value: 'realistic', label: '真实照片', icon: '📷' },
  { value: 'product', label: '商品展示', icon: '🛍️' },
  { value: 'lifestyle', label: '生活场景', icon: '🏠' },
  { value: 'minimal', label: '简约白底', icon: '⬜' },
  { value: 'artistic', label: '艺术风格', icon: '🎨' },
  { value: '3d', label: '3D渲染', icon: '🎮' }
]

// 尺寸选项
const sizeOptions = [
  { value: '512x512', label: '512×512' },
  { value: '1024x1024', label: '1024×1024' },
  { value: '1024x768', label: '1024×768 (横版)' },
  { value: '768x1024', label: '768×1024 (竖版)' }
]

// 示例提示词
const examplePrompts = [
  { category: '美妆护肤', prompts: ['精致口红特写，金色包装，大理石背景', '护肤精华液瓶身，自然光线，清新风格'] },
  { category: '数码电子', prompts: ['无线耳机展示，科技感背景，蓝色灯光', '智能手表特写，商务风格，简约背景'] },
  { category: '服饰鞋包', prompts: ['时尚运动鞋，白色背景，产品摄影', '真皮手提包，柔和灯光，高级质感'] },
  { category: '食品生鲜', prompts: ['新鲜水果拼盘，自然光线，健康活力', '精美蛋糕，甜品摄影，温馨氛围'] }
]

// 生成历史
const generatedImages = ref<Array<{
  id: string
  prompt: string
  style: string
  imageUrl: string
  createdAt: number
}>>([])

// 图片预览弹窗
const showImageModal = ref(false)
const selectedImage = ref<{ imageUrl: string; prompt: string } | null>(null)

// 打开图片预览
const openImageModal = (img: { imageUrl: string; prompt: string }) => {
  selectedImage.value = img
  showImageModal.value = true
}

// 关闭图片预览
const closeImageModal = () => {
  showImageModal.value = false
  selectedImage.value = null
}

// 生成图片
const generateImage = async () => {
  // 检查是否配置了图像模型
  if (!aiStore.isImageEnabled) {
    error.value = '请先在设置页面配置图像生成模型的 API Key'
    return
  }

  if (!prompt.value.trim()) {
    error.value = '请输入图片描述'
    return
  }

  isGenerating.value = true
  error.value = ''

  const originalPrompt = prompt.value
  let optimizedPrompt = originalPrompt

  try {
    // 使用文本模型优化图片提示词
    if (aiStore.isTextEnabled) {
      const textService = aiStore.getTextService()
      const optimizeResult = await textService.chat([
        { role: 'user', content: `请将以下商品图片描述优化为英文的 AI 绘图提示词，要求：
1. 添加专业的产品摄影关键词（如：professional product photography, studio lighting, high detail）
2. 包含光线、角度、背景描述
3. 风格：${styleOptions.find(s => s.value === style.value)?.label}
4. 控制在 100 词以内，直接输出英文提示词，不要解释

商品描述：${originalPrompt}` }
      ], '你是一位专业的产品摄影师和 AI 绘图提示词专家。只输出优化后的英文提示词。')

      if (optimizeResult.success && optimizeResult.content) {
        optimizedPrompt = optimizeResult.content
      }
    }

    // 使用图像服务生成图片
    const imageService = aiStore.getImageService()
    
    // 调试：显示当前配置
    logger.debug('图像生成配置:', {
      provider: aiStore.config.image.provider,
      model: aiStore.config.image.model,
      baseUrl: aiStore.config.image.baseUrl,
      hasApiKey: !!aiStore.config.image.apiKey
    })
    
    const imageResult = await imageService.generateImage(optimizedPrompt)

    let imageUrl = ''
    
    if (imageResult.success && imageResult.imageUrl) {
      imageUrl = imageResult.imageUrl
      error.value = ''  // 清除错误
    } else {
      // 如果失败，显示错误信息而不是使用占位图
      const errorMsg = imageResult.error || '图片生成失败，请检查配置'
      error.value = errorMsg
      // 不再使用占位图，让用户知道出错了
      return
    }
    
    // 添加到本地显示列表
    const newImage = {
      id: `img-${Date.now()}`,
      prompt: originalPrompt,
      style: style.value,
      imageUrl,
      createdAt: Date.now()
    }
    generatedImages.value.unshift(newImage)
    
    // 保存到历史记录（使用 contentStore）
    contentStore.addContent({
      type: 'social-media', // 使用 social-media 类型来标记图像生成
      platform: 'other',
      title: originalPrompt.slice(0, 50) + (originalPrompt.length > 50 ? '...' : ''),
      content: `![生成的图片](${imageUrl})\n\n**原始描述**: ${originalPrompt}\n\n**风格**: ${styleOptions.find(s => s.value === style.value)?.label}`,
      params: { 
        prompt: originalPrompt, 
        optimizedPrompt, 
        style: style.value, 
        size: size.value,
        imageUrl 
      }
    })

    prompt.value = ''
  } catch (e) {
    error.value = e instanceof Error ? e.message : '图片生成失败'
  } finally {
    isGenerating.value = false
  }
}

// 使用示例
const useExample = (text: string) => {
  prompt.value = text
}

// 下载图片
const downloadImage = async (imageUrl: string, index: number) => {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `商品图片-${index + 1}.png`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    // 直接打开图片
    window.open(imageUrl, '_blank')
  }
}

// 复制提示词
const copyPrompt = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('已复制')
  } catch {
    alert('复制失败')
  }
}

// 删除图片
const deleteImage = (id: string) => {
  const index = generatedImages.value.findIndex(img => img.id === id)
  if (index > -1) {
    generatedImages.value.splice(index, 1)
  }
}

// 清空历史
const clearHistory = () => {
  if (confirm('确定要清空所有生成历史吗？')) {
    generatedImages.value = []
  }
}
</script>

<template>
  <div>
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- 顶部工具栏 -->
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">
          AI 商品图片生成
        </h2>
        <ModelSelector
          model-type="image"
          :show-label="true"
          size="md"
        />
      </div>
    
      <!-- 生成表单 -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">
          图片描述与设置
        </h3>
      
        <!-- 提示词输入 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            图片描述
          </label>
          <textarea
            v-model="prompt"
            rows="3"
            placeholder="描述你想要生成的商品图片，例如：一款红色口红，金色包装，大理石背景，柔和灯光..."
            class="input"
          />
        </div>

        <!-- 风格选择 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            图片风格
          </label>
          <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
            <button
              v-for="option in styleOptions"
              :key="option.value"
              class="p-3 rounded-xl border-2 text-center transition-all"
              :class="style === option.value
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'"
              @click="style = option.value"
            >
              <span class="text-2xl">{{ option.icon }}</span>
              <div class="text-xs mt-1 text-gray-500 dark:text-gray-400">
                {{ option.label }}
              </div>
            </button>
          </div>
        </div>

        <!-- 尺寸选择 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            图片尺寸
          </label>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="option in sizeOptions"
              :key="option.value"
              class="px-4 py-2 rounded-lg border-2 text-sm transition-all"
              :class="size === option.value
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'"
              @click="size = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- 生成按钮 -->
        <button
          :disabled="isGenerating || !aiStore.isImageEnabled"
          class="btn-primary w-full py-3"
          @click="generateImage"
        >
          {{ isGenerating ? '🎨 生成中...' : '🎨 生成图片' }}
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
        v-if="generatedImages.length > 0"
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
            v-for="(img, index) in generatedImages"
            :key="img.id"
            class="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <img
              :src="img.imageUrl"
              :alt="img.prompt"
              class="w-full aspect-square object-cover"
            >
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <p class="text-white text-sm line-clamp-2 mb-3">
                {{ img.prompt }}
              </p>
              <div class="flex gap-2">
                <button
                  class="flex-1 btn bg-white/20 text-white hover:bg-white/30 text-sm"
                  @click="openImageModal(img)"
                >
                  🔍 查看
                </button>
                <button
                  class="flex-1 btn bg-white/20 text-white hover:bg-white/30 text-sm"
                  @click="downloadImage(img.imageUrl, index)"
                >
                  📥 下载
                </button>
                <button
                  class="flex-1 btn bg-white/20 text-white hover:bg-white/30 text-sm"
                  @click="copyPrompt(img.prompt)"
                >
                  📋 复制
                </button>
                <button
                  class="btn bg-danger-500/80 text-white hover:bg-danger-600/80 text-sm"
                  @click="deleteImage(img.id)"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 class="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
          📖 使用说明
        </h3>
        <div class="text-sm text-blue-700 dark:text-blue-400 space-y-2">
          <p>1. <strong>描述商品</strong>：详细描述你想要生成的商品图片，包括产品外观、背景、光线等</p>
          <p>2. <strong>选择风格</strong>：根据商品类型选择合适的拍摄风格</p>
          <p>3. <strong>生成图片</strong>：AI 会自动优化提示词并生成专业商品图</p>
          <p>4. <strong>下载使用</strong>：生成的图片可直接用于电商详情页</p>
        </div>
        <div class="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-sm text-blue-700 dark:text-blue-400">
          💡 <strong>提示</strong>：此功能需要支持 DALL-E 或类似图片生成 API 的模型。当前使用模拟图片展示效果。
        </div>
      </div>

      <!-- 图片预览弹窗 -->
      <div
        v-if="showImageModal && selectedImage"
        class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
        @click="closeImageModal"
      >
        <div
          class="relative max-w-[90vw] max-h-[90vh]"
          @click.stop
        >
          <img
            :src="selectedImage.imageUrl"
            :alt="selectedImage.prompt"
            class="max-w-full max-h-[85vh] object-contain rounded-lg"
          >
          <div class="mt-4 text-center">
            <p class="text-white text-sm">
              {{ selectedImage.prompt }}
            </p>
          </div>
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
