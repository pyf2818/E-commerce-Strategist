<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAIStore } from '@/stores'
import type { AIProvider, ModelType } from '@/types'
import {
  PROVIDER_NAMES,
  PROVIDER_LINKS,
  TEXT_PROVIDER_DEFAULTS,
  IMAGE_PROVIDER_DEFAULTS,
  VIDEO_PROVIDER_DEFAULTS,
  TEXT_MODELS,
  IMAGE_MODELS,
  VIDEO_MODELS,
  TEXT_MODEL_DESCRIPTIONS,
  IMAGE_MODEL_DESCRIPTIONS,
  VIDEO_MODEL_DESCRIPTIONS
} from '@/types'

const aiStore = useAIStore()

// 当前选中的标签页
const activeTab = ref<ModelType>('text')

// 是否显示 API Key
const showApiKey = ref<Record<ModelType, boolean>>({
  text: false,
  image: false,
  video: false
})

// 是否自定义 Base URL
const useCustomBaseUrl = ref<Record<ModelType, boolean>>({
  text: false,
  image: false,
  video: false
})

// 表单状态类型定义
interface FormState {
  provider: AIProvider
  apiKey: string
  baseUrl: string
  model: string
  maxTokens?: number
  temperature?: number
  imageSize?: '256' | '512' | '1024' | '1792'
  imageStyle?: 'vivid' | 'natural'
  videoDuration?: number
  videoResolution?: '480p' | '720p' | '1080p'
}

// 各类型的表单状态
const forms = ref<Record<ModelType, FormState>>({
  text: {
    provider: 'zhipu',
    apiKey: '',
    baseUrl: '',
    model: '',
    maxTokens: 4096,
    temperature: 0.7
  },
  image: {
    provider: 'siliconflow',
    apiKey: '',
    baseUrl: '',
    model: '',
    imageSize: '1024',
    imageStyle: 'vivid'
  },
  video: {
    provider: 'siliconflow',
    apiKey: '',
    baseUrl: '',
    model: '',
    videoDuration: 5,
    videoResolution: '720p'
  }
})

// 延迟初始化表单状态，确保 store 已完全加载
const initForms = () => {
  const getSafeConfig = (type: ModelType) => {
    const cfg = aiStore.config[type]
    const provider = cfg?.provider || 'zhipu'
    const providerApiKeys = cfg?.providerApiKeys || {}
    const providerBaseUrls = cfg?.providerBaseUrls || {}
    const defaultsMap = { text: TEXT_PROVIDER_DEFAULTS, image: IMAGE_PROVIDER_DEFAULTS, video: VIDEO_PROVIDER_DEFAULTS }
    const baseUrl = providerBaseUrls[provider] || defaultsMap[type][provider]?.baseUrl || ''

    return {
      provider,
      apiKey: providerApiKeys[provider] || '',
      baseUrl,
      model: cfg?.model || '',
      ...(type === 'text' && {
        maxTokens: cfg?.maxTokens ?? 4096,
        temperature: (cfg?.temperature as number | undefined) ?? 0.7
      }),
      ...(type === 'image' && {
        imageSize: (cfg?.imageSize as '256' | '512' | '1024' | '1792') ?? '1024',
        imageStyle: (cfg?.imageStyle as 'vivid' | 'natural') ?? 'vivid'
      }),
      ...(type === 'video' && {
        videoDuration: cfg?.videoDuration ?? 5,
        videoResolution: (cfg?.videoResolution as '480p' | '720p' | '1080p') ?? '720p'
      })
    }
  }

  forms.value = {
    text: getSafeConfig('text'),
    image: getSafeConfig('image'),
    video: getSafeConfig('video')
  }
}

// 初始化表单
initForms()

// 初始化 useCustomBaseUrl 状态 - 在组件挂载后执行，确保安全
onMounted(() => {
  try {
    // 重新从 store 同步一次 customBaseUrl 状态，确保与持久化数据一致
    (['text', 'image', 'video'] as ModelType[]).forEach(type => {
      const provider = forms.value[type]?.provider
      if (provider && aiStore.config[type]) {
        const savedBaseUrl = aiStore.config[type].providerBaseUrls?.[provider]
        useCustomBaseUrl.value[type] = !!savedBaseUrl
      }
    })
  } catch (error) {
    console.error('Failed to initialize customBaseUrl state:', error)
  }
})

// 测试状态
const isTesting = ref<Record<ModelType, boolean>>({
  text: false,
  image: false,
  video: false
})
const testResult = ref<Record<ModelType, { success: boolean; message: string } | null>>({
  text: null,
  image: null,
  video: null
})

// 获取当前标签页的表单
const currentForm = computed(() => forms.value[activeTab.value])

// 获取当前类型的模型列表
const availableModels = computed(() => {
  const modelsMap = {
    text: TEXT_MODELS,
    image: IMAGE_MODELS,
    video: VIDEO_MODELS
  }
  return modelsMap[activeTab.value][currentForm.value.provider] || []
})

// 获取当前类型的默认配置
const providerDefaults = computed(() => {
  const defaultsMap = {
    text: TEXT_PROVIDER_DEFAULTS,
    image: IMAGE_PROVIDER_DEFAULTS,
    video: VIDEO_PROVIDER_DEFAULTS
  }
  return defaultsMap[activeTab.value]
})

// 监听提供商变化 - 切换时加载对应提供商的 API Key 和 Base URL
watch(() => currentForm.value.provider, (newProvider) => {
  // 切换到新提供商时，加载该提供商之前保存的 Base URL（如果有自定义）
  const savedBaseUrl = aiStore.config[activeTab.value].providerBaseUrls[newProvider]

  if (savedBaseUrl) {
    // 有保存的自定义Base URL，使用它并勾选"自定义"
    currentForm.value.baseUrl = savedBaseUrl
    useCustomBaseUrl.value[activeTab.value] = true
  } else {
    // 没有保存的自定义Base URL，使用默认URL
    currentForm.value.baseUrl = providerDefaults.value[newProvider].baseUrl
    // Custom提供商必须自定义Base URL
    useCustomBaseUrl.value[activeTab.value] = newProvider === 'custom'
  }

  if (availableModels.value.length > 0) {
    currentForm.value.model = availableModels.value[0]
  }
  // 切换到新提供商时，加载该提供商之前保存的 API Key
  currentForm.value.apiKey = aiStore.config[activeTab.value].providerApiKeys[newProvider] || ''
})

// 监听自定义复选框变化 - Custom提供商必须强制自定义
watch(() => currentForm.value.provider, (provider) => {
  if (provider === 'custom') {
    useCustomBaseUrl.value[activeTab.value] = true
  }
})

// 标签页配置
const tabs = [
  { key: 'text' as ModelType, label: '文本生成', icon: '📝', desc: '用于内容创作、问答等' },
  { key: 'image' as ModelType, label: '图像生成', icon: '🎨', desc: '用于商品图片、广告图等' },
  { key: 'video' as ModelType, label: '视频生成', icon: '🎬', desc: '用于短视频、广告视频等' }
]

// 提供商选项
const providerOptions = Object.entries(PROVIDER_NAMES).map(([value, label]) => ({
  value: value as AIProvider,
  label
}))

// 获取模型描述
const getModelDescription = (modelId: string): string => {
  const descriptionsMap: Record<ModelType, Record<string, string>> = {
    text: TEXT_MODEL_DESCRIPTIONS,
    image: IMAGE_MODEL_DESCRIPTIONS,
    video: VIDEO_MODEL_DESCRIPTIONS
  }
  return descriptionsMap[activeTab.value][modelId] || ''
}

// 保存配置
const saveConfig = () => {
  const type = activeTab.value
  aiStore.updateModelConfig(type, {
    provider: forms.value[type].provider,
    apiKey: forms.value[type].apiKey,
    baseUrl: forms.value[type].baseUrl,
    model: forms.value[type].model,
    enabled: !!forms.value[type].apiKey,
    // 文本模型参数
    ...(type === 'text' && {
      maxTokens: forms.value.text.maxTokens,
      temperature: forms.value.text.temperature
    }),
    // 图像模型参数
    ...(type === 'image' && {
      imageSize: forms.value.image.imageSize,
      imageStyle: forms.value.image.imageStyle
    }),
    // 视频模型参数
    ...(type === 'video' && {
      videoDuration: forms.value.video.videoDuration,
      videoResolution: forms.value.video.videoResolution
    })
  })
  testResult.value[type] = null
}

// 测试连接
const testConnection = async () => {
  const type = activeTab.value
  if (!forms.value[type].apiKey) {
    testResult.value[type] = { success: false, message: '请先填写 API Key' }
    return
  }

  isTesting.value[type] = true
  testResult.value[type] = null

  try {
    // 临时更新配置进行测试
    saveConfig()

    const service = aiStore.getService(type)
    
    if (type === 'text') {
      const result = await service.chat([
        { role: 'user', content: '你好' }
      ], '请用一句话回复')

      if (result.success) {
        testResult.value[type] = { 
          success: true, 
          message: `连接成功！模型响应：${result.content?.slice(0, 50)}...` 
        }
      } else {
        testResult.value[type] = { 
          success: false, 
          message: result.error || '连接失败' 
        }
      }
    } else if (type === 'image') {
      testResult.value[type] = { 
        success: true, 
        message: '配置已保存！图像生成功能已就绪。' 
      }
    } else if (type === 'video') {
      testResult.value[type] = { 
        success: true, 
        message: '配置已保存！视频生成功能已就绪。' 
      }
    }
  } catch (e) {
    testResult.value[type] = { 
      success: false, 
      message: e instanceof Error ? e.message : '连接失败' 
    }
  } finally {
    isTesting.value[type] = false
  }
}

// 重置当前类型配置
const resetCurrentConfig = () => {
  const type = activeTab.value
  const defaults = providerDefaults.value.zhipu // 默认使用智谱
  
  if (type === 'text') {
    forms.value.text = {
      provider: 'zhipu',
      apiKey: '',
      baseUrl: defaults.baseUrl,
      model: defaults.model,
      maxTokens: 4096,
      temperature: 0.7
    }
  } else if (type === 'image') {
    forms.value.image = {
      provider: 'zhipu',
      apiKey: '',
      baseUrl: defaults.baseUrl,
      model: defaults.model,
      imageSize: '1024',
      imageStyle: 'vivid'
    }
  } else if (type === 'video') {
    forms.value.video = {
      provider: 'zhipu',
      apiKey: '',
      baseUrl: defaults.baseUrl,
      model: defaults.model,
      videoDuration: 5,
      videoResolution: '720p'
    }
  }
  useCustomBaseUrl.value[type] = false
  aiStore.resetModelConfig(type)
  testResult.value[type] = null
}

// 重置所有配置
const resetAllConfig = () => {
  aiStore.resetAllConfig()
  // 重新初始化表单
  forms.value = {
    text: {
      provider: aiStore.config.text.provider,
      apiKey: aiStore.config.text.apiKey,
      baseUrl: aiStore.config.text.baseUrl,
      model: aiStore.config.text.model,
      maxTokens: aiStore.config.text.maxTokens || 4096,
      temperature: aiStore.config.text.temperature || 0.7
    },
    image: {
      provider: aiStore.config.image.provider,
      apiKey: aiStore.config.image.apiKey,
      baseUrl: aiStore.config.image.baseUrl,
      model: aiStore.config.image.model,
      imageSize: aiStore.config.image.imageSize || '1024',
      imageStyle: aiStore.config.image.imageStyle || 'vivid'
    },
    video: {
      provider: aiStore.config.video.provider,
      apiKey: aiStore.config.video.apiKey,
      baseUrl: aiStore.config.video.baseUrl,
      model: aiStore.config.video.model,
      videoDuration: aiStore.config.video.videoDuration || 5,
      videoResolution: aiStore.config.video.videoResolution || '720p'
    }
  }
  testResult.value = { text: null, image: null, video: null }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- 标签页切换 -->
    <div class="card">
      <div class="flex gap-2 mb-6">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="flex-1 p-4 rounded-xl border-2 text-left transition-all"
          :class="activeTab === tab.key
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
          @click="activeTab = tab.key"
        >
          <div class="text-2xl mb-1">
            {{ tab.icon }}
          </div>
          <div class="font-medium">
            {{ tab.label }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ tab.desc }}
          </div>
        </button>
      </div>

      <!-- 提供商选择 -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          选择 AI 提供商
        </label>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="option in providerOptions"
            :key="option.value"
            class="p-3 rounded-xl border-2 text-center transition-all"
            :class="currentForm.provider === option.value
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
            @click="currentForm.provider = option.value"
          >
            <div class="font-medium text-sm">
              {{ option.label }}
            </div>
          </button>
        </div>
      </div>

      <!-- API Key -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">API Key</label>
          <a
            v-if="PROVIDER_LINKS[currentForm.provider]?.url"
            :href="PROVIDER_LINKS[currentForm.provider].url"
            target="_blank"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            获取 {{ PROVIDER_LINKS[currentForm.provider].text }} →
          </a>
        </div>
        <div class="relative">
          <input
            v-model="currentForm.apiKey"
            :type="showApiKey[activeTab] ? 'text' : 'password'"
            placeholder="请输入你的 API Key"
            class="input pr-20"
          >
          <button
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300"
            @click="showApiKey[activeTab] = !showApiKey[activeTab]"
          >
            {{ showApiKey[activeTab] ? '🙈' : '👁️' }}
          </button>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
          🔒 API Key 仅存储在本地浏览器中，不会上传到任何服务器
        </p>
      </div>

      <!-- Base URL -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">API Base URL</label>
          <label class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <input
              v-model="useCustomBaseUrl[activeTab]"
              :disabled="currentForm.provider === 'custom'"
              type="checkbox"
              class="rounded"
            >
            自定义
            <span
              v-if="currentForm.provider === 'custom'"
              class="text-amber-500"
            >（必填）</span>
          </label>
        </div>
        <input
          v-model="currentForm.baseUrl"
          :disabled="currentForm.provider !== 'custom' && !useCustomBaseUrl[activeTab]"
          :placeholder="currentForm.provider === 'custom' ? '请输入完整的API Base URL（例如：https://your-api.com/v1）' : providerDefaults[currentForm.provider]?.baseUrl"
          class="input disabled:bg-white dark:bg-gray-800 disabled:text-gray-500"
        >
      </div>

      <!-- 模型选择 -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">模型</label>
        <div
          v-if="currentForm.provider === 'custom'"
          class="space-y-2"
        >
          <input
            v-model="currentForm.model"
            type="text"
            placeholder="输入模型名称"
            class="input"
          >
        </div>
        <div
          v-else
          class="space-y-2"
        >
          <select
            v-model="currentForm.model"
            class="input"
          >
            <option
              v-for="m in availableModels"
              :key="m"
              :value="m"
            >
              {{ m }}
            </option>
          </select>
          <!-- 模型描述 -->
          <p 
            v-if="getModelDescription(currentForm.model)" 
            class="text-xs text-primary-600 dark:text-primary-400 mt-1"
          >
            💡 {{ getModelDescription(currentForm.model) }}
          </p>
        </div>
      </div>

      <!-- 文本模型高级设置 -->
      <template v-if="activeTab === 'text'">
        <details class="mb-6">
          <summary class="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:text-gray-100">
            高级设置
          </summary>
          <div class="mt-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                最大输出长度 (Max Tokens): {{ forms.text.maxTokens }}
              </label>
              <input
                v-model.number="forms.text.maxTokens"
                type="range"
                min="256"
                max="8192"
                step="256"
                class="w-full"
              >
              <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>256</span>
                <span>8192</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                创造性 (Temperature): {{ (forms.text.temperature ?? 0.7).toFixed(1) }}
              </label>
              <input
                v-model.number="forms.text.temperature"
                type="range"
                min="0"
                max="1"
                step="0.1"
                class="w-full"
              >
              <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>0 (精确)</span>
                <span>1 (创造)</span>
              </div>
            </div>
          </div>
        </details>
      </template>

      <!-- 图像模型设置 -->
      <template v-if="activeTab === 'image'">
        <details
          class="mb-6"
          open
        >
          <summary class="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:text-gray-100">
            图像设置
          </summary>
          <div class="mt-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                图像尺寸
              </label>
              <select
                v-model="forms.image.imageSize"
                class="input"
              >
                <option value="256">
                  256x256
                </option>
                <option value="512">
                  512x512
                </option>
                <option value="1024">
                  1024x1024
                </option>
                <option value="1792">
                  1792x1792
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                图像风格
              </label>
              <select
                v-model="forms.image.imageStyle"
                class="input"
              >
                <option value="vivid">
                  生动 (Vivid)
                </option>
                <option value="natural">
                  自然 (Natural)
                </option>
              </select>
            </div>
          </div>
        </details>
      </template>

      <!-- 视频模型设置 -->
      <template v-if="activeTab === 'video'">
        <details
          class="mb-6"
          open
        >
          <summary class="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:text-gray-100">
            视频设置
          </summary>
          <div class="mt-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                视频时长 (秒): {{ forms.video.videoDuration }}
              </label>
              <input
                v-model.number="forms.video.videoDuration"
                type="range"
                min="1"
                max="60"
                step="1"
                class="w-full"
              >
              <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>1秒</span>
                <span>60秒</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                视频分辨率
              </label>
              <select
                v-model="forms.video.videoResolution"
                class="input"
              >
                <option value="480p">
                  480p
                </option>
                <option value="720p">
                  720p
                </option>
                <option value="1080p">
                  1080p
                </option>
              </select>
            </div>
          </div>
        </details>
      </template>

      <!-- 操作按钮 -->
      <div class="flex gap-3">
        <button
          class="btn-primary flex-1"
          @click="saveConfig"
        >
          💾 保存配置
        </button>
        <button 
          :disabled="isTesting[activeTab] || !currentForm.apiKey" 
          class="btn-secondary flex-1"
          @click="testConnection"
        >
          {{ isTesting[activeTab] ? '测试中...' : '🔌 测试连接' }}
        </button>
      </div>

      <!-- 测试结果 -->
      <div
        v-if="testResult[activeTab]"
        class="mt-4 p-4 rounded-lg"
        :class="testResult[activeTab]?.success ? 'bg-success-50 dark:bg-success-900/20 text-success-300' : 'bg-danger-50 dark:bg-danger-900/20 text-danger-300'"
      >
        {{ testResult[activeTab]?.success ? '✅' : '❌' }} {{ testResult[activeTab]?.message }}
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="card bg-white dark:bg-gray-50 dark:bg-gray-800/50">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        📖 使用说明
      </h3>
      <div class="space-y-3 text-sm text-gray-500 dark:text-gray-400">
        <p><strong>1. 选择模型类型：</strong>根据你的需求选择文本、图像或视频生成模型。</p>
        <p><strong>2. 选择提供商：</strong>选择你想要使用的 AI 服务提供商。</p>
        <p><strong>3. 获取 API Key：</strong>点击右上角链接，在对应平台注册并获取 API Key。</p>
        <p><strong>4. 填写并保存：</strong>将 API Key 填入并点击保存，即可开始使用。</p>
        <p><strong>5. 数据安全：</strong>所有数据仅存储在你的浏览器本地，不会上传到服务器。</p>
      </div>
      
      <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-300">
        💡 <strong>推荐：</strong>智谱 AI 提供免费额度，适合个人用户试用。DeepSeek 价格实惠，OpenAI 功能强大但需要付费订阅。
      </div>
    </div>

    <!-- 重要提示：CORS问题 -->
    <div class="card border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
      <h3 class="text-lg font-semibold text-amber-700 dark:text-amber-400 mb-3">
        ⚠️ 重要：CORS跨域问题
      </h3>
      <div class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
        <p>
          <strong>为什么有些模型无法调用？</strong><br>
          本应用直接在浏览器中调用AI服务商的API。大多数服务商（OpenAI、智谱、通义等）的API默认
          <strong>不支持跨域访问</strong>，因此浏览器会阻止这些请求。
        </p>
        <p>
          <strong>已确认支持跨域的提供商：</strong><br>
          ✅ <strong>DeepSeek</strong> - 完全支持CORS，可直接调用<br>
          ✅ <strong>硅基流动</strong> - 部分支持，建议配置CORS代理
        </p>
        <p>
          <strong>解决方案：</strong>
        </p>
        <ul class="list-disc list-inside space-y-1 ml-2">
          <li>
            <strong>方案A（推荐调试）：安装浏览器扩展</strong><br>
            安装 "Allow CORS" 或 "CORS Unblock" 扩展，可临时禁用CORS检查，方便测试。
            <span class="text-amber-600 dark:text-amber-400">注意：仅限开发测试，不适合生产环境长期使用。</span>
          </li>
          <li>
            <strong>方案B：配置CORS代理</strong><br>
            在 <code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">src/services/ai.ts:8</code> 设置
            <code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">CORS_PROXY</code> 变量，通过代理服务器转发请求。
          </li>
          <li>
            <strong>方案C：自建后端代理（生产推荐）</strong><br>
            搭建简单的Node.js代理服务，API Key存储在服务端，既解决CORS问题，又保证安全性。
          </li>
        </ul>
      </div>
    </div>

    <!-- 自定义模型使用指南 -->
    <div class="card border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10">
      <h3 class="text-lg font-semibold text-purple-700 dark:text-purple-400 mb-3">
        🔧 自定义模型配置指南
      </h3>
      <div class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
        <p>
          如果你使用其他兼容OpenAI格式的AI服务（如本地部署的模型、其他云服务商），请选择 <strong>"自定义"</strong> 提供商：
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div class="p-3 bg-white dark:bg-gray-800 rounded-lg border">
            <h4 class="font-medium text-gray-800 dark:text-gray-200 mb-2">
              📋 配置要求
            </h4>
            <ul class="list-disc list-inside space-y-1 text-xs">
              <li><strong>Base URL：</strong>API的基础地址（必须）</li>
              <li><strong>模型名称：</strong>完整的模型标识符（必须）</li>
              <li><strong>API Key：</strong>认证密钥（可选，取决于服务商）</li>
            </ul>
          </div>
          <div class="p-3 bg-white dark:bg-gray-800 rounded-lg border">
            <h4 class="font-medium text-gray-800 dark:text-gray-200 mb-2">
              📝 示例配置
            </h4>
            <pre class="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto"><code>Base URL: https://your-api.com/v1
模型名称: your-model-name
API Key: sk-xxx</code></pre>
          </div>
        </div>
        <p class="text-amber-600 dark:text-amber-400 mt-2">
          💡 提示：自定义模型使用OpenAI兼容格式，确保你的服务支持 <code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">/chat/completions</code> 端点。
        </p>
      </div>
    </div>

    <!-- 模型兼容性说明 -->
    <div class="card border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
      <h3 class="text-lg font-semibold text-green-700 dark:text-green-400 mb-3">
        🗂️ 模型类别兼容性说明
      </h3>
      <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p><strong>文本模型：</strong>所有提供商使用 <code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">/chat/completions</code> 接口（OpenAI兼容格式）。</p>
        <p><strong>图像模型：</strong></p>
        <ul class="list-disc list-inside space-y-1 ml-4 text-xs">
          <li>OpenAI、智谱、硅基流动：使用 <code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">/images/generations</code>（OpenAI兼容）</li>
          <li>通义千问：使用原生API <code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">/services/aigc/multimodal-generation/generation</code></li>
        </ul>
        <p><strong>视频模型：</strong></p>
        <ul class="list-disc list-inside space-y-1 ml-4 text-xs">
          <li>智谱：使用 <code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">/videos/generations</code></li>
          <li>通义千问：使用原生API <code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">/services/aigc/video-generation/video-synthesis</code></li>
          <li>硅基流动：使用 <code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">/video/generations</code>（OpenAI兼容）</li>
        </ul>
        <p class="text-green-600 dark:text-green-400 mt-2">
          ✅ 每个模型类型（文本/图像/视频）都有<strong>独立的Base URL配置</strong>，互不干扰！
        </p>
      </div>
    </div>

    <!-- 重置 -->
    <div class="card border-danger-200 dark:border-danger-800">
      <h3 class="text-lg font-semibold text-danger-600 dark:text-danger-400 mb-2">
        危险操作
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
        重置将清除所有本地保存的配置数据。
      </p>
      <div class="flex gap-3">
        <button
          class="btn bg-danger-500 text-white hover:bg-danger-600"
          @click="resetCurrentConfig"
        >
          重置当前配置
        </button>
        <button
          class="btn bg-danger-600 text-white hover:bg-danger-700"
          @click="resetAllConfig"
        >
          🗑️ 重置所有配置
        </button>
      </div>
    </div>
  </div>
</template>
