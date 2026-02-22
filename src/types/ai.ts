/**
 * 大模型 API 提供商类型
 */
export type AIProvider = 'openai' | 'zhipu' | 'qwen' | 'deepseek' | 'siliconflow' | 'custom'

/**
 * 模型类型
 */
export type ModelType = 'text' | 'image' | 'video'

/**
 * 单个模型配置
 */
export interface ModelConfig {
  provider: AIProvider
  apiKey: string              // 当前选中提供商的 API Key（兼容旧版本）
  providerApiKeys: Record<AIProvider, string>  // 各提供商的独立 API Key
  baseUrl: string              // 当前选中提供商的 Base URL
  providerBaseUrls: Record<AIProvider, string>  // 各提供商的独立 Base URL
  model: string
  enabled: boolean
  // 文本模型参数
  maxTokens?: number
  temperature?: number
  // 图像模型参数
  imageSize?: '256' | '512' | '1024' | '1792'
  imageStyle?: 'vivid' | 'natural'
  // 视频模型参数
  videoDuration?: number
  videoResolution?: '480p' | '720p' | '1080p'
}

/**
 * 完整的 AI 配置 - 分模块
 */
export interface AIConfig {
  text: ModelConfig
  image: ModelConfig
  video: ModelConfig
}

/**
 * 提供商显示名称
 */
export const PROVIDER_NAMES: Record<AIProvider, string> = {
  openai: 'OpenAI',
  zhipu: '智谱 AI',
  qwen: '通义千问',
  deepseek: 'DeepSeek',
  siliconflow: '硅基流动',
  custom: '自定义'
}

/**
 * 提供商官网链接
 */
export const PROVIDER_LINKS: Record<AIProvider, { text: string; url: string }> = {
  openai: { text: 'OpenAI API Keys', url: 'https://platform.openai.com/api-keys' },
  zhipu: { text: '智谱开放平台', url: 'https://open.bigmodel.cn/' },
  qwen: { text: '阿里云百炼', url: 'https://bailian.console.aliyun.com/' },
  deepseek: { text: 'DeepSeek 开放平台', url: 'https://platform.deepseek.com/' },
  siliconflow: { text: '硅基流动', url: 'https://siliconflow.cn/' },
  custom: { text: '', url: '' }
}

/**
 * 各提供商的默认配置 - 文本模型
 */
export const TEXT_PROVIDER_DEFAULTS: Record<AIProvider, Omit<ModelConfig, 'apiKey' | 'enabled'>> = {
  openai: { provider: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', maxTokens: 4096, temperature: 0.7, providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' }, providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' } },
  zhipu: { provider: 'zhipu', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash', maxTokens: 4096, temperature: 0.7, providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' }, providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' } },
  qwen: { provider: 'qwen', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-turbo', maxTokens: 4096, temperature: 0.7, providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' }, providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' } },
  deepseek: { provider: 'deepseek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat', maxTokens: 4096, temperature: 0.7, providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' }, providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' } },
  siliconflow: { provider: 'siliconflow', baseUrl: 'https://api.siliconflow.cn/v1', model: 'Qwen/Qwen2.5-7B-Instruct', maxTokens: 4096, temperature: 0.7, providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' }, providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' } },
  custom: { provider: 'custom', baseUrl: '', model: '', maxTokens: 4096, temperature: 0.7, providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' }, providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' } }
}

/**
 * 各提供商的默认配置 - 图像模型
 */
export const IMAGE_PROVIDER_DEFAULTS: Record<AIProvider, Omit<ModelConfig, 'apiKey' | 'enabled'>> = {
  openai: { provider: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'dall-e-3', imageSize: '1024', imageStyle: 'vivid', providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' }, providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' } },
  zhipu: { provider: 'zhipu', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'cogview-3-plus', imageSize: '1024', providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' }, providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' } },
  qwen: { provider: 'qwen', baseUrl: 'https://dashscope.aliyuncs.com/api/v1', model: 'qwen-image', imageSize: '1024', providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' }, providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' } },
  deepseek: { provider: 'deepseek', baseUrl: '', model: '', imageSize: '1024', providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' }, providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' } },
  siliconflow: { provider: 'siliconflow', baseUrl: 'https://api.siliconflow.cn/v1', model: 'Kwai-Kolors/Kolors', imageSize: '1024', providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' }, providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' } },
  custom: { provider: 'custom', baseUrl: '', model: '', imageSize: '1024', providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' }, providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' } }
}

/**
 * 各提供商的默认配置 - 视频模型
 */
export const VIDEO_PROVIDER_DEFAULTS: Record<AIProvider, Omit<ModelConfig, 'apiKey' | 'enabled'>> = {
  openai: { provider: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'sora', videoDuration: 5, videoResolution: '720p', providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' }, providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' } },
  zhipu: { provider: 'zhipu', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'cogvideox', videoDuration: 6, videoResolution: '720p', providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' }, providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' } },
  qwen: { provider: 'qwen', baseUrl: 'https://dashscope.aliyuncs.com/api/v1', model: 'wanx2.1-t2v-turbo', videoDuration: 5, videoResolution: '720p', providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' }, providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' } },
  deepseek: { provider: 'deepseek', baseUrl: '', model: '', videoDuration: 5, videoResolution: '720p', providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' }, providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' } },
  siliconflow: { provider: 'siliconflow', baseUrl: 'https://api.siliconflow.cn/v1', model: 'Wan-AI/Wan2.2-T2V-A14B', videoDuration: 5, videoResolution: '720p', providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' }, providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' } },
  custom: { provider: 'custom', baseUrl: '', model: '', videoDuration: 5, videoResolution: '720p', providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' }, providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' } }
}

/**
 * 提供商支持的模型列表 - 文本 (2026年2月更新，综合官方文档)
 */
export const TEXT_MODELS: Record<AIProvider, string[]> = {
  openai: [
    'gpt-4o-mini',
    'gpt-4o',
    'gpt-4-turbo',
    'gpt-4-turbo-preview',
    'o1-mini',
    'o1-preview',
    'o3-mini',
    'o4-mini'
  ],
  zhipu: [
    'glm-4-flash',
    'glm-4-flashx',
    'glm-4-air',
    'glm-4-airx',
    'glm-4-plus',
    'glm-4-long',
    'glm-z1-flash',
    'glm-z1-air',
    'glm-4-9b-chat',  // 最新9B开源模型
    'glm-4-9b-chat-1m' // 长上下文版本
  ],
  qwen: [
    'qwen-turbo',
    'qwen-plus',
    'qwen-max',
    'qwen3-flash',
    'qwen3-plus',
    'qwen3-max',
    'qwen3-coder',
    'qwen2.5-7b-instruct', // Qwen2.5系列
    'qwen2.5-14b-instruct',
    'qwen2.5-32b-instruct',
    'qwen2.5-72b-instruct',
    'qwen2.5-vl-72b-instruct' // 多模态
  ],
  deepseek: [
    'deepseek-chat',
    'deepseek-reasoner',
    'deepseek-coder',
    'deepseek-v3' // V3最新版
  ],
  siliconflow: [
    'Qwen/Qwen2.5-7B-Instruct',
    'Qwen/Qwen2.5-14B-Instruct',
    'Qwen/Qwen2.5-32B-Instruct',
    'Qwen/Qwen2.5-72B-Instruct',
    'deepseek-ai/DeepSeek-V3',
    'deepseek-ai/DeepSeek-R1',
    'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
    'deepseek-ai/DeepSeek-R1-Distill-Llama-8B',
    'meta-llama/Llama-3.3-70B-Instruct',
    'mistralai/Mistral-Large-Instruct-2407'
  ],
  custom: []
}

/**
 * 提供商支持的模型列表 - 图像 (2026年2月更新，综合官方文档)
 */
export const IMAGE_MODELS: Record<AIProvider, string[]> = {
  openai: [
    'dall-e-3',
    'dall-e-2',
    'gpt-image-1',
    'dall-e-2-1024x1024'
  ],
  zhipu: [
    'cogview-3',
    'cogview-3-plus',
    'cogview-4-flash',  // 最新模型
    'cogview-4-plus'
  ],
  qwen: [
    'qwen-image',        // 通义千问官方图像模型
    'qwen-image-plus',   // 通义千问图像增强版
    'wanx-v1',
    'wanx2.1',
    'wanx2.0-plus',
    'wanx-sketch-to-image-v1',
    'wanx2.1-turbo'  // 快速版
  ],
  deepseek: [],
  siliconflow: [
    'Kwai-Kolors/Kolors',
    'Kwai-Kolors/Kolors-Flash',
    'stabilityai/stable-diffusion-3-medium',
    'stabilityai/stable-diffusion-3-large',
    'black-forest-labs/FLUX.1-schnell',
    'black-forest-labs/FLUX.1-pro',
    'black-forest-labs/FLUX.1-dev',
    ' advertisersai/Illuminate-photo'  // 新增
  ],
  custom: []
}

/**
 * 提供商支持的模型列表 - 视频 (2026年2月更新，综合官方文档)
 */
export const VIDEO_MODELS: Record<AIProvider, string[]> = {
  openai: [
    'sora',
    'sora-turbo'
  ],
  zhipu: [
    'cogvideox',
    'cogvideox-flash',
    'cogvideox-5',      // 最新模型
    'cogvideox-5d'      // 高画质版本
  ],
  qwen: [
    'wanx2.1-t2v-turbo',
    'wanx2.1-t2v-plus',
    'wanx2.0-t2v-plus',
    'wan2.6-i2v',
    'wanx2.1-video-turbo'
  ],
  deepseek: [],
  siliconflow: [
    'Wan-AI/Wan2.2-I2V-A14B',  // 图生视频
    'Wan-AI/Wan2.2-T2V-A14B'   // 文生视频
  ],
  custom: []
}

/**
 * 文本模型描述 (2026年2月更新，综合官方文档)
 */
export const TEXT_MODEL_DESCRIPTIONS: Record<string, string> = {
  // OpenAI
  'gpt-4o-mini': '快速高效，性价比最高',
  'gpt-4o': '全能型旗舰，支持多模态',
  'gpt-4-turbo': '高性能版本，适合复杂任务',
  'gpt-4-turbo-preview': 'GPT-4 Turbo预览版',
  'o1-mini': '推理增强，逻辑分析强',
  'o1-preview': '深度推理，解决复杂问题',
  'o3-mini': '最新推理模型，效率提升',
  'o4-mini': '最新推理模型，深度思考',

  // 智谱AI
  'glm-4-flash': '极速响应，免费额度多',
  'glm-4-flashx': '闪电速度，适合实时对话',
  'glm-4-air': '均衡之选，性价比高',
  'glm-4-airx': '增强版，更强能力',
  'glm-4-plus': '旗舰模型，能力最强',
  'glm-4-long': '超长上下文，支持128K',
  'glm-z1-flash': '快速推理，逻辑增强',
  'glm-z1-air': '深度推理，复杂问题',
  'glm-4-9b-chat': '开源9B模型，部署灵活',
  'glm-4-9b-chat-1m': '9B长上下文版本（128K）',

  // 通义千问
  'qwen-turbo': '极速响应，成本最低',
  'qwen-plus': '均衡性能，通用首选',
  'qwen-max': '旗舰模型，复杂任务',
  'qwen3-flash': '新一代快速模型',
  'qwen3-plus': '新一代均衡模型',
  'qwen3-max': '最新旗舰，最强能力',
  'qwen3-coder': '代码专用，编程首选',
  'qwen2.5-7b-instruct': '7B开源模型，速度极快',
  'qwen2.5-14b-instruct': '14B开源模型，平衡性能',
  'qwen2.5-32b-instruct': '32B开源模型，能力更强',
  'qwen2.5-72b-instruct': '72B开源旗舰',
  'qwen2.5-vl-72b-instruct': '多模态视觉语言模型',

  // DeepSeek
  'deepseek-chat': '高性价比，通用对话',
  'deepseek-reasoner': '推理模型，复杂逻辑',
  'deepseek-coder': '代码编程专用',
  'deepseek-v3': 'V3最新版，能力全面',

  // 硅基流动
  'Qwen/Qwen2.5-7B-Instruct': '阿里开源7B模型，性价比高',
  'Qwen/Qwen2.5-14B-Instruct': '阿里开源14B模型，更强能力',
  'Qwen/Qwen2.5-32B-Instruct': '阿里开源32B模型',
  'Qwen/Qwen2.5-72B-Instruct': '阿里开源72B模型，旗舰性能',
  'deepseek-ai/DeepSeek-V3': 'DeepSeek V3最新版',
  'deepseek-ai/DeepSeek-R1': 'DeepSeek R1推理模型',
  'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B': '蒸馏7B版，轻量高效',
  'deepseek-ai/DeepSeek-R1-Distill-Llama-8B': '蒸馏Llama版',
  'meta-llama/Llama-3.3-70B-Instruct': 'Meta Llama 3.3 70B',
  'mistralai/Mistral-Large-Instruct-2407': 'Mistral Large最新版'
}

/**
 * 图像模型描述 (2026年2月更新，综合官方文档)
 */
export const IMAGE_MODEL_DESCRIPTIONS: Record<string, string> = {
  // OpenAI
  'dall-e-3': 'OpenAI DALL-E 3，质量最高',
  'dall-e-2': 'OpenAI DALL-E 2，速度快',
  'gpt-image-1': 'GPT原生图像模型，理解力强',
  'dall-e-2-1024x1024': 'DALL-E 2 高清版',

  // 智谱AI
  'cogview-3': '智谱CogView 3基础版',
  'cogview-3-plus': '智谱CogView 3增强版',
  'cogview-4-flash': 'CogView 4快速版，免费',
  'cogview-4-plus': 'CogView 4旗舰版，质量最佳',

  // 通义千问
  'qwen-image': '通义千问官方图像模型',
  'qwen-image-plus': '通义千问图像增强版，质量更优',
  'wanx-v1': '通义万相V1基础版',
  'wanx2.1': '万相2.1最新版，质量优秀',
  'wanx2.0-plus': '万相2.0增强版',
  'wanx-sketch-to-image-v1': '草图转图像神器',
  'wanx2.1-turbo': '万相2.1快速版',

  // 硅基流动
  'Kwai-Kolors/Kolors': '快手可图，风格多样',
  'Kwai-Kolors/Kolors-Flash': '可图快速版',
  'stabilityai/stable-diffusion-3-medium': 'Stable Diffusion 3 Medium',
  'stabilityai/stable-diffusion-3-large': 'Stable Diffusion 3 Large',
  'black-forest-labs/FLUX.1-schnell': 'FLUX快速版，质量高',
  'black-forest-labs/FLUX.1-pro': 'FLUX专业版',
  'black-forest-labs/FLUX.1-dev': 'FLUX开发版',
  'advertisersai/Illuminate-photo': 'Illuminate Photo模型'
}

/**
 * 视频模型描述 (2026年2月更新，综合官方文档)
 */
export const VIDEO_MODEL_DESCRIPTIONS: Record<string, string> = {
  // OpenAI
  'sora': 'OpenAI Sora视频生成旗舰',
  'sora-turbo': 'Sora Turbo快速版',

  // 智谱AI
  'cogvideox': '智谱CogVideoX标准版',
  'cogvideox-flash': '智谱CogVideoX快速版',
  'cogvideox-5': 'CogVideoX 5最新版，质量提升',
  'cogvideox-5d': 'CogVideoX 5高画质版（Diffusion架构）',

  // 通义千问
  'wanx2.1-t2v-turbo': '万相2.1文生视频快速版',
  'wanx2.1-t2v-plus': '万相2.1文生视频增强版',
  'wanx2.0-t2v-plus': '万相2.0文生视频增强版',
  'wan2.6-i2v': '万相2.6图生视频',
  'wanx2.1-video-turbo': '万相2.1视频快速版',

  // 硅基流动
  'Wan-AI/Wan2.2-I2V-A14B': '硅基流动Wan2.2图生视频模型',
  'Wan-AI/Wan2.2-T2V-A14B': '硅基流动Wan2.2文生视频模型'
}

/**
 * 默认完整配置
 */
export const DEFAULT_AI_CONFIG: AIConfig = {
  text: { 
    provider: 'zhipu', 
    apiKey: '', 
    providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' },
    baseUrl: TEXT_PROVIDER_DEFAULTS.zhipu.baseUrl, 
    providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' },
    model: TEXT_PROVIDER_DEFAULTS.zhipu.model, 
    enabled: true,
    maxTokens: 4096,
    temperature: 0.7
  },
  image: { 
    provider: 'siliconflow', 
    apiKey: '', 
    providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' },
    baseUrl: IMAGE_PROVIDER_DEFAULTS.siliconflow.baseUrl, 
    providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' },
    model: IMAGE_PROVIDER_DEFAULTS.siliconflow.model, 
    enabled: false,
    imageSize: '1024'
  },
  video: { 
    provider: 'siliconflow', 
    apiKey: '', 
    providerApiKeys: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' },
    baseUrl: VIDEO_PROVIDER_DEFAULTS.siliconflow.baseUrl, 
    providerBaseUrls: { openai: '', zhipu: '', qwen: '', deepseek: '', siliconflow: '', custom: '' },
    model: VIDEO_PROVIDER_DEFAULTS.siliconflow.model, 
    enabled: false,
    videoDuration: 5,
    videoResolution: '720p'
  }
}

/**
 * AI 消息类型
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * AI 响应类型
 */
export interface AIResponse {
  success: boolean
  content?: string
  error?: string
  imageUrl?: string
  videoUrl?: string
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
}

// 兼容旧版本导出
export const PROVIDER_DEFAULTS = TEXT_PROVIDER_DEFAULTS
export const PROVIDER_MODELS = TEXT_MODELS
