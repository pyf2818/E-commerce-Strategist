/**
 * 内容类型枚举
 */
export type ContentType = 
  | 'product-title'      // 商品标题
  | 'product-desc'       // 商品描述
  | 'short-video'        // 短视频脚本
  | 'live-script'        // 直播话术
  | 'marketing-copy'     // 营销文案
  | 'customer-service'   // 客服话术
  | 'social-media'       // 社交媒体文案

/**
 * 内容类型配置
 */
export interface ContentTypeConfig {
  type: ContentType
  name: string
  description: string
  icon: string
  template: string
  fields: ContentField[]
}

/**
 * 内容字段定义
 */
export interface ContentField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number'
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string }[]
  rows?: number
}

/**
 * 平台类型
 */
export type Platform = 
  | 'taobao'      // 淘宝
  | 'tmall'       // 天猫
  | 'jd'          // 京东
  | 'pdd'         // 拼多多
  | 'douyin'      // 抖音
  | 'kuaishou'    // 快手
  | 'xiaohongshu' // 小红书
  | 'weixin'      // 微信
  | 'other'       // 其他

/**
 * 平台配置
 */
export const PLATFORM_CONFIG: Record<Platform, { name: string; icon: string }> = {
  taobao: { name: '淘宝', icon: '🛒' },
  tmall: { name: '天猫', icon: '🐱' },
  jd: { name: '京东', icon: '📦' },
  pdd: { name: '拼多多', icon: '🍊' },
  douyin: { name: '抖音', icon: '🎵' },
  kuaishou: { name: '快手', icon: '⚡' },
  xiaohongshu: { name: '小红书', icon: '📕' },
  weixin: { name: '微信', icon: '💬' },
  other: { name: '其他', icon: '📱' }
}

/**
 * 生成内容记录
 */
export interface GeneratedContent {
  id: string
  type: ContentType
  platform: Platform
  title: string
  content: string
  params: Record<string, string>
  createdAt: number
}
