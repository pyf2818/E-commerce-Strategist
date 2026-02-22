import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AIConfig, AIProvider, ModelType, ModelConfig } from '@/types'
import { 
  DEFAULT_AI_CONFIG, 
  TEXT_PROVIDER_DEFAULTS, 
  IMAGE_PROVIDER_DEFAULTS, 
  VIDEO_PROVIDER_DEFAULTS,
  PROVIDER_NAMES
} from '@/types'
import { AIService, createAIService } from '@/services/ai'

export const useAIStore = defineStore('ai', () => {
  // 状态 - 使用新的分模块配置
  const config = ref<AIConfig>(JSON.parse(JSON.stringify(DEFAULT_AI_CONFIG)))

  // 计算属性 - 检查是否已配置（检查当前提供商的 API Key）
  const isConfigured = computed(() => {
    const provider = config.value.text.provider
    const keys = config.value.text.providerApiKeys
    return !!(keys && keys[provider])
  })

  // 文本模型是否可用
  const isTextEnabled = computed(() => {
    const provider = config.value.text.provider
    const keys = config.value.text.providerApiKeys
    return config.value.text.enabled && !!(keys && keys[provider])
  })

  // 图像模型是否可用
  const isImageEnabled = computed(() => {
    const provider = config.value.image.provider
    const keys = config.value.image.providerApiKeys
    return config.value.image.enabled && !!(keys && keys[provider])
  })

  // 视频模型是否可用
  const isVideoEnabled = computed(() => {
    const provider = config.value.video.provider
    const keys = config.value.video.providerApiKeys
    return config.value.video.enabled && !!(keys && keys[provider])
  })

  // 获取当前文本提供商名称
  const providerName = computed(() => {
    const provider = config.value.text.provider
    return PROVIDER_NAMES[provider] || provider
  })

  // 服务实例缓存
  const serviceInstances: Record<ModelType, AIService | null> = {
    text: null,
    image: null,
    video: null
  }

  // 获取指定类型的服务实例
  const getService = (type: ModelType = 'text'): AIService => {
    if (!serviceInstances[type]) {
      serviceInstances[type] = createAIService(config.value[type], type)
    }
    return serviceInstances[type]!
  }

  // 更新指定类型的模型配置
  const updateModelConfig = (type: ModelType, newConfig: Partial<ModelConfig>) => {
    const currentProvider = config.value[type].provider
    const currentProviderApiKeys = { ...config.value[type].providerApiKeys }
    const currentProviderBaseUrls = { ...config.value[type].providerBaseUrls }

    // 如果传入了新的 apiKey，将其保存到对应提供商的 providerApiKeys 中
    if (newConfig.apiKey !== undefined) {
      currentProviderApiKeys[newConfig.provider || currentProvider] = newConfig.apiKey
    }

    // 如果传入了新的 baseUrl，将其保存到对应提供商的 providerBaseUrls 中
    if (newConfig.baseUrl !== undefined) {
      currentProviderBaseUrls[newConfig.provider || currentProvider] = newConfig.baseUrl
    }

    // 合并 providerApiKeys
    if (newConfig.providerApiKeys) {
      Object.assign(currentProviderApiKeys, newConfig.providerApiKeys)
    }

    // 合并 providerBaseUrls
    if (newConfig.providerBaseUrls) {
      Object.assign(currentProviderBaseUrls, newConfig.providerBaseUrls)
    }

    const targetProvider = newConfig.provider || currentProvider
    const defaultsMap = {
      text: TEXT_PROVIDER_DEFAULTS,
      image: IMAGE_PROVIDER_DEFAULTS,
      video: VIDEO_PROVIDER_DEFAULTS
    }
    const defaultBaseUrl = defaultsMap[type][targetProvider]?.baseUrl || ''

    config.value[type] = {
      ...config.value[type],
      ...newConfig,
      providerApiKeys: currentProviderApiKeys,
      providerBaseUrls: currentProviderBaseUrls,
      // 确保当前 apiKey 是当前提供商的 key
      apiKey: currentProviderApiKeys[targetProvider] || '',
      // 确保当前 baseUrl：优先用 providerBaseUrls 中的值，否则用默认值
      baseUrl: currentProviderBaseUrls[targetProvider] || defaultBaseUrl
    }
    serviceInstances[type] = null // 重置服务实例
  }

  // 设置指定类型的提供商
  const setProvider = (type: ModelType, provider: AIProvider) => {
    const defaultsMap = {
      text: TEXT_PROVIDER_DEFAULTS,
      image: IMAGE_PROVIDER_DEFAULTS,
      video: VIDEO_PROVIDER_DEFAULTS
    }
    const defaults = defaultsMap[type][provider]

    // 切换到新提供商时，自动加载该提供商的 API Key 和 Base URL
    const storedBaseUrl = config.value[type].providerBaseUrls[provider]
    const storedApiKey = config.value[type].providerApiKeys[provider]
    const newBaseUrl = storedBaseUrl || defaults.baseUrl
    const newApiKey = storedApiKey || ''

    if (import.meta.env.DEV) {
      console.log('[AIStore] setProvider:', {
        type,
        provider,
        storedBaseUrl,
        defaultBaseUrl: defaults.baseUrl,
        usingBaseUrl: newBaseUrl,
        storedApiKey: storedApiKey ? '***' : 'none'
      })
    }

    config.value[type] = {
      ...config.value[type],
      provider,
      baseUrl: newBaseUrl,
      model: defaults.model,
      apiKey: newApiKey
    }
    serviceInstances[type] = null
  }

  // 设置指定类型的 API Key（保存到当前提供商的 keys 中）
  const setApiKey = (type: ModelType, apiKey: string) => {
    const provider = config.value[type].provider
    config.value[type].providerApiKeys[provider] = apiKey
    config.value[type].apiKey = apiKey
    serviceInstances[type] = null
  }

  // 设置指定类型的 Base URL（保存到当前提供商的 baseUrls 中）
  const setBaseUrl = (type: ModelType, baseUrl: string) => {
    const provider = config.value[type].provider
    config.value[type].providerBaseUrls[provider] = baseUrl
    config.value[type].baseUrl = baseUrl
    serviceInstances[type] = null
  }

  // 设置指定类型的模型
  const setModel = (type: ModelType, model: string) => {
    config.value[type].model = model
    serviceInstances[type] = null
  }

  // 启用/禁用指定类型
  const setEnabled = (type: ModelType, enabled: boolean) => {
    config.value[type].enabled = enabled
  }

  // 重置指定类型的配置
  const resetModelConfig = (type: ModelType) => {
    const defaultsMap = {
      text: TEXT_PROVIDER_DEFAULTS,
      image: IMAGE_PROVIDER_DEFAULTS,
      video: VIDEO_PROVIDER_DEFAULTS
    }
    const defaults = defaultsMap[type][config.value[type].provider]
    
    config.value[type] = {
      provider: config.value[type].provider,
      apiKey: '',
      providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' },
      providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' },
      baseUrl: defaults.baseUrl,
      model: defaults.model,
      enabled: type === 'text' // 默认只启用文本模型
    }
    serviceInstances[type] = null
  }

  // 重置所有配置
  const resetAllConfig = () => {
    config.value = JSON.parse(JSON.stringify(DEFAULT_AI_CONFIG))
    serviceInstances.text = null
    serviceInstances.image = null
    serviceInstances.video = null
  }

  // 兼容旧版本的方法 - 操作文本模型配置
  const updateConfig = (newConfig: Partial<ModelConfig>) => {
    updateModelConfig('text', newConfig)
  }

  // 获取文本服务（兼容旧版本）
  const getTextService = (): AIService => getService('text')

  // 获取图像服务
  const getImageService = (): AIService => getService('image')

  // 获取视频服务
  const getVideoService = (): AIService => getService('video')

  // 获取当前提供商的 API Key
  const getCurrentProviderApiKey = (type: ModelType): string => {
    return config.value[type].providerApiKeys[config.value[type].provider] || ''
  }

  // 设置指定提供商的 API Key
  const setProviderApiKey = (type: ModelType, provider: AIProvider, apiKey: string) => {
    config.value[type].providerApiKeys[provider] = apiKey
    // 如果是当前选中的提供商，同时更新 apiKey
    if (config.value[type].provider === provider) {
      config.value[type].apiKey = apiKey
    }
    serviceInstances[type] = null
  }

  // 获取当前提供商的 Base URL
  const getCurrentProviderBaseUrl = (type: ModelType): string => {
    return config.value[type].providerBaseUrls[config.value[type].provider] || ''
  }

  // 设置指定提供商的 Base URL
  const setProviderBaseUrl = (type: ModelType, provider: AIProvider, baseUrl: string) => {
    config.value[type].providerBaseUrls[provider] = baseUrl
    // 如果是当前选中的提供商，同时更新 baseUrl
    if (config.value[type].provider === provider) {
      config.value[type].baseUrl = baseUrl
    }
    serviceInstances[type] = null
  }

  return {
    // 状态
    config,
    isConfigured,
    isTextEnabled,
    isImageEnabled,
    isVideoEnabled,
    providerName,
    
    // 新版方法 - 支持多模型
    getService,
    updateModelConfig,
    setProvider,
    setApiKey,
    setBaseUrl,
    setModel,
    setEnabled,
    resetModelConfig,
    resetAllConfig,
    getImageService,
    getVideoService,
    getCurrentProviderApiKey,
    setProviderApiKey,
    getCurrentProviderBaseUrl,
    setProviderBaseUrl,
    
    // 兼容旧版本
    getTextService,
    updateConfig
  }
}, {
  persist: {
    key: 'ai-config',
    storage: localStorage,
    paths: ['config']
  }
})
