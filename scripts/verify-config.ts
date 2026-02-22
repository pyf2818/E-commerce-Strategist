/**
 * 验证大模型配置脚本
 * 检查所有提供商在三个类别的Base URL是否独立且正确
 */

import { TEXT_PROVIDER_DEFAULTS, IMAGE_PROVIDER_DEFAULTS, VIDEO_PROVIDER_DEFAULTS } from '../src/types/ai'

console.log('🔍 验证大模型配置...\n')

// 检查每个提供商的三类Base URL
const providers = ['openai', 'zhipu', 'qwen', 'deepseek', 'siliconflow', 'custom'] as const

console.log('📊 配置汇总表：\n')
console.log('提供商'.padEnd(12), '| 文本Base URL'.padEnd(45), '| 图像Base URL'.padEnd(45), '| 视频Base URL')
console.log('-'.repeat(120))

providers.forEach(provider => {
  const textBase = TEXT_PROVIDER_DEFAULTS[provider]?.baseUrl || ''
  const imageBase = IMAGE_PROVIDER_DEFAULTS[provider]?.baseUrl || ''
  const videoBase = VIDEO_PROVIDER_DEFAULTS[provider]?.baseUrl || ''

  console.log(
    provider.padEnd(12),
    '|',
    textBase.padEnd(45),
    '|',
    imageBase.padEnd(45),
    '|',
    videoBase
  )
})

console.log('\n✅ 检查项目：\n')

// 检查规则
const issues: string[] = []

// 1. 检查OpenAI: 三个类别应该都是 https://api.openai.com/v1
const openaiText = TEXT_PROVIDER_DEFAULTS.openai.baseUrl
const openaiImage = IMAGE_PROVIDER_DEFAULTS.openai.baseUrl
const openaiVideo = VIDEO_PROVIDER_DEFAULTS.openai.baseUrl
if (openaiText === 'https://api.openai.com/v1' &&
    openaiImage === 'https://api.openai.com/v1' &&
    openaiVideo === 'https://api.openai.com/v1') {
  console.log('✅ OpenAI: 三个类别Base URL一致且正确')
} else {
  issues.push('OpenAI配置不一致')
  console.log('❌ OpenAI: Base URL不匹配')
}

// 2. 检查智谱: 三个类别应该都是 https://open.bigmodel.cn/api/paas/v4
const zhipuText = TEXT_PROVIDER_DEFAULTS.zhipu.baseUrl
const zhipuImage = IMAGE_PROVIDER_DEFAULTS.zhipu.baseUrl
const zhipuVideo = VIDEO_PROVIDER_DEFAULTS.zhipu.baseUrl
if (zhipuText === 'https://open.bigmodel.cn/api/paas/v4' &&
    zhipuImage === 'https://open.bigmodel.cn/api/paas/v4' &&
    zhipuVideo === 'https://open.bigmodel.cn/api/paas/v4') {
  console.log('✅ 智谱AI: 三个类别Base URL一致且正确')
} else {
  issues.push('智谱AI配置不一致')
  console.log('❌ 智谱AI: Base URL不匹配')
}

// 3. 检查通义千问: 文本和图像用compatible-mode（因为统一为OpenAI兼容格式），视频用api/v1（原生API）
const qwenText = TEXT_PROVIDER_DEFAULTS.qwen.baseUrl
const qwenImage = IMAGE_PROVIDER_DEFAULTS.qwen.baseUrl
const qwenVideo = VIDEO_PROVIDER_DEFAULTS.qwen.baseUrl
if (qwenText === 'https://dashscope.aliyuncs.com/compatible-mode/v1' &&
    qwenImage === 'https://dashscope.aliyuncs.com/api/v1' &&
    qwenVideo === 'https://dashscope.aliyuncs.com/api/v1') {
  console.log('✅ 通义千问: 文本用compatible-mode，图像/视频用api/v1，分类正确')
} else {
  issues.push('通义千问配置错误')
  console.log('❌ 通义千问: Base URL配置不正确')
  console.log(`   文本: ${qwenText}`)
  console.log(`   图像: ${qwenImage}`)
  console.log(`   视频: ${qwenVideo}`)
}

// 4. 检查DeepSeek: 只有文本有Base URL
const deepseekText = TEXT_PROVIDER_DEFAULTS.deepseek.baseUrl
const deepseekImage = IMAGE_PROVIDER_DEFAULTS.deepseek.baseUrl
const deepseekVideo = VIDEO_PROVIDER_DEFAULTS.deepseek.baseUrl
if (deepseekText === 'https://api.deepseek.com/v1' &&
    deepseekImage === '' &&
    deepseekVideo === '') {
  console.log('✅ DeepSeek: 只有文本有Base URL，图像/视频为空，正确')
} else {
  issues.push('DeepSeek配置错误')
  console.log('❌ DeepSeek: Base URL配置不正确')
}

// 5. 检查硅基流动: 三个类别都应该是 https://api.siliconflow.cn/v1
const siliconflowText = TEXT_PROVIDER_DEFAULTS.siliconflow.baseUrl
const siliconflowImage = IMAGE_PROVIDER_DEFAULTS.siliconflow.baseUrl
const siliconflowVideo = VIDEO_PROVIDER_DEFAULTS.siliconflow.baseUrl
if (siliconflowText === 'https://api.siliconflow.cn/v1' &&
    siliconflowImage === 'https://api.siliconflow.cn/v1' &&
    siliconflowVideo === 'https://api.siliconflow.cn/v1') {
  console.log('✅ 硅基流动: 三个类别Base URL一致且正确')
} else {
  issues.push('硅基流动配置不一致')
  console.log('❌ 硅基流动: Base URL不匹配')
}

// 6. 检查custom: 所有都应该是空
const customText = TEXT_PROVIDER_DEFAULTS.custom.baseUrl
const customImage = IMAGE_PROVIDER_DEFAULTS.custom.baseUrl
const customVideo = VIDEO_PROVIDER_DEFAULTS.custom.baseUrl
if (customText === '' && customImage === '' && customVideo === '') {
  console.log('✅ 自定义: 所有Base URL为空，由用户填写')
} else {
  issues.push('自定义提供商Base URL应为空')
  console.log('❌ 自定义: Base URL应该是空')
}

// 7. 检查各提供商是否都有独立的providerApiKeys和providerBaseUrls
console.log('\n🔐 检查提供商独立的配置存储：')
providers.forEach(provider => {
  const textKeys = TEXT_PROVIDER_DEFAULTS[provider]?.providerApiKeys
  const textUrls = TEXT_PROVIDER_DEFAULTS[provider]?.providerBaseUrls

  if (textKeys && textUrls) {
    const hasAllKeys = ['openai', 'zhipu', 'qwen', 'deepseek', 'siliconflow', 'custom'].every(
      p => p in textKeys && p in textUrls
    )
    if (hasAllKeys) {
      console.log(`✅ ${provider}: providerApiKeys和providerBaseUrls包含所有提供商`)
    } else {
      issues.push(`${provider}缺少部分提供商键`)
      console.log(`❌ ${provider}: providerApiKeys/providerBaseUrls不完整`)
    }
  }
})

// 总结
console.log('\n' + '='.repeat(120))
if (issues.length === 0) {
  console.log('🎉 所有配置检查通过！')
  process.exit(0)
} else {
  console.log('⚠️  发现以下问题：')
  issues.forEach(issue => console.log(`  - ${issue}`))
  process.exit(1)
}
