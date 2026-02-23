<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAIStore, useContentStore } from '@/stores'
import { getSystemPrompt, createUserPrompt } from '@/services/prompts'
import type { ContentType, Platform, ContentTypeConfig } from '@/types'
import ModelSelector from '@/components/common/ModelSelector.vue'
import { marked } from 'marked'
import { logger } from '@/utils/logger'

const route = useRoute()
const router = useRouter()
const aiStore = useAIStore()
const contentStore = useContentStore()

// 用户模板存储
const STORAGE_KEY = 'user-templates'

interface UserTemplate {
  id: string
  name: string
  contentType: ContentType
  platform: Platform
  fields: Record<string, string>
  prompt?: string
  createdAt: number
}

const userTemplates = ref<UserTemplate[]>([])

// 加载用户模板
const loadUserTemplates = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      userTemplates.value = JSON.parse(stored)
    }
  } catch (e) {
    logger.error('加载用户模板失败:', e)
  }
}

// 保存用户模板
const saveUserTemplate = (template: UserTemplate) => {
  userTemplates.value.unshift(template)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userTemplates.value))
}

// 保存模板弹窗
const showSaveTemplateModal = ref(false)
const newTemplateName = ref('')

const openSaveTemplateModal = () => {
  newTemplateName.value = ''
  showSaveTemplateModal.value = true
}

const confirmSaveTemplate = () => {
  if (!newTemplateName.value.trim()) {
    alert('请输入模板名称')
    return
  }
  
  const template: UserTemplate = {
    id: `user-${Date.now()}`,
    name: newTemplateName.value.trim(),
    contentType: selectedType.value,
    platform: selectedPlatform.value,
    fields: { ...formValues.value },
    createdAt: Date.now()
  }
  
  saveUserTemplate(template)
  showSaveTemplateModal.value = false
  alert('模板保存成功！')
}

// 行业模板传递的提示词
const templatePrompt = ref<string>('')

// 使用用户模板
const applyUserTemplate = (template: UserTemplate) => {
  isLoadingFromTemplate.value = true
  selectedType.value = template.contentType
  selectedPlatform.value = template.platform
  
  // 延迟一下确保类型切换完成，然后初始化表单
  setTimeout(() => {
    // 先根据新的内容类型初始化表单字段
    initForm()
    // 再用模板的字段值覆盖
    formValues.value = { ...formValues.value, ...template.fields }
    // 如果有提示词，保存起来用于生成
    if (template.prompt) {
      templatePrompt.value = template.prompt
    }
    // 完成后重置标志位
    isLoadingFromTemplate.value = false
  }, 100)
}

// 页面加载时从路由读取用户模板
onMounted(() => {
  loadUserTemplates()
  
  const templateData = route.query.templateData
  if (templateData) {
    try {
      const data = JSON.parse(decodeURIComponent(templateData as string))
      applyUserTemplate(data)
      // 清除URL参数
      router.replace({ path: route.path })
    } catch (e) {
      logger.error('解析模板数据失败:', e)
    }
  }
})

// 内容类型配置
const contentTypes: ContentTypeConfig[] = [
  {
    type: 'product-title',
    name: '商品标题',
    description: '生成吸引人的商品标题，优化搜索排名',
    icon: '🏷️',
    template: '',
    fields: [
      { key: 'productName', label: '商品名称', type: 'text', placeholder: '如：无线蓝牙耳机', required: true },
      { key: 'category', label: '商品类目', type: 'text', placeholder: '如：数码配件/耳机' },
      { key: 'sellingPoints', label: '核心卖点', type: 'textarea', placeholder: '如：降噪、续航长、音质好', rows: 2 },
      { key: 'targetAudience', label: '目标人群', type: 'text', placeholder: '如：年轻上班族、学生' },
      { key: 'priceRange', label: '价格区间', type: 'text', placeholder: '如：100-300元' },
      { key: 'additionalRequirements', label: '其他要求', type: 'textarea', placeholder: '其他特殊要求', rows: 2 }
    ]
  },
  {
    type: 'product-desc',
    name: '商品描述',
    description: '创作详情页文案，提升转化率',
    icon: '📋',
    template: '',
    fields: [
      { key: 'productName', label: '商品名称', type: 'text', placeholder: '如：无线蓝牙耳机', required: true },
      { key: 'category', label: '商品类目', type: 'text', placeholder: '如：数码配件/耳机' },
      { key: 'sellingPoints', label: '核心卖点', type: 'textarea', placeholder: '详细描述产品特点', rows: 3 },
      { key: 'targetAudience', label: '目标人群', type: 'text', placeholder: '如：年轻上班族' },
      { key: 'price', label: '商品价格', type: 'text', placeholder: '如：199元' },
      { key: 'specifications', label: '规格参数', type: 'textarea', placeholder: '如：颜色、尺寸、材质等', rows: 2 },
      { key: 'additionalRequirements', label: '其他要求', type: 'textarea', placeholder: '其他特殊要求', rows: 2 }
    ]
  },
  {
    type: 'short-video',
    name: '短视频脚本',
    description: '创作抖音/快手爆款视频脚本',
    icon: '🎬',
    template: '',
    fields: [
      { key: 'topic', label: '视频主题', type: 'text', placeholder: '如：产品开箱、使用教程', required: true },
      { key: 'product', label: '产品/服务', type: 'text', placeholder: '要推广的产品或服务' },
      { key: 'duration', label: '视频时长', type: 'select', options: [
        { label: '15-30秒', value: '15-30秒' },
        { label: '30-60秒', value: '30-60秒' },
        { label: '1-3分钟', value: '1-3分钟' },
        { label: '3分钟以上', value: '3分钟以上' }
      ]},
      { key: 'objective', label: '目标效果', type: 'select', options: [
        { label: '提升品牌曝光', value: '提升品牌曝光' },
        { label: '产品种草', value: '产品种草' },
        { label: '引导购买', value: '引导购买' },
        { label: '粉丝互动', value: '粉丝互动' }
      ]},
      { key: 'style', label: '风格要求', type: 'select', options: [
        { label: '轻松有趣', value: '轻松有趣' },
        { label: '专业科普', value: '专业科普' },
        { label: '情感共鸣', value: '情感共鸣' },
        { label: '快节奏爽文', value: '快节奏爽文' }
      ]},
      { key: 'additionalRequirements', label: '其他要求', type: 'textarea', placeholder: '其他特殊要求', rows: 2 }
    ]
  },
  {
    type: 'live-script',
    name: '直播话术',
    description: '专业的直播带货话术生成',
    icon: '🎤',
    template: '',
    fields: [
      { key: 'productName', label: '产品名称', type: 'text', placeholder: '要直播销售的产品', required: true },
      { key: 'liveType', label: '直播类型', type: 'select', options: [
        { label: '新品首发', value: '新品首发' },
        { label: '日常带货', value: '日常带货' },
        { label: '专场活动', value: '专场活动' },
        { label: '清仓特卖', value: '清仓特卖' }
      ]},
      { key: 'price', label: '产品价格', type: 'text', placeholder: '如：原价299，直播价199' },
      { key: 'promotion', label: '优惠活动', type: 'text', placeholder: '如：买一送一、限时折扣' },
      { key: 'scene', label: '话术环节', type: 'select', options: [
        { label: '开场暖场', value: '开场暖场' },
        { label: '产品介绍', value: '产品介绍' },
        { label: '互动答疑', value: '互动答疑' },
        { label: '促单逼单', value: '促单逼单' },
        { label: '完整话术', value: '完整话术' }
      ]},
      { key: 'additionalRequirements', label: '其他要求', type: 'textarea', placeholder: '其他特殊要求', rows: 2 }
    ]
  },
  {
    type: 'marketing-copy',
    name: '营销文案',
    description: '活动促销、节日营销文案',
    icon: '📢',
    template: '',
    fields: [
      { key: 'activityType', label: '活动类型', type: 'select', options: [
        { label: '限时折扣', value: '限时折扣' },
        { label: '满减优惠', value: '满减优惠' },
        { label: '节日营销', value: '节日营销' },
        { label: '新品上市', value: '新品上市' },
        { label: '会员专享', value: '会员专享' }
      ]},
      { key: 'theme', label: '活动主题', type: 'text', placeholder: '如：双十一狂欢节', required: true },
      { key: 'discount', label: '优惠内容', type: 'textarea', placeholder: '详细描述优惠活动内容', rows: 2 },
      { key: 'timeRange', label: '活动时间', type: 'text', placeholder: '如：11月1日-11月11日' },
      { key: 'targetAudience', label: '目标人群', type: 'text', placeholder: '如：新老客户' },
      { key: 'channel', label: '投放渠道', type: 'select', options: [
        { label: '朋友圈', value: '朋友圈' },
        { label: '社群', value: '社群' },
        { label: '短信', value: '短信' },
        { label: '公众号', value: '公众号' },
        { label: '小红书', value: '小红书' }
      ]},
      { key: 'additionalRequirements', label: '其他要求', type: 'textarea', placeholder: '其他特殊要求', rows: 2 }
    ]
  },
  {
    type: 'customer-service',
    name: '客服话术',
    description: '专业的客服回复话术',
    icon: '💬',
    template: '',
    fields: [
      { key: 'issueType', label: '问题类型', type: 'select', options: [
        { label: '售前咨询', value: '售前咨询' },
        { label: '物流查询', value: '物流查询' },
        { label: '售后退换', value: '售后退换' },
        { label: '投诉处理', value: '投诉处理' },
        { label: '催付挽留', value: '催付挽留' }
      ]},
      { key: 'userQuestion', label: '用户问题', type: 'textarea', placeholder: '用户的具体问题或诉求', rows: 2, required: true },
      { key: 'productInfo', label: '商品信息', type: 'text', placeholder: '相关商品信息' },
      { key: 'principle', label: '处理原则', type: 'select', options: [
        { label: '客户至上', value: '客户至上' },
        { label: '坚持规则', value: '坚持规则' },
        { label: '灵活处理', value: '灵活处理' }
      ]},
      { key: 'additionalRequirements', label: '其他要求', type: 'textarea', placeholder: '其他特殊要求', rows: 2 }
    ]
  },
  {
    type: 'social-media',
    name: '社媒文案',
    description: '小红书、朋友圈、社群文案',
    icon: '📱',
    template: '',
    fields: [
      { key: 'topic', label: '内容主题', type: 'text', placeholder: '如：好物分享、使用心得', required: true },
      { key: 'contentType', label: '内容类型', type: 'select', options: [
        { label: '图文种草', value: '图文种草' },
        { label: '产品测评', value: '产品测评' },
        { label: '使用教程', value: '使用教程' },
        { label: '晒单分享', value: '晒单分享' },
        { label: '品牌故事', value: '品牌故事' }
      ]},
      { key: 'product', label: '产品/品牌', type: 'text', placeholder: '要推广的产品或品牌' },
      { key: 'tone', label: '语气风格', type: 'select', options: [
        { label: '亲切真实', value: '亲切真实' },
        { label: '专业权威', value: '专业权威' },
        { label: '幽默风趣', value: '幽默风趣' },
        { label: '高端精致', value: '高端精致' }
      ]},
      { key: 'keyPoints', label: '重点内容', type: 'textarea', placeholder: '希望突出的重点信息', rows: 2 },
      { key: 'additionalRequirements', label: '其他要求', type: 'textarea', placeholder: '其他特殊要求', rows: 2 }
    ]
  }
]

// 平台选项
const platforms: { value: Platform; label: string; icon: string }[] = [
  { value: 'taobao', label: '淘宝', icon: '🛒' },
  { value: 'tmall', label: '天猫', icon: '🐱' },
  { value: 'jd', label: '京东', icon: '📦' },
  { value: 'pdd', label: '拼多多', icon: '🍊' },
  { value: 'douyin', label: '抖音', icon: '🎵' },
  { value: 'kuaishou', label: '快手', icon: '⚡' },
  { value: 'xiaohongshu', label: '小红书', icon: '📕' },
  { value: 'weixin', label: '微信', icon: '💬' },
  { value: 'other', label: '其他', icon: '📱' }
]

// 状态
const selectedType = ref<ContentType>('product-title')
const selectedPlatform = ref<Platform>('taobao')
const formValues = ref<Record<string, string>>({})
const generatedContent = ref('')
const isGenerating = ref(false)
const error = ref('')

// 是否正在从模板加载中（防止 watch 触发 initForm）
const isLoadingFromTemplate = ref(false)

// 当前选中的内容类型配置
const currentTypeConfig = computed(() => {
  return contentTypes.find(t => t.type === selectedType.value) || contentTypes[0]
})

// 初始化表单字段
const initForm = () => {
  const fields = currentTypeConfig.value.fields
  const values: Record<string, string> = {}
  fields.forEach(field => {
    if (field.type === 'select' && field.options?.length) {
      values[field.key] = field.options[0].value
    } else {
      values[field.key] = ''
    }
  })
  formValues.value = values
}

// 监听类型变化，重置表单
watch(selectedType, () => {
  if (!isLoadingFromTemplate.value) {
    initForm()
  }
  generatedContent.value = ''
  error.value = ''
})

// 生成内容
const generate = async () => {
  if (!aiStore.isConfigured) {
    error.value = '请先在设置页面配置 AI API'
    return
  }

  // 验证必填字段
  const requiredField = currentTypeConfig.value.fields.find(f => f.required && !formValues.value[f.key])
  if (requiredField) {
    error.value = `请填写${requiredField.label}`
    return
  }

  isGenerating.value = true
  error.value = ''
  generatedContent.value = ''

  try {
    const service = aiStore.getService()
    let systemPrompt: string
    let userPrompt: string

    // 如果有行业模板提示词，使用模板提示词
    if (templatePrompt.value) {
      systemPrompt = '你是一位专业的电商文案专家，擅长创作高转化率的文案。'
      // 替换模板中的占位符
      let prompt = templatePrompt.value
      for (const [key, value] of Object.entries(formValues.value)) {
        prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '')
      }
      userPrompt = prompt
    } else {
      systemPrompt = getSystemPrompt(selectedType.value)
      userPrompt = createUserPrompt(selectedType.value, formValues.value, selectedPlatform.value)
    }

    // 流式输出
    let fullContent = ''
    for await (const chunk of service.chatStream(
      [{ role: 'user', content: userPrompt }],
      systemPrompt
    )) {
      fullContent += chunk
      generatedContent.value = fullContent
    }

    // 保存到历史记录
    const title = formValues.value[currentTypeConfig.value.fields[0]?.key] || '未命名内容'
    contentStore.addContent({
      type: selectedType.value,
      platform: selectedPlatform.value,
      title,
      content: fullContent,
      params: { ...formValues.value }
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : '生成失败，请重试'
  } finally {
    isGenerating.value = false
  }
}

// 复制内容
const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(generatedContent.value)
    alert('已复制到剪贴板')
  } catch {
    alert('复制失败')
  }
}

// 渲染 Markdown 内容
const renderedContent = computed(() => {
  if (!generatedContent.value) return ''
  return marked(generatedContent.value) as string
})

// 模板定义 - 从模板库传入
interface TemplateField {
  productName?: string
  sellingPoints?: string
  targetSkin?: string
  price?: string
  ingredients?: string
  benefits?: string
  usage?: string
  videoType?: string
  duration?: string
  style?: string
  season?: string
  specs?: string
  targetUser?: string
  reviewType?: string
  pros?: string
  cons?: string
  taste?: string
  origin?: string
  material?: string
  ageRange?: string
  feature?: string
  sport?: string
  petType?: string
}

const templates: Record<string, { prompt: string; fields: TemplateField }> = {
  // 美妆模板
  'beauty-title': {
    prompt: '你是一位美妆文案专家。请为以下美妆产品创作吸引人的商品标题：\n产品名称：{productName}\n核心卖点：{sellingPoints}\n适用肤质：{targetSkin}\n价格：{price}\n\n要求：突出产品功效、使用场景，符合小红书/抖音种草风格，包含热门关键词。',
    fields: { productName: '', sellingPoints: '', targetSkin: '', price: '' }
  },
  'beauty-desc': {
    prompt: '你是一位资深美妆文案策划。请为以下产品创作详情页文案：\n产品名称：{productName}\n核心成分：{ingredients}\n主要功效：{benefits}\n使用方法：{usage}\n\n要求：包含成分科普、使用步骤、效果展示，语气专业但亲切。',
    fields: { productName: '', ingredients: '', benefits: '', usage: '' }
  },
  'beauty-video': {
    prompt: '你是一位美妆博主视频脚本策划。请创作以下类型的视频脚本：\n产品名称：{productName}\n视频类型：{videoType}\n时长：{duration}\n\n要求：开头3秒吸睛，包含产品展示、使用演示、效果对比，引导互动。',
    fields: { productName: '', videoType: '', duration: '' }
  },
  // 服饰模板
  'fashion-title': {
    prompt: '你是一位时尚电商文案专家。请为以下服饰产品创作标题：\n产品名称：{productName}\n风格定位：{style}\n适用季节：{season}\n价格：{price}\n\n要求：突出款式特点、搭配建议，吸引目标人群，包含季节关键词。',
    fields: { productName: '', style: '', season: '', price: '' }
  },
  'fashion-live': {
    prompt: '你是一位服装直播运营专家。请创作直播带货话术：\n产品名称：{productName}\n核心卖点：{sellingPoints}\n优惠信息：{price}\n尺码建议：{feature}\n\n要求：包含上身展示、面料介绍、尺码推荐、促单话术。',
    fields: { productName: '', sellingPoints: '', price: '', feature: '' }
  },
  // 数码模板
  'digital-title': {
    prompt: '你是一位数码产品文案专家。请为以下产品创作标题：\n产品名称：{productName}\n核心参数：{specs}\n目标用户：{targetUser}\n价格：{price}\n\n要求：突出核心参数、性能优势，针对科技爱好者或普通用户。',
    fields: { productName: '', specs: '', targetUser: '', price: '' }
  },
  'digital-review': {
    prompt: '你是一位数码博主脚本策划。请创作评测视频脚本：\n产品名称：{productName}\n评测类型：{reviewType}\n优点：{pros}\n缺点：{cons}\n\n要求：专业客观，包含开箱、测试、总结，给出购买建议。',
    fields: { productName: '', reviewType: '', pros: '', cons: '' }
  },
  // 食品模板
  'food-title': {
    prompt: '你是一位食品电商文案专家。请为以下食品创作标题：\n产品名称：{productName}\n口味特点：{taste}\n产地：{origin}\n价格：{price}\n\n要求：突出新鲜、美味、健康，刺激食欲，包含场景关键词。',
    fields: { productName: '', taste: '', origin: '', price: '' }
  },
  'food-desc': {
    prompt: '你是一位食品文案策划。请创作食品详情页：\n产品名称：{productName}\n配料表：{ingredients}\n营养成分：{benefits}\n储存方法：{usage}\n\n要求：突出食材来源、制作工艺、食用场景，增加信任感。',
    fields: { productName: '', ingredients: '', benefits: '', usage: '' }
  },
  // 家居模板
  'home-title': {
    prompt: '你是一位家居电商文案专家。请创作标题：\n产品名称：{productName}\n材质：{material}\n风格：{style}\n价格：{price}\n\n要求：突出品质、实用、美观，营造居家氛围。',
    fields: { productName: '', material: '', style: '', price: '' }
  },
  // 母婴模板
  'mother-title': {
    prompt: '你是一位母婴电商文案专家。请创作标题：\n产品名称：{productName}\n适用年龄：{ageRange}\n核心特点：{feature}\n价格：{price}\n\n要求：突出安全、品质、成长，让妈妈放心。',
    fields: { productName: '', ageRange: '', feature: '', price: '' }
  },
  // 运动模板
  'sports-title': {
    prompt: '你是一位运动电商文案专家。请创作标题：\n产品名称：{productName}\n运动类型：{sport}\n核心特点：{feature}\n价格：{price}\n\n要求：突出专业、舒适、性能，激发运动热情。',
    fields: { productName: '', sport: '', feature: '', price: '' }
  },
  // 宠物模板
  'pet-title': {
    prompt: '你是一位宠物电商文案专家。请创作标题：\n产品名称：{productName}\n适用宠物：{petType}\n核心特点：{feature}\n价格：{price}\n\n要求：突出关爱、健康、快乐，引起铲屎官共鸣。',
    fields: { productName: '', petType: '', feature: '', price: '' }
  }
}

// 应用模板
const applyTemplate = (templateId: string) => {
  const template = templates[templateId]
  if (!template) return
  
  // 清空表单并提示用户填写
  initForm()
}

// 初始化
onMounted(() => {
  initForm()
  // 从 URL 参数读取类型
  const typeParam = route.query.type as ContentType
  if (typeParam && contentTypes.some(t => t.type === typeParam)) {
    selectedType.value = typeParam
  }
  
  // 处理模板参数
  const templateId = route.query.template as string
  if (templateId) {
    applyTemplate(templateId)
  }
})
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <!-- 顶部工具栏 -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">
        内容创作
      </h2>
      <ModelSelector
        model-type="text"
        :show-label="true"
        size="md"
      />
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 左侧：配置表单 -->
      <div class="space-y-6">
        <!-- 内容类型选择 -->
        <div class="card">
          <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-4">
            选择内容类型
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              v-for="type in contentTypes"
              :key="type.type"
              class="p-3 rounded-lg border-2 transition-all text-left"
              :class="selectedType === type.type 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
              @click="selectedType = type.type"
            >
              <span class="text-xl">{{ type.icon }}</span>
              <div class="mt-1 font-medium text-sm">
                {{ type.name }}
              </div>
            </button>
          </div>
        </div>

        <!-- 平台选择 -->
        <div class="card">
          <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-4">
            选择平台
          </h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="platform in platforms"
              :key="platform.value"
              class="px-3 py-1.5 rounded-full border-2 text-sm transition-all"
              :class="selectedPlatform === platform.value
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300'"
              @click="selectedPlatform = platform.value"
            >
              {{ platform.icon }} {{ platform.label }}
            </button>
          </div>
        </div>

        <!-- 表单字段 -->
        <div class="card">
          <h3 class="font-semibold text-gray-800 mb-4">
            填写信息
          </h3>
          <div class="space-y-4">
            <div
              v-for="field in currentTypeConfig.fields"
              :key="field.key"
            >
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ field.label }}
                <span
                  v-if="field.required"
                  class="text-danger-500"
                >*</span>
              </label>
              
              <!-- 文本输入 -->
              <input
                v-if="field.type === 'text'"
                v-model="formValues[field.key]"
                type="text"
                :placeholder="field.placeholder"
                class="input"
              >
              
              <!-- 文本域 -->
              <textarea
                v-else-if="field.type === 'textarea'"
                v-model="formValues[field.key]"
                :placeholder="field.placeholder"
                :rows="field.rows || 3"
                class="input resize-none"
              />
              
              <!-- 选择框 -->
              <select
                v-else-if="field.type === 'select'"
                v-model="formValues[field.key]"
                class="input"
              >
                <option
                  v-for="opt in field.options"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- 生成按钮 -->
        <div class="flex gap-3">
          <button
            :disabled="isGenerating || !aiStore.isConfigured"
            class="btn-primary flex-1 py-3 text-lg"
            @click="generate"
          >
            <span
              v-if="isGenerating"
              class="animate-spin mr-2"
            >⏳</span>
            <span
              v-else
              class="mr-2"
            >✨</span>
            {{ isGenerating ? '生成中...' : '生成内容' }}
          </button>
          <button
            class="btn-secondary py-3 text-lg px-4"
            title="保存当前填写内容为模板"
            @click="openSaveTemplateModal"
          >
            💾
          </button>
        </div>

        <!-- 错误提示 -->
        <div
          v-if="error"
          class="bg-danger-50 text-danger-700 p-4 rounded-lg"
        >
          {{ error }}
        </div>
      </div>

      <!-- 右侧：生成结果 -->
      <div class="card min-h-[500px] flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-800">
            生成结果
          </h3>
          <button
            v-if="generatedContent"
            class="btn-secondary text-sm"
            @click="copyContent"
          >
            📋 复制
          </button>
        </div>
        
        <div class="flex-1 overflow-auto">
          <div
            v-if="isGenerating && !generatedContent"
            class="flex items-center justify-center h-full"
          >
            <div class="text-center text-gray-500 dark:text-gray-400">
              <span class="text-4xl animate-pulse">🤖</span>
              <p class="mt-2">
                AI 正在创作中...
              </p>
            </div>
          </div>
          
          <div
            v-else-if="generatedContent"
            class="prose prose-sm max-w-none dark:prose-invert"
            v-html="renderedContent"
          />
          
          <div
            v-else
            class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400"
          >
            <div class="text-center">
              <span class="text-4xl">📝</span>
              <p class="mt-2">
                填写左侧信息后点击生成
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 保存模板弹窗 -->
    <div
      v-if="showSaveTemplateModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showSaveTemplateModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
            保存为模板
          </h3>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              模板名称
            </label>
            <input
              v-model="newTemplateName"
              type="text"
              placeholder="例如：我的美妆标题模板"
              class="input"
              @keyup.enter="confirmSaveTemplate"
            >
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            <p>将保存以下内容：</p>
            <ul class="mt-2 list-disc list-inside">
              <li>内容类型：{{ currentTypeConfig.name }}</li>
              <li>平台：{{ platforms.find(p => p.value === selectedPlatform)?.label }}</li>
              <li>填写的信息：{{ Object.keys(formValues).filter(k => formValues[k]).length }} 项</li>
            </ul>
          </div>
        </div>
        <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            class="btn-secondary flex-1"
            @click="showSaveTemplateModal = false"
          >
            取消
          </button>
          <button
            class="btn-primary flex-1"
            @click="confirmSaveTemplate"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
