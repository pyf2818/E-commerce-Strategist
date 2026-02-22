import type { ModelConfig, ModelType, ChatMessage, AIResponse } from '@/types'

// CORS 代理地址 - 解决浏览器跨域限制
// 国内用户如果无法访问公共代理，可以：
// 1. 留空使用 DeepSeek（支持跨域）
// 2. 安装浏览器扩展 "Allow CORS" 或 "CORS Unblock"
// 3. 自建代理服务
const CORS_PROXY = ''

/**
 * AI 服务类 - 支持多平台 API 调用
 */
export class AIService {
  private config: ModelConfig
  private modelType: ModelType

  constructor(config: ModelConfig, modelType: ModelType = 'text') {
    this.config = config
    this.modelType = modelType
  }

  /**
   * 获取 API URL，自动处理代理
   */
  private getApiUrl(path: string): string {
    let baseUrl = this.config.baseUrl.trim()
    if (!baseUrl) {
      throw new Error('Base URL 未配置')
    }
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1)
    }

    // 智能检测：如果baseUrl已经包含完整的API路径，则不再拼接
    // 1. 检查是否包含任何已知的API端点路径
    const apiPathPatterns = [
      '/services/',
      '/chat/completions',
      '/images/generations',
      '/video/generations',
      '/videos/generations',
      '/generation',
      '/submit'  // 某些API的submit路径
    ]
    const hasApiPath = apiPathPatterns.some(pattern => baseUrl.includes(pattern))

    // 2. 检查baseUrl是否已经以path开头（用户可能直接输入了完整URL）
    const normalizedPath = path.startsWith('/') ? path : '/' + path
    const baseUrlLower = baseUrl.toLowerCase()
    const pathLower = normalizedPath.toLowerCase()
    const urlAlreadyComplete = baseUrlLower.includes(pathLower)

    const targetUrl = hasApiPath || urlAlreadyComplete
      ? baseUrl
      : `${baseUrl}${path}`

    // 如果配置了 CORS 代理，使用代理
    if (CORS_PROXY) {
      return `${CORS_PROXY}${encodeURIComponent(targetUrl)}`
    }

    return targetUrl
  }

  /**
   * 更新配置
   */
  updateConfig(config: ModelConfig) {
    this.config = config
  }

  /**
   * 发送聊天请求
   */
  async chat(messages: ChatMessage[], systemPrompt?: string): Promise<AIResponse> {
    // 根据模型类型调用不同的方法
    if (this.modelType === 'image') {
      return this.generateImage(messages[messages.length - 1]?.content || '')
    }
    if (this.modelType === 'video') {
      return this.generateVideo(messages[messages.length - 1]?.content || '')
    }

    // 文本模型处理
    try {
      const allMessages = systemPrompt
        ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
        : messages

      if (import.meta.env.DEV) {
        console.log('[AIService] 发送请求:', {
          provider: this.config.provider,
          model: this.config.model,
          baseUrl: this.config.baseUrl,
          messageCount: allMessages.length
        })
      }

      switch (this.config.provider) {
        case 'openai':
        case 'deepseek':
        case 'siliconflow':
          return await this.callOpenAICompatible(allMessages)
        case 'zhipu':
          return await this.callZhipu(allMessages)
        case 'qwen':
          return await this.callQwen(allMessages)
        case 'custom':
          return await this.callCustom(allMessages)
        default:
          return { success: false, error: '不支持的 API 提供商' }
      }
    } catch (error) {
      console.error('Chat error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '请求失败'
      }
    }
  }

  /**
   * 生成图像
   */
  async generateImage(prompt: string): Promise<AIResponse> {
    try {
      if (!this.config.apiKey) {
        return { success: false, error: '请先配置图像模型 API Key' }
      }

      switch (this.config.provider) {
        case 'openai':
          return await this.generateOpenAIImage(prompt)
        case 'zhipu':
          return await this.generateZhipuImage(prompt)
        case 'qwen':
          return await this.generateQwenImage(prompt)
        case 'siliconflow':
          return await this.generateSiliconFlowImage(prompt)
        default:
          return { success: false, error: '该提供商暂不支持图像生成' }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '图像生成失败'
      }
    }
  }

  /**
   * 生成视频
   */
  async generateVideo(prompt: string): Promise<AIResponse> {
    try {
      if (!this.config.apiKey) {
        return { success: false, error: '请先配置视频模型 API Key' }
      }

      switch (this.config.provider) {
        case 'zhipu':
          return await this.generateZhipuVideo(prompt)
        case 'qwen':
          return await this.generateQwenVideo(prompt)
        case 'siliconflow':
          return await this.generateSiliconFlowVideo(prompt)
        default:
          return { success: false, error: '该提供商暂不支持视频生成' }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '视频生成失败'
      }
    }
  }

  /**
   * OpenAI 兼容格式 API 调用 (OpenAI, DeepSeek, SiliconFlow)
   */
  private async callOpenAICompatible(messages: ChatMessage[]): Promise<AIResponse> {
    const url = this.getApiUrl('/chat/completions')
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          max_tokens: this.config.maxTokens || 4096,
          temperature: this.config.temperature || 0.7
        })
      })

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          errorMsg = errorData.error?.message || errorData.message || errorMsg
        } catch {
          errorMsg = response.statusText || errorMsg
        }
        return { success: false, error: errorMsg }
      }

      const data = await response.json()
      return {
        success: true,
        content: data.choices?.[0]?.message?.content || '',
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        }
      }
    } catch (error) {
      console.error('OpenAI compatible API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '请求失败'
      }
    }
  }

  /**
   * 智谱 AI API 调用
   */
  private async callZhipu(messages: ChatMessage[]): Promise<AIResponse> {
    const url = this.getApiUrl('/chat/completions')
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          max_tokens: this.config.maxTokens || 4096,
          temperature: this.config.temperature || 0.7
        })
      })

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          errorMsg = errorData.error?.message || errorData.message || errorMsg
        } catch {
          errorMsg = response.statusText || errorMsg
        }
        return { success: false, error: errorMsg }
      }

      const data = await response.json()
      return {
        success: true,
        content: data.choices?.[0]?.message?.content || '',
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        }
      }
    } catch (error) {
      console.error('Zhipu API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '请求失败'
      }
    }
  }

  /**
   * 通义千问 API 调用 (使用 OpenAI 兼容格式)
   */
  private async callQwen(messages: ChatMessage[]): Promise<AIResponse> {
    const url = this.getApiUrl('/chat/completions')
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          max_tokens: this.config.maxTokens || 4096,
          temperature: this.config.temperature || 0.7
        })
      })

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          errorMsg = errorData.error?.message || errorData.message || errorMsg
        } catch {
          // 如果解析JSON失败，使用状态文本
          errorMsg = response.statusText || errorMsg
        }
        return { success: false, error: errorMsg }
      }

      const data = await response.json()
      return {
        success: true,
        content: data.choices?.[0]?.message?.content || data.output?.choices?.[0]?.message?.content || '',
        usage: {
          promptTokens: data.usage?.prompt_tokens || data.usage?.input_tokens || 0,
          completionTokens: data.usage?.completion_tokens || data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.total_tokens) ||
            ((data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0) ||
            (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0))
        }
      }
    } catch (error) {
      console.error('Qwen API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '请求失败'
      }
    }
  }

  /**
   * 自定义 API 调用 (OpenAI 兼容格式)
   */
  private async callCustom(messages: ChatMessage[]): Promise<AIResponse> {
    if (!this.config.baseUrl) {
      return { success: false, error: '请配置 API Base URL' }
    }
    if (!this.config.model) {
      return { success: false, error: '请配置模型名称' }
    }

    // 尝试 OpenAI 兼容格式
    const url = this.getApiUrl('/chat/completions')
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        max_tokens: this.config.maxTokens || 4096,
        temperature: this.config.temperature || 0.7
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      return { success: false, error: error.error?.message || error.message || '请求失败' }
    }

    const data = await response.json()
    return {
      success: true,
      content: data.choices?.[0]?.message?.content || data.output || '',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      }
    }
  }

  /**
   * OpenAI DALL-E 图像生成
   */
  private async generateOpenAIImage(prompt: string): Promise<AIResponse> {
    const url = this.getApiUrl('/images/generations')
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'dall-e-3',
        prompt,
        size: `${this.config.imageSize || '1024'}x${this.config.imageSize || '1024'}`,
        quality: 'standard',
        n: 1
      })
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.error?.message || '图像生成失败' }
    }

    const data = await response.json()
    return {
      success: true,
      imageUrl: data.data?.[0]?.url || data.data?.[0]?.b64_json,
      content: '图像生成成功'
    }
  }

  /**
   * 智谱 CogView 图像生成
   */
  private async generateZhipuImage(prompt: string): Promise<AIResponse> {
    const url = this.getApiUrl('/images/generations')
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model || 'cogview-3',
          prompt
        })
      })

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          errorMsg = errorData.error?.message || errorData.message || errorMsg
        } catch {
          errorMsg = response.statusText || errorMsg
        }
        return { success: false, error: errorMsg }
      }

      const data = await response.json()
      return {
        success: true,
        imageUrl: data.data?.[0]?.url,
        content: '图像生成成功'
      }
    } catch (error) {
      console.error('Zhipu image generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '图像生成失败'
      }
    }
  }

  /**
   * 通义万相图像生成 (官方原生API)
   */
  private async generateQwenImage(prompt: string): Promise<AIResponse> {
    // 使用通义原生API: /services/aigc/multimodal-generation/generation
    const url = this.getApiUrl('/services/aigc/multimodal-generation/generation')
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model || 'qwen-image',
          input: {
            prompt: prompt
          },
          parameters: {
            size: `${this.config.imageSize || '1024'}x${this.config.imageSize || '1024'}`,
            n: 1
          }
        })
      })

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          errorMsg = errorData.error?.message || errorData.message || errorMsg
        } catch {
          errorMsg = response.statusText || errorMsg
        }
        return { success: false, error: errorMsg }
      }

      const data = await response.json()
      return {
        success: true,
        imageUrl: data.data?.[0]?.url || data.data?.[0]?.b64_json,
        content: '图像生成成功'
      }
    } catch (error) {
      console.error('Qwen image generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '图像生成失败'
      }
    }
  }

  /**
   * 硅基流动图像生成
   */
  private async generateSiliconFlowImage(prompt: string): Promise<AIResponse> {
    try {
      const url = this.getApiUrl('/images/generations')
      const isDev = import.meta.env.DEV
      console.log('请求硅基流动API:', { url, model: this.config.model, isDev, provider: this.config.provider })
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model || 'Kwai-Kolors/Kolors',
          prompt,
          image_size: this.config.imageSize ? `${this.config.imageSize}x${this.config.imageSize}` : '1024x1024',
          batch_size: 1,
          num_inference_steps: 20,
          guidance_scale: 7.5
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      const responseText = await response.text()
      console.log('硅基流动响应状态:', response.status)
      console.log('硅基流动响应内容:', responseText.slice(0, 500))
      
      if (!response.ok || !responseText) {
        let errorMsg = `API错误 ${response.status}`
        try {
          if (responseText) {
            const errorData = JSON.parse(responseText)
            errorMsg = errorData.error?.message || errorData.message || errorMsg
          }
        } catch {
          errorMsg = responseText || errorMsg
        }
        console.error('硅基流动 API 错误:', errorMsg)
        return { success: false, error: errorMsg }
      }

      let data: Record<string, unknown>
      try {
        data = JSON.parse(responseText)
      } catch {
        console.error('JSON解析失败, 响应内容:', responseText.slice(0, 200))
        return { success: false, error: '响应格式错误: ' + responseText.slice(0, 100) }
      }
      
      // 尝试多种可能的返回格式
      const imageUrl = (data.images as Array<{url?: string}>)?.[0]?.url || (data.data as Array<{url?: string}>)?.[0]?.url || (data.output as {url?: string})?.url
      
      if (!imageUrl) {
        console.error('硅基流动响应格式:', data)
        return { success: false, error: '未获取到图片URL，响应: ' + JSON.stringify(data).slice(0, 200) }
      }

      return { success: true, imageUrl, content: '图像生成成功' }
    } catch (error) {
      console.error('图像生成异常:', error)
      return { success: false, error: error instanceof Error ? error.message : '图像生成失败' }
    }
  }

  /**
   * 智谱 CogVideoX 视频生成
   */
  private async generateZhipuVideo(prompt: string): Promise<AIResponse> {
    const url = this.getApiUrl('/videos/generations')
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model || 'cogvideox',
          prompt
        })
      })

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          errorMsg = errorData.error?.message || errorData.message || errorMsg
        } catch {
          errorMsg = response.statusText || errorMsg
        }
        return { success: false, error: errorMsg }
      }

      const data = await response.json()
      return {
        success: true,
        videoUrl: data.data?.[0]?.url,
        content: '视频生成成功'
      }
    } catch (error) {
      console.error('Zhipu video generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '视频生成失败'
      }
    }
  }

  /**
   * 通义视频生成
   */
  private async generateQwenVideo(prompt: string): Promise<AIResponse> {
    // 使用通义原生API: /services/aigc/video-generation/video-synthesis
    const url = this.getApiUrl('/services/aigc/video-generation/video-synthesis')
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-DashScope-Async': 'enable'
        },
        body: JSON.stringify({
          model: this.config.model || 'wanx2.1-t2v-turbo',
          input: {
            prompt
          },
          parameters: {
            duration: this.config.videoDuration || 5,
            resolution: this.config.videoResolution || '720p'
          }
        })
      })

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          errorMsg = errorData.message || errorData.error?.message || errorMsg
        } catch {
          errorMsg = response.statusText || errorMsg
        }
        return { success: false, error: errorMsg }
      }

      const data = await response.json()
      return {
        success: true,
        videoUrl: data.output?.video_url,
        content: '视频生成成功'
      }
    } catch (error) {
      console.error('Qwen video generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '视频生成失败'
      }
    }
  }

  /**
   * 硅基流动视频生成 (OpenAI 兼容格式)
   */
  private async generateSiliconFlowVideo(prompt: string): Promise<AIResponse> {
    const url = this.getApiUrl('/video/generations')

    if (import.meta.env.DEV) {
      console.log('[SiliconFlow] 视频生成请求:', {
        url,
        model: this.config.model,
        prompt: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
        duration: this.config.videoDuration
      })
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model || 'Wan-AI/Wan2.2-T2V-A14B',
          prompt,
          duration: this.config.videoDuration || 5
        })
      })

      // 先读取响应体（只能读一次）
      const responseText = await response.text()

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}: ${response.statusText}`
        try {
          // 尝试解析JSON错误信息
          if (responseText) {
            const errorData = JSON.parse(responseText)
            errorMsg = errorData.error?.message || errorData.message || errorMsg
          }
        } catch {
          // 不是JSON，使用原始文本（截断避免过长）
          errorMsg = responseText.slice(0, 200) || errorMsg
        }
        console.error('[SiliconFlow] 视频生成失败:', errorMsg)
        return { success: false, error: errorMsg }
      }

      // 解析成功的响应
      if (!responseText) {
        return { success: false, error: '空响应' }
      }
      const data = JSON.parse(responseText)
      // 硅基流动返回格式: {code: 0, result: [{url: "...", hash: "..."}]}
      const videoUrl = data.result?.[0]?.url || data.data?.[0]?.url || data.output?.video_url
      return {
        success: true,
        videoUrl,
        content: '视频生成成功'
      }
    } catch (error) {
      console.error('SiliconFlow video generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '视频生成失败'
      }
    }
  }

  /**
   * 流式聊天 (返回 ReadableStream)
   */
  async *chatStream(messages: ChatMessage[], systemPrompt?: string): AsyncGenerator<string, void, unknown> {
    const allMessages = systemPrompt
      ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
      : messages

    // 目前支持 OpenAI 和智谱的流式输出
    if (this.config.provider === 'openai' || this.config.provider === 'zhipu' || this.config.provider === 'custom' || this.config.provider === 'deepseek' || this.config.provider === 'siliconflow') {
      const url = this.getApiUrl('/chat/completions')
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: allMessages,
          max_tokens: this.config.maxTokens || 4096,
          temperature: this.config.temperature || 0.7,
          stream: true
        })
      })

      if (!response.ok) {
        throw new Error('请求失败')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('无法获取响应流')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') return
            try {
              const json = JSON.parse(data)
              const content = json.choices?.[0]?.delta?.content
              if (content) yield content
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } else {
      // 不支持流式的提供商，使用普通请求
      const result = await this.chat(messages, systemPrompt)
      if (result.success && result.content) {
        yield result.content
      }
    }
  }
}

/**
 * 创建 AI 服务实例
 */
export function createAIService(config: ModelConfig, modelType: ModelType = 'text'): AIService {
  return new AIService(config, modelType)
}
