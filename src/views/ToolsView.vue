<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAIStore } from '@/stores'

const aiStore = useAIStore()

interface Tool {
  id: string
  name: string
  description: string
  icon: string
  category: 'pricing' | 'content' | 'data' | 'ai' | 'reference'
  coming?: boolean
}

const tools: Tool[] = [
  // 定价工具
  { id: 'price-calculator', name: '价格计算器', description: '商品定价、利润、活动价计算', icon: '💰', category: 'pricing' },
  { id: 'discount-calculator', name: '折扣计算器', description: '满减、优惠券、拼团价计算', icon: '🏷️', category: 'pricing' },
  { id: 'roi-calculator', name: 'ROI计算器', description: '投入产出比、盈亏平衡计算', icon: '📈', category: 'pricing' },
  { id: 'shipping-calculator', name: '运费计算器', description: '多快递比价、续重计算', icon: '📦', category: 'pricing' },
  
  // 内容工具
  { id: 'prohibited-words', name: '违禁词检测', description: '广告法+平台敏感词检测', icon: '🚫', category: 'content' },
  { id: 'character-counter', name: '字数统计', description: '文案字数、字符数统计', icon: '📊', category: 'content' },
  { id: 'title-checker', name: '标题检查器', description: '各平台标题字数规范', icon: '✏️', category: 'content' },
  { id: 'content-compare', name: '内容对比', description: '对比两个版本的差异', icon: '⚖️', category: 'content' },
  { id: 'seo-analysis', name: 'SEO分析', description: '关键词密度与优化建议', icon: '🔍', category: 'content' },
  
  // 数据分析
  { id: 'image-sizes', name: '图片尺寸库', description: '电商平台图片规范大全', icon: '🖼️', category: 'reference' },
  { id: 'calendar', name: '活动日历', description: '电商全年营销节点', icon: '📅', category: 'reference' },
  
  // AI智能
  { id: 'competitor', name: '竞品分析', description: 'AI分析竞品与差异化策略', icon: '🎯', category: 'ai' },
  { id: 'review-analysis', name: '评价分析', description: 'AI智能分析好评/差评', icon: '💬', category: 'ai' },
]

const categories = [
  { id: 'pricing', name: '定价工具', icon: '💰' },
  { id: 'content', name: '内容工具', icon: '📝' },
  { id: 'reference', name: '参考资料', icon: '📚' },
  { id: 'ai', name: 'AI智能', icon: '🤖' },
]

const selectedCategory = ref('all')

const filteredTools = computed(() => {
  if (selectedCategory.value === 'all') return tools
  return tools.filter(t => t.category === selectedCategory.value)
})

// 当前选中的工具
const selectedTool = ref<string | null>(null)

const selectTool = (id: string) => {
  if (tools.find(t => t.id === id)?.coming) return
  selectedTool.value = selectedTool.value === id ? null : id
}

// ========== 价格计算器 ==========
const priceForm = ref({
  cost: 0,
  shipping: 8,
  platform: 5,
  targetProfit: 30,
  hasCoupon: false,
  couponValue: 0,
})

const priceResult = computed(() => {
  const { cost, shipping, platform, targetProfit, hasCoupon, couponValue } = priceForm.value
  const subtotal = cost + shipping + platform
  const costWithProfit = subtotal * (1 + targetProfit / 100)
  const finalPrice = hasCoupon ? costWithProfit - couponValue : costWithProfit
  const profit = finalPrice - subtotal
  const profitRate = subtotal > 0 ? (profit / subtotal * 100) : 0
  
  return {
    subtotal: subtotal.toFixed(2),
    costWithProfit: costWithProfit.toFixed(2),
    finalPrice: Math.ceil(finalPrice * 100) / 100,
    profit: profit.toFixed(2),
    profitRate: profitRate.toFixed(1),
  }
})

// ========== 折扣计算器 ==========
const discountForm = ref({
  originalPrice: 100,
  discount: 0,
  coupon: 0,
 满减: false,
  满减门槛: 200,
  满减金额: 20,
  isMember: false,
  memberDiscount: 10,
})

const discountResult = computed(() => {
  const { originalPrice, discount, coupon, 满减, 满减门槛, 满减金额, isMember, memberDiscount } = discountForm.value
  
  let price = originalPrice
  let totalDiscount = 0
  
  // 折扣
  if (discount > 0) {
    price *= (1 - discount / 100)
    totalDiscount += originalPrice * (discount / 100)
  }
  
  // 优惠券
  if (coupon > 0) {
    price -= coupon
    totalDiscount += coupon
  }
  
  // 满减
  if (满减 && originalPrice >= 满减门槛) {
    price -= 满减金额
    totalDiscount += 满减金额
  }
  
  // 会员价
  let memberSavings = 0
  if (isMember) {
    memberSavings = price * (memberDiscount / 100)
    price -= memberSavings
    totalDiscount += memberSavings
  }
  
  price = Math.max(0, price)
  const finalDiscountRate = ((totalDiscount / originalPrice) * 100).toFixed(1)
  
  return {
    finalPrice: price.toFixed(2),
    totalDiscount: totalDiscount.toFixed(2),
    finalDiscountRate,
    memberSavings: memberSavings.toFixed(2),
  }
})

// ========== ROI计算器 ==========
const roiForm = ref({
  spend: 1000,
  revenue: 5000,
  productCost: 2000,
  shipping: 500,
  platformFee: 250,
  otherCost: 0,
})

const roiResult = computed(() => {
  const { spend, revenue, productCost, shipping, platformFee, otherCost } = roiForm.value
  const totalCost = productCost + shipping + platformFee + otherCost
  const profit = revenue - totalCost - spend
  const roi = spend > 0 ? ((revenue - spend) / spend * 100) : 0
  const roas = spend > 0 ? (revenue / spend) : 0
  const 毛利率 = revenue > 0 ? ((profit + spend) / revenue * 100) : 0
  const 盈亏平衡 = totalCost > 0 ? ((totalCost + spend) / (1 - platformFee/revenue)) : 0
  
  return {
    profit: profit.toFixed(2),
    roi: roi.toFixed(1),
    roas: roas.toFixed(2),
    毛利率: 毛利率.toFixed(1),
    盈亏平衡: 盈亏平衡.toFixed(2),
    isProfit: profit > 0,
  }
})

// ========== 运费计算器 ==========
const shippingForm = ref({
  weight: 1,
  distance: 'same',
  firstWeight: 8,
 续重: 2,
})

const shippingCarriers = ref([
  { name: '顺丰', 首重1kg: 12, 续重1kg: 5, 时效: '次日达', 特点: '速度快' },
  { name: '圆通', 首重1kg: 8, 续重1kg: 3, 时效: '2-3天', 特点: '性价比高' },
  { name: '韵达', 首重1kg: 7, 续重1kg: 2, 时效: '2-3天', 特点: '价格低' },
  { name: '中通', 首重1kg: 8, 续重1kg: 3, 时效: '2-3天', 特点: '网点多' },
  { name: '极兔', 首重1kg: 6, 续重1kg: 2, 时效: '2-3天', 特点: '最便宜' },
])

const shippingResult = computed(() => {
  const { weight, distance } = shippingForm.value
  
  return shippingCarriers.value.map(carrier => {
    const actualFirstWeight = distance === 'same' ? carrier['首重1kg'] : carrier['首重1kg'] * 1.5
    const actual续重 = distance === 'same' ? carrier['续重1kg'] : carrier['续重1kg'] * 1.5
    
    let cost: number
    if (weight <= 1) {
      cost = actualFirstWeight
    } else {
      cost = actualFirstWeight + (weight - 1) * actual续重
    }
    
    return {
      ...carrier,
      cost: Math.ceil(cost * 100) / 100,
      weight,
    }
  }).sort((a, b) => a.cost - b.cost)
})

// ========== 违禁词检测 ==========
const prohibitedWordsDB = {
  // 广告法违禁词
  advertising: [
    '第一', '唯一', '最', '顶级', '极致', '完美', '绝对', '顶尖', '至高', '顶级',
    '100%', '零风险', '无风险', '包治', '根治', '无效退款', '立即见效',
    '最好', '最强', '最大', '最便宜', '最低价', '全网最低', '世界领先',
    '国家级', '最高级', '顶级', '绝无仅有', '空前', '史无前例',
    '万能', '全能', '全能型', '彻底', '完全', '100%有效',
    '立竿见影', '即刻', '马上', '瞬间', '只需', '只需一次',
    '保证', '保准', '保障', '赔付', '包赔', '全额退款',
  ],
  // 平台敏感词
  platform: [
    '微信', 'QQ', '二维码', '加微信', '私聊', '转账', '支付宝',
    '刷单', '虚假交易', '好评返现', '返现', '现金', '红包',
    '原单', '尾单', 'A货', '高仿', '精仿', '假货', '山寨',
    '涉黄', '涉赌', '毒品', '枪支', '军火', '武器',
    '色情', '性感', '诱惑', '丰满', '透视', '漏点',
    '政治', '领导人', '独裁', '反政府', '邪教', '法轮功',
    '野生', '保护动物', '珍惜', '濒危', '红豆', '沉香', '檀香',
  ],
  // 行业违禁词 - 美妆
  cosmetics: [
    '美白', '祛斑', '祛痘', '去皱', '去眼袋', '去黑头',
    '永久', '彻底祛除', '一次见效', '三天祛斑', '七天美白',
    '药妆', '医用', '医院研制', '医生推荐', '临床试验',
    '无添加', '纯天然', '100%纯天然', '有机',
  ],
  // 行业违禁词 - 食品
  food: [
    '无添加', '纯天然', '有机', '绿色', '无污染',
    '保健', '保健品', '养生', '滋补', '补肾', '壮阳', '降血压',
    '增高', '减肥', '瘦身', '燃脂', '排毒', '清肠',
    '增高', '长高', '发育', '增高药',
    '抗癌', '防癌', '治癌', '抑制肿瘤',
  ],
}

const checkText = ref('')
const selectedWordType = ref<keyof typeof prohibitedWordsDB>('advertising')
const foundWords = ref<{ word: string; type: string }[]>([])

const checkProhibited = () => {
  foundWords.value = []
  const words = prohibitedWordsDB[selectedWordType.value] || []
  words.forEach(word => {
    if (checkText.value.includes(word)) {
      foundWords.value.push({ word, type: selectedWordType.value })
    }
  })
}

const checkAllProhibited = () => {
  foundWords.value = []
  Object.entries(prohibitedWordsDB).forEach(([type, words]) => {
    words.forEach(word => {
      if (checkText.value.includes(word)) {
        foundWords.value.push({ word, type })
      }
    })
  })
  selectedWordType.value = 'advertising'
}

// ========== 字数统计 ==========
const textContent = ref('')
const textStats = computed(() => {
  const text = textContent.value
  return {
    chars: text.length,
    charsNoSpace: text.replace(/[\s\n]/g, '').length,
    charsWithSpace: text.replace(/[^\s]/g, '').length,
    words: text.trim() ? text.trim().split(/[\s\n]+/).length : 0,
    lines: text.split('\n').length,
    paragraphs: text.split(/\n\n+/).filter(p => p.trim()).length,
  }
})

// ========== 标题检查器 ==========
const titleText = ref('')
const selectedPlatform = ref('taobao')

const platformLimits = {
  taobao: { max: 30, recommended: 30, tips: '30字以内，核心词放两端' },
  tmall: { max: 40, recommended: 35, tips: '40字以内，品牌词+核心词+属性词' },
  douyin: { max: 55, recommended: 50, tips: '55字，移动端优先，关键信息前置' },
  xiaohongshu: { max: 20, recommended: 18, tips: '20字以内，突出卖点' },
  pinduoduo: { max: 30, recommended: 28, tips: '30字，价格词+品类词+属性词' },
}

const titleCheckResult = computed(() => {
  const len = titleText.value.length
  const limit = platformLimits[selectedPlatform.value as keyof typeof platformLimits]
  const remaining = limit.max - len
  
  let status: 'ok' | 'warning' | 'error'
  if (remaining >= 0 && len > 0) status = len <= limit.recommended ? 'ok' : 'warning'
  else status = 'error'
  
  const suggestions: string[] = []
  if (remaining < 0) suggestions.push(`超出 ${Math.abs(remaining)} 个字符，请精简`)
  if (len < 10) suggestions.push('标题过短，建议增加卖点描述')
  if (!/\d/.test(titleText.value)) suggestions.push('建议添加数字，如"3步"、"7天"')
  if (!/[热销|新款|爆款|推荐]/.test(titleText.value)) suggestions.push('建议添加营销词')
  
  return { len, remaining, status, suggestions, limit }
})

// ========== 内容对比 ==========
const compareText1 = ref('')
const compareText2 = ref('')
const compareResult = ref<{
  added: string[]
  removed: string[]
  unchanged: string[]
  similarity: number
} | null>(null)

const compareContents = () => {
  const lines1 = compareText1.value.split('\n').filter(l => l.trim())
  const lines2 = compareText2.value.split('\n').filter(l => l.trim())
  
  const added = lines2.filter(l => !lines1.includes(l))
  const removed = lines1.filter(l => !lines2.includes(l))
  const unchanged = lines1.filter(l => lines2.includes(l))
  
  const total = Math.max(lines1.length, lines2.length)
  const similarity = total > 0 ? Math.round((unchanged.length / total) * 100) : 0
  
  compareResult.value = { added, removed, unchanged, similarity }
}

// ========== SEO分析 ==========
const seoText = ref('')
const seoKeywords = ref('')
const seoResult = ref<{
  keywordDensity: { keyword: string; count: number; density: string }[]
  suggestions: string[]
  score: number
  readability: { level: string; score: number }
} | null>(null)

const analyzeSEO = () => {
  if (!seoText.value.trim()) return
  
  const text = seoText.value
  const keywords = seoKeywords.value.split(/[,，\s]+/).filter(k => k.trim())
  const totalWords = text.replace(/[\s\n]/g, '').length
  
  // 关键词密度分析
  const keywordDensity = keywords.map(keyword => {
    const regex = new RegExp(keyword, 'gi')
    const matches = text.match(regex) || []
    const density = ((matches.length * keyword.length) / totalWords * 100).toFixed(2)
    return { keyword, count: matches.length, density: `${density}%` }
  })
  
  // 优化建议
  const suggestions: string[] = []
  keywordDensity.forEach(item => {
    const densityNum = parseFloat(item.density)
    if (densityNum < 1) suggestions.push(`"${item.keyword}" 密度较低，建议适当增加`)
    else if (densityNum > 5) suggestions.push(`"${item.keyword}" 密度过高，可能被判定为关键词堆砌`)
  })
  if (text.length < 50) suggestions.push('内容较短，建议增加更多描述')
  
  // SEO评分
  let score = 60
  keywordDensity.forEach(item => {
    const densityNum = parseFloat(item.density)
    if (densityNum >= 1 && densityNum <= 3) score += 10
    else if (densityNum > 3 && densityNum <= 5) score += 5
  })
  if (text.length >= 100) score += 10
  if (text.length >= 200) score += 10
  score = Math.min(100, score)
  
  // 可读性分析
  const avgLength = text.length / text.split(/[。！？]/).length
  let readabilityLevel = '一般'
  let readabilityScore = 60
  if (avgLength < 20) { readabilityLevel = '优秀'; readabilityScore = 95 }
  else if (avgLength < 30) { readabilityLevel = '良好'; readabilityScore = 80 }
  else if (avgLength < 50) { readabilityLevel = '一般'; readabilityScore = 60 }
  else { readabilityLevel = '较差'; readabilityScore = 40 }
  
  seoResult.value = { keywordDensity, suggestions, score, readability: { level: readabilityLevel, score: readabilityScore } }
}

// ========== 图片尺寸库 ==========
const imageSizes = {
  taobao: [
    { name: '主图', size: '800x800', ratio: '1:1', tips: '白底，纯色背景' },
    { name: '主图视频', size: '9:16 或 1:1', ratio: '9:16', tips: '15-30秒，突出卖点' },
    { name: 'SKU图', size: '800x800', ratio: '1:1', tips: '每个SKU单独上传' },
    { name: '详情页宽度', size: '750px', ratio: '固定', tips: '移动端优先' },
  ],
  tmall: [
    { name: '主图', size: '800x800', ratio: '1:1', tips: '白底，品牌LOGO左上角' },
    { name: '主图视频', size: '9:16', ratio: '9:16', tips: '30秒以内' },
    { name: '详情页', size: '750px', ratio: '固定', tips: '图+文结合' },
  ],
  douyin: [
    { name: '短视频封面', size: '1080x1920', ratio: '9:16', tips: '竖版，高清' },
    { name: '直播封面', size: '1080x1920', ratio: '9:16', tips: '竖版，吸引眼球' },
    { name: '商品主图', size: '800x800', ratio: '1:1', tips: '白底图' },
    { name: '商品详情', size: '750x1000', ratio: '3:4', tips: '竖版图文' },
  ],
  xiaohongshu: [
    { name: '封面图', size: '1242x1660', ratio: '3:4', tips: '竖版，高清美观' },
    { name: '正文图片', size: '1080x1440', ratio: '3:4', tips: '竖版' },
    { name: '商品图', size: '800x800', ratio: '1:1', tips: '白底图' },
  ],
  pinduoduo: [
    { name: '主图', size: '800x800', ratio: '1:1', tips: '低价吸引' },
    { name: 'SKU图', size: '800x800', ratio: '1:1', tips: '规格清晰' },
    { name: '详情图', size: '800x1600', ratio: '1:2', tips: '长图' },
  ],
}

const selectedImagePlatform = ref<keyof typeof imageSizes>('taobao')

// ========== 活动日历 ==========
const selectedYear = ref(new Date().getFullYear())

const calendarEvents = {
  '1月': [
    { name: '元旦大促', date: '1月1日', platforms: ['全平台'], importance: 'high', description: '新年第一场大促，辞旧迎新' },
    { name: '年货节', date: '1月中旬', platforms: ['淘宝', '天猫', '京东'], importance: 'high', description: '春节前最后一次大型促销' },
  ],
  '2月': [
    { name: '春节不打烊', date: '2月', platforms: ['全平台'], importance: 'medium', description: '春节期间正常发货，物流有保障' },
    { name: '情人节', date: '2月14日', platforms: ['全平台'], importance: 'medium', description: '礼物类目旺季，鲜花、巧克力、首饰' },
  ],
  '3月': [
    { name: '女王节', date: '3月8日', platforms: ['淘宝', '天猫', '京东'], importance: 'high', description: '女性消费主会场，美妆、服装' },
    { name: '春装上新', date: '3月', platforms: ['全平台'], importance: 'medium', description: '换季服装上新期' },
  ],
  '4月': [
    { name: '春季家装节', date: '4月', platforms: ['淘宝', '天猫'], importance: 'medium', description: '家居、家电旺季' },
    { name: '读书日', date: '4月23日', platforms: ['京东'], importance: 'low', description: '图书、文具促销' },
  ],
  '5月': [
    { name: '五一出行季', date: '5月1日', platforms: ['全平台'], importance: 'medium', description: '出行、户外装备热销' },
    { name: '母亲节', date: '5月第二个周日', platforms: ['全平台'], importance: 'high', description: '礼物、保健品、化妆品' },
    { name: '520表白日', date: '5月20日', platforms: ['全平台'], importance: 'high', description: '情人节后第二大表白日' },
  ],
  '6月': [
    { name: '618大促', date: '6月18日', platforms: ['京东', '淘宝', '天猫'], importance: 'high', description: '京东主战场，全年第二大促' },
    { name: '父亲节', date: '6月第三个周日', platforms: ['全平台'], importance: 'medium', description: '男士用品、茶叶、酒类' },
    { name: '年中清仓', date: '6月下旬', platforms: ['全平台'], importance: 'medium', description: '夏装清仓，春装甩卖' },
  ],
  '7月': [
    { name: '暑期清凉节', date: '7月', platforms: ['全平台'], importance: 'medium', description: '空调、风扇、防晒用品' },
    { name: '七夕情人节', date: '7月7日', platforms: ['全平台'], importance: 'high', description: '中国传统情人节' },
  ],
  '8月': [
    { name: '818发烧节', date: '8月18日', platforms: ['苏宁'], importance: 'medium', description: '家电、3C数码' },
    { name: '暑期特惠', date: '8月', platforms: ['全平台'], importance: 'medium', description: '学生用品、旅游产品' },
  ],
  '9月': [
    { name: '99划算节', date: '9月9日', platforms: ['天猫', '淘宝'], importance: 'high', description: '天猫年度大促之一' },
    { name: '中秋节', date: '9月', platforms: ['全平台'], importance: 'high', description: '月饼、礼品、酒类' },
    { name: '丰收节', date: '9月', platforms: ['拼多多'], importance: 'medium', description: '农产品上行' },
  ],
  '10月': [
    { name: '国庆黄金周', date: '10月1日', platforms: ['全平台'], importance: 'high', description: '全年最长假期，出行用品' },
    { name: '双十预热', date: '10月中旬', platforms: ['全平台'], importance: 'medium', description: '为双十一做准备' },
  ],
  '11月': [
    { name: '双十一', date: '11月11日', platforms: ['全平台'], importance: 'high', description: '全年最大促销，全年GMV最高' },
    { name: '黑五狂欢', date: '11月第四个周五', platforms: ['亚马逊', '考拉'], importance: 'medium', description: '跨境商品、海淘' },
    { name: '双十二预热', date: '11月下旬', platforms: ['淘宝', '天猫'], importance: 'medium', description: '双十一返场' },
  ],
  '12月': [
    { name: '双十二', date: '12月12日', platforms: ['淘宝', '天猫'], importance: 'high', description: '双十一返场，年最后一次大促' },
    { name: '双旦促销', date: '12月下旬', platforms: ['全平台'], importance: 'medium', description: '圣诞+元旦' },
    { name: '年货节预热', date: '12月底', platforms: ['全平台'], importance: 'medium', description: '为年货节做准备' },
  ],
}

const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const getImportanceColor = (importance: string) => {
  switch (importance) {
    case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const getImportanceLabel = (importance: string) => {
  switch (importance) {
    case 'high': return '🔥 热门'
    case 'medium': return '📈 重要'
    case 'low': return '📌 一般'
    default: return importance
  }
}

// ========== 竞品分析 ==========
const competitorForm = ref({
  competitorName: '',
  ourProduct: '',
  ourAdvantage: '',
})
const isAnalyzing = ref(false)
const competitorResult = ref<string>('')

const analyzeCompetitor = async () => {
  if (!aiStore.isConfigured) { alert('请先配置 AI API'); return }
  isAnalyzing.value = true
  competitorResult.value = ''
  try {
    const service = aiStore.getService()
    const result = await service.chat([
      { role: 'user', content: `竞品分析请求：
竞品：${competitorForm.value.competitorName || '未知'}
我们的产品：${competitorForm.value.ourProduct}
我们的优势：${competitorForm.value.ourAdvantage || '待分析'}
请提供：1.竞品分析 2.营销建议 3.差异化文案示例` }
    ], '你是电商竞品分析专家。')
    if (result.success && result.content) {
      competitorResult.value = result.content
    }
  } catch (e) {
    alert(e instanceof Error ? e.message : '分析失败')
  } finally {
    isAnalyzing.value = false
  }
}

// ========== 评价分析 ==========
const reviewForm = ref({
  reviewType: 'all',
  reviews: '',
})
const isReviewAnalyzing = ref(false)
const reviewResult = ref<string>('')

const analyzeReviews = async () => {
  if (!aiStore.isConfigured) { alert('请先配置 AI API'); return }
  if (!reviewForm.value.reviews.trim()) { alert('请输入评价内容'); return }
  isReviewAnalyzing.value = true
  reviewResult.value = ''
  try {
    const service = aiStore.getService()
    const prompt = reviewForm.value.reviewType === 'all' 
      ? `分析以下电商评价，提取用户关注点、情感倾向、改进建议：\n${reviewForm.value.reviews}`
      : `分析以下${reviewForm.value.reviewType === 'positive' ? '好评' : '差评'}，总结特点和改进建议：\n${reviewForm.value.reviews}`
    
    const result = await service.chat([
      { role: 'user', content: prompt }
    ], '你是电商数据分析专家，擅长评价分析。')
    if (result.success && result.content) {
      reviewResult.value = result.content
    }
  } catch (e) {
    alert(e instanceof Error ? e.message : '分析失败')
  } finally {
    isReviewAnalyzing.value = false
  }
}
</script>

<template>
  <div class="space-y-8 relative">
    <!-- 页面标题 - 高级渐变设计 -->
    <div class="relative overflow-hidden rounded-3xl">
      <div class="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700" />
      <div class="absolute inset-0 bg-gradient-to-tl from-pink-500/20 via-transparent to-transparent" />
      <div class="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-floating" />
      <div class="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl animate-floating floating-delay-1" />
      <div class="relative px-8 py-8">
        <div class="flex items-center justify-between">
          <div>
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm mb-4 animate-slide-up">
              <span class="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              实用工具集
            </div>
            <h2 class="text-3xl font-bold text-white mb-2 animate-slide-up animation-delay-100">
              工具箱
            </h2>
            <p class="text-white/80 animate-slide-up animation-delay-200">
              实用的电商运营工具集
            </p>
          </div>
          <div class="hidden md:block text-right animate-slide-up animation-delay-300">
            <div class="text-3xl font-bold text-white">
              {{ tools.filter(t => !t.coming).length }}
            </div>
            <div class="text-sm text-white/70">
              个工具
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类筛选 -->
    <div class="card bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
      <div class="flex flex-wrap gap-3">
        <button
          class="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
          :class="selectedCategory === 'all'
            ? 'bg-gradient-to-r from-primary-500 to-teal-500 text-white shadow-lg shadow-primary-500/25'
            : 'bg-gray-100/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 hover:shadow-md'"
          @click="selectedCategory = 'all'"
        >
          全部工具
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
          :class="selectedCategory === cat.id
            ? 'bg-gradient-to-r from-primary-500 to-teal-500 text-white shadow-lg shadow-primary-500/25'
            : 'bg-gray-100/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 hover:shadow-md'"
          @click="selectedCategory = cat.id"
        >
          {{ cat.icon }} {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- 工具列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="tool in filteredTools"
        :key="tool.id"
        class="card-hover relative cursor-pointer"
        :class="{ 'opacity-60 cursor-not-allowed': tool.coming }"
        @click="selectTool(tool.id)"
      >
        <div class="flex items-center gap-4">
          <span class="text-3xl">{{ tool.icon }}</span>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-800 dark:text-gray-200">
              {{ tool.name }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ tool.description }}
            </p>
          </div>
        </div>
        <span 
          v-if="tool.coming" 
          class="absolute top-2 right-2 px-2 py-0.5 bg-gray-600 text-white text-xs rounded"
        >
          即将上线
        </span>
      </div>
    </div>

    <!-- ========== 价格计算器 ========== -->
    <div
      v-if="selectedTool === 'price-calculator'"
      class="card"
    >
      <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-4">
        💰 价格计算器
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">商品成本（元）</label>
          <input
            v-model.number="priceForm.cost"
            type="number"
            class="input"
            min="0"
            step="0.01"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">运费成本（元）</label>
          <input
            v-model.number="priceForm.shipping"
            type="number"
            class="input"
            min="0"
            step="0.01"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">平台扣点（元）</label>
          <input
            v-model.number="priceForm.platform"
            type="number"
            class="input"
            min="0"
            step="0.01"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">预期毛利率（%）</label>
          <input
            v-model.number="priceForm.targetProfit"
            type="number"
            class="input"
            min="0"
            max="100"
          >
        </div>
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="priceForm.hasCoupon"
            type="checkbox"
            class="checkbox"
          >
          <span class="text-sm text-gray-700 dark:text-gray-300">使用优惠券</span>
        </label>
        <input
          v-if="priceForm.hasCoupon"
          v-model.number="priceForm.couponValue"
          type="number"
          class="input w-32"
          placeholder="优惠金额"
          min="0"
        >
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
          <div class="text-xs text-gray-500">
            成本小计
          </div>
          <div class="text-xl font-bold text-gray-800 dark:text-gray-200">
            ¥{{ priceResult.subtotal }}
          </div>
        </div>
        <div class="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-center">
          <div class="text-xs text-gray-500">
            加{{ priceForm.targetProfit }}%利润
          </div>
          <div class="text-xl font-bold text-primary-600">
            ¥{{ priceResult.costWithProfit }}
          </div>
        </div>
        <div class="p-4 bg-primary-100 dark:bg-primary-900/50 rounded-lg text-center">
          <div class="text-xs text-primary-600">
            建议售价
          </div>
          <div class="text-2xl font-bold text-primary-600">
            ¥{{ priceResult.finalPrice }}
          </div>
        </div>
        <div class="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg text-center">
          <div class="text-xs text-green-600">
            预估利润
          </div>
          <div
            class="text-xl font-bold"
            :class="parseFloat(priceResult.profit) >= 0 ? 'text-green-600' : 'text-red-600'"
          >
            ¥{{ priceResult.profit }} ({{ priceResult.profitRate }}%)
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 折扣计算器 ========== -->
    <div
      v-if="selectedTool === 'discount-calculator'"
      class="card"
    >
      <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-4">
        🏷️ 折扣计算器
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">商品原价（元）</label>
          <input
            v-model.number="discountForm.originalPrice"
            type="number"
            class="input"
            min="0"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">折扣（%）</label>
          <input
            v-model.number="discountForm.discount"
            type="number"
            class="input"
            min="0"
            max="100"
            placeholder="如：8折填80"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">店铺优惠券（元）</label>
          <input
            v-model.number="discountForm.coupon"
            type="number"
            class="input"
            min="0"
            placeholder="无则填0"
          >
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="discountForm.满减"
            type="checkbox"
            class="checkbox"
          >
          <span class="text-sm">满减活动</span>
        </label>
        <template v-if="discountForm.满减">
          <input
            v-model.number="discountForm.满减门槛"
            type="number"
            class="input w-24"
            placeholder="门槛"
          >
          <span class="text-gray-400">减</span>
          <input
            v-model.number="discountForm.满减金额"
            type="number"
            class="input w-24"
            placeholder="金额"
          >
        </template>
        <label class="flex items-center gap-2 cursor-pointer ml-auto">
          <input
            v-model="discountForm.isMember"
            type="checkbox"
            class="checkbox"
          >
          <span class="text-sm">会员价</span>
        </label>
        <template v-if="discountForm.isMember">
          <input
            v-model.number="discountForm.memberDiscount"
            type="number"
            class="input w-20"
            placeholder="折扣"
          >
          <span class="text-gray-400">折</span>
        </template>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div class="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-center">
          <div class="text-xs text-primary-600">
            最终价
          </div>
          <div class="text-3xl font-bold text-primary-600">
            ¥{{ discountResult.finalPrice }}
          </div>
        </div>
        <div class="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg text-center">
          <div class="text-xs text-green-600">
            优惠总额
          </div>
          <div class="text-2xl font-bold text-green-600">
            ¥{{ discountResult.totalDiscount }}
          </div>
          <div class="text-xs text-green-500">
            {{ discountResult.finalDiscountRate }}% off
          </div>
        </div>
        <div class="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center">
          <div class="text-xs text-blue-600">
            会员节省
          </div>
          <div class="text-xl font-bold text-blue-600">
            ¥{{ discountResult.memberSavings }}
          </div>
        </div>
      </div>
    </div>

    <!-- ========== ROI计算器 ========== -->
    <div
      v-if="selectedTool === 'roi-calculator'"
      class="card"
    >
      <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-4">
        📈 ROI计算器
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">推广花费（元）</label>
          <input
            v-model.number="roiForm.spend"
            type="number"
            class="input"
            min="0"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">销售额（元）</label>
          <input
            v-model.number="roiForm.revenue"
            type="number"
            class="input"
            min="0"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">商品成本（元）</label>
          <input
            v-model.number="roiForm.productCost"
            type="number"
            class="input"
            min="0"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">运费成本（元）</label>
          <input
            v-model.number="roiForm.shipping"
            type="number"
            class="input"
            min="0"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">平台扣点（元）</label>
          <input
            v-model.number="roiForm.platformFee"
            type="number"
            class="input"
            min="0"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">其他成本（元）</label>
          <input
            v-model.number="roiForm.otherCost"
            type="number"
            class="input"
            min="0"
          >
        </div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div
          class="p-4 rounded-lg text-center"
          :class="roiResult.isProfit ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'"
        >
          <div class="text-xs text-gray-500">
            利润
          </div>
          <div
            class="text-2xl font-bold"
            :class="roiResult.isProfit ? 'text-green-600' : 'text-red-600'"
          >
            ¥{{ roiResult.profit }}
          </div>
        </div>
        <div class="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-center">
          <div class="text-xs text-primary-600">
            ROI
          </div>
          <div class="text-2xl font-bold text-primary-600">
            {{ roiResult.roi }}%
          </div>
        </div>
        <div class="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center">
          <div class="text-xs text-blue-600">
            ROAS
          </div>
          <div class="text-2xl font-bold text-blue-600">
            {{ roiResult.roas }}
          </div>
        </div>
        <div class="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-center">
          <div class="text-xs text-purple-600">
            毛利率
          </div>
          <div class="text-2xl font-bold text-purple-600">
            {{ roiResult.毛利率 }}%
          </div>
        </div>
        <div class="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg text-center">
          <div class="text-xs text-yellow-600">
            盈亏平衡
          </div>
          <div class="text-xl font-bold text-yellow-600">
            ¥{{ roiResult.盈亏平衡 }}
          </div>
        </div>
      </div>
      <div
        class="mt-4 p-4 rounded-lg"
        :class="roiResult.isProfit ? 'bg-green-100 dark:bg-green-900/20 text-green-700' : 'bg-red-100 dark:bg-red-900/20 text-red-700'"
      >
        {{ roiResult.isProfit ? '✅ 盈利状态 - 本次推广盈利 ¥' + roiResult.profit : '⚠️ 亏损状态 - 本次推广亏损 ¥' + Math.abs(parseFloat(roiResult.profit)) }}
      </div>
    </div>

    <!-- ========== 运费计算器 ========== -->
    <div
      v-if="selectedTool === 'shipping-calculator'"
      class="card"
    >
      <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-4">
        📦 运费计算器
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">商品重量（kg）</label>
          <input
            v-model.number="shippingForm.weight"
            type="number"
            class="input"
            min="0.1"
            step="0.1"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">配送距离</label>
          <select
            v-model="shippingForm.distance"
            class="input"
          >
            <option value="same">
              同城
            </option>
            <option value="province">
              省内
            </option>
            <option value="cross">
              跨省
            </option>
          </select>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-sm text-gray-500 dark:text-gray-400">
              <th class="pb-3">
                快递
              </th>
              <th class="pb-3">
                时效
              </th>
              <th class="pb-3">
                特点
              </th>
              <th class="pb-3 text-right">
                预估运费
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in shippingResult"
              :key="item.name"
              class="border-t border-gray-100 dark:border-gray-700"
            >
              <td class="py-3 font-medium text-gray-800 dark:text-gray-200">
                {{ item.name }}
              </td>
              <td class="py-3 text-gray-500">
                {{ item.时效 }}
              </td>
              <td class="py-3 text-gray-500">
                {{ item.特点 }}
              </td>
              <td class="py-3 text-right">
                <span class="text-lg font-bold text-primary-600">¥{{ item.cost }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-4 text-xs text-gray-400">
        * 以上为参考价，实际运费以快递公司为准
      </p>
    </div>

    <!-- ========== 违禁词检测 ========== -->
    <div
      v-if="selectedTool === 'prohibited-words'"
      class="card"
    >
      <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-4">
        🚫 违禁词检测
      </h3>
      <div class="mb-4">
        <div class="flex flex-wrap gap-2 mb-3">
          <button
            class="px-3 py-1.5 rounded-full text-xs transition-all"
            :class="selectedWordType === 'advertising' ? 'bg-danger-600 text-white' : 'bg-gray-100 dark:bg-gray-700'"
            @click="selectedWordType = 'advertising'; checkProhibited()"
          >
            广告法禁用词
          </button>
          <button
            class="px-3 py-1.5 rounded-full text-xs transition-all"
            :class="selectedWordType === 'platform' ? 'bg-danger-600 text-white' : 'bg-gray-100 dark:bg-gray-700'"
            @click="selectedWordType = 'platform'; checkProhibited()"
          >
            平台敏感词
          </button>
          <button
            class="px-3 py-1.5 rounded-full text-xs transition-all"
            :class="selectedWordType === 'cosmetics' ? 'bg-danger-600 text-white' : 'bg-gray-100 dark:bg-gray-700'"
            @click="selectedWordType = 'cosmetics'; checkProhibited()"
          >
            美妆行业词
          </button>
          <button
            class="px-3 py-1.5 rounded-full text-xs transition-all"
            :class="selectedWordType === 'food' ? 'bg-danger-600 text-white' : 'bg-gray-100 dark:bg-gray-700'"
            @click="selectedWordType = 'food'; checkProhibited()"
          >
            食品行业词
          </button>
          <button
            class="px-3 py-1.5 rounded-full text-xs bg-warning-600 text-white ml-auto"
            @click="checkAllProhibited()"
          >
            全库检测
          </button>
        </div>
        <textarea
          v-model="checkText"
          placeholder="在此输入要检测的文案..."
          rows="4"
          class="input resize-none"
          @input="checkProhibited"
        />
      </div>
      <div>
        <div
          v-if="foundWords.length === 0"
          class="text-success-600 dark:text-success-400 text-center py-4"
        >
          ✅ 未检测到违禁词
        </div>
        <div v-else>
          <div class="text-danger-600 dark:text-danger-400 mb-3">
            ⚠️ 检测到 {{ foundWords.length }} 处违禁词：
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="item in foundWords"
              :key="item.word"
              class="inline-flex items-center gap-1 px-3 py-1 bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 rounded-full text-sm"
            >
              {{ item.word }}
              <span class="text-xs opacity-60">({{ item.type }})</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 字数统计 ========== -->
    <div
      v-if="selectedTool === 'character-counter'"
      class="card"
    >
      <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-4">
        📊 字数统计
      </h3>
      <textarea
        v-model="textContent"
        placeholder="在此输入要统计的文本..."
        rows="6"
        class="input resize-none mb-4"
      />
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div class="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div class="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {{ textStats.chars }}
          </div>
          <div class="text-xs text-gray-500">
            总字符
          </div>
        </div>
        <div class="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div class="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {{ textStats.charsNoSpace }}
          </div>
          <div class="text-xs text-gray-500">
            文字数
          </div>
        </div>
        <div class="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div class="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {{ textStats.words }}
          </div>
          <div class="text-xs text-gray-500">
            词数
          </div>
        </div>
        <div class="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div class="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {{ textStats.lines }}
          </div>
          <div class="text-xs text-gray-500">
            行数
          </div>
        </div>
        <div class="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div class="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {{ textStats.paragraphs }}
          </div>
          <div class="text-xs text-gray-500">
            段落
          </div>
        </div>
        <div class="text-center p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
          <div class="text-2xl font-bold text-primary-600">
            {{ Math.round(textStats.chars / 2) }}
          </div>
          <div class="text-xs text-primary-600">
            中文约
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 标题检查器 ========== -->
    <div
      v-if="selectedTool === 'title-checker'"
      class="card"
    >
      <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-4">
        ✏️ 标题检查器
      </h3>
      <div class="mb-4">
        <div class="flex flex-wrap gap-2 mb-3">
          <button
            v-for="(platform, key) in { taobao: '淘宝', tmall: '天猫', douyin: '抖音', xiaohongshu: '小红书', pinduoduo: '拼多多' }"
            :key="key"
            class="px-3 py-1.5 rounded-full text-xs transition-all"
            :class="selectedPlatform === key ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700'"
            @click="selectedPlatform = key"
          >
            {{ platform }}
          </button>
        </div>
        <input
          v-model="titleText"
          type="text"
          class="input w-full"
          placeholder="输入商品标题..."
        >
      </div>
      <div class="grid grid-cols-3 gap-4 mb-4">
        <div
          class="text-center p-3 rounded-lg"
          :class="titleCheckResult.status === 'ok' ? 'bg-green-50' : titleCheckResult.status === 'warning' ? 'bg-yellow-50' : 'bg-red-50'"
        >
          <div class="text-xs text-gray-500">
            当前字数
          </div>
          <div class="text-2xl font-bold">
            {{ titleCheckResult.len }}
          </div>
        </div>
        <div class="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div class="text-xs text-gray-500">
            字数限制
          </div>
          <div class="text-2xl font-bold">
            {{ titleCheckResult.limit.max }}
          </div>
        </div>
        <div
          class="text-center p-3 rounded-lg"
          :class="titleCheckResult.remaining >= 0 ? 'bg-green-50' : 'bg-red-50'"
        >
          <div class="text-xs">
            剩余
          </div>
          <div
            class="text-2xl font-bold"
            :class="titleCheckResult.remaining >= 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ titleCheckResult.remaining }}
          </div>
        </div>
      </div>
      <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ selectedPlatform }}规范：{{ titleCheckResult.limit.tips }}
        </div>
      </div>
      <div v-if="titleCheckResult.suggestions.length > 0">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          优化建议：
        </div>
        <ul class="space-y-1">
          <li
            v-for="(s, i) in titleCheckResult.suggestions"
            :key="i"
            class="text-sm text-gray-500 flex items-center gap-2"
          >
            <span class="text-warning-500">💡</span> {{ s }}
          </li>
        </ul>
      </div>
    </div>

    <!-- ========== 内容对比 ========== -->
    <div
      v-if="selectedTool === 'content-compare'"
      class="card"
    >
      <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-4">
        ⚖️ 内容对比
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">原版本</label>
          <textarea
            v-model="compareText1"
            placeholder="粘贴原版本内容..."
            rows="6"
            class="input resize-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">新版本</label>
          <textarea
            v-model="compareText2"
            placeholder="粘贴新版本内容..."
            rows="6"
            class="input resize-none"
          />
        </div>
      </div>
      <button
        class="btn-primary"
        @click="compareContents"
      >
        开始对比
      </button>
      <div
        v-if="compareResult"
        class="mt-6 space-y-4"
      >
        <div class="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-center">
          <div class="text-sm text-gray-500">
            相似度
          </div>
          <div class="text-4xl font-bold text-primary-600">
            {{ compareResult.similarity }}%
          </div>
        </div>
        <div v-if="compareResult.added.length > 0">
          <h4 class="font-medium text-success-600 dark:text-success-400 mb-2">
            ✅ 新增内容 ({{ compareResult.added.length }})
          </h4>
          <ul class="list-disc list-inside text-sm text-gray-500 space-y-1">
            <li
              v-for="(line, i) in compareResult.added"
              :key="i"
            >
              {{ line }}
            </li>
          </ul>
        </div>
        <div v-if="compareResult.removed.length > 0">
          <h4 class="font-medium text-danger-600 dark:text-danger-400 mb-2">
            ❌ 删除内容 ({{ compareResult.removed.length }})
          </h4>
          <ul class="list-disc list-inside text-sm text-gray-500 space-y-1">
            <li
              v-for="(line, i) in compareResult.removed"
              :key="i"
            >
              {{ line }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- ========== SEO分析 ========== -->
    <div
      v-if="selectedTool === 'seo-analysis'"
      class="card"
    >
      <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-4">
        🔍 SEO 关键词分析
      </h3>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">待分析内容</label>
        <textarea
          v-model="seoText"
          placeholder="粘贴商品标题或描述..."
          rows="4"
          class="input resize-none"
        />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">关键词（用逗号分隔）</label>
        <input
          v-model="seoKeywords"
          type="text"
          placeholder="如：无线耳机, 降噪, 蓝牙"
          class="input"
        >
      </div>
      <button
        class="btn-primary"
        @click="analyzeSEO"
      >
        开始分析
      </button>
      <div
        v-if="seoResult"
        class="mt-6 space-y-4"
      >
        <div class="grid grid-cols-2 gap-4">
          <div
            class="p-4 rounded-lg text-center"
            :class="seoResult.score >= 80 ? 'bg-success-50' : seoResult.score >= 60 ? 'bg-yellow-50' : 'bg-red-50'"
          >
            <div class="text-xs text-gray-500">
              SEO评分
            </div>
            <div
              class="text-3xl font-bold"
              :class="seoResult.score >= 80 ? 'text-success-600' : seoResult.score >= 60 ? 'text-yellow-600' : 'text-red-600'"
            >
              {{ seoResult.score }}
            </div>
          </div>
          <div
            class="p-4 rounded-lg text-center"
            :class="seoResult.readability.score >= 80 ? 'bg-success-50' : seoResult.readability.score >= 60 ? 'bg-yellow-50' : 'bg-red-50'"
          >
            <div class="text-xs text-gray-500">
              可读性
            </div>
            <div
              class="text-xl font-bold"
              :class="seoResult.readability.score >= 80 ? 'text-success-600' : seoResult.readability.score >= 60 ? 'text-yellow-600' : 'text-red-600'"
            >
              {{ seoResult.readability.level }}
            </div>
          </div>
        </div>
        <div v-if="seoResult.keywordDensity.length > 0">
          <h4 class="font-medium text-gray-800 dark:text-gray-200 mb-2">
            关键词密度
          </h4>
          <div class="space-y-2">
            <div
              v-for="item in seoResult.keywordDensity"
              :key="item.keyword"
              class="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
            >
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ item.keyword }}</span>
              <span class="text-sm text-gray-500">出现 {{ item.count }} 次 · {{ item.density }}</span>
            </div>
          </div>
        </div>
        <div v-if="seoResult.suggestions.length > 0">
          <h4 class="font-medium text-gray-800 dark:text-gray-200 mb-2">
            优化建议
          </h4>
          <ul class="space-y-1">
            <li
              v-for="(s, i) in seoResult.suggestions"
              :key="i"
              class="text-sm text-gray-500 flex items-center gap-2"
            >
              <span class="text-warning-500">💡</span> {{ s }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- ========== 图片尺寸库 ========== -->
    <div
      v-if="selectedTool === 'image-sizes'"
      class="card"
    >
      <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-4">
        🖼️ 图片尺寸库
      </h3>
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="(_sizes, platform) in imageSizes"
          :key="platform"
          class="px-4 py-2 rounded-lg text-sm transition-all"
          :class="selectedImagePlatform === platform ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700'"
          @click="selectedImagePlatform = platform"
        >
          {{ { taobao: '淘宝', tmall: '天猫', douyin: '抖音', xiaohongshu: '小红书', pinduoduo: '拼多多' }[platform] }}
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-sm text-gray-500 dark:text-gray-400">
              <th class="pb-3">
                用途
              </th>
              <th class="pb-3">
                推荐尺寸
              </th>
              <th class="pb-3">
                比例
              </th>
              <th class="pb-3">
                备注
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="size in imageSizes[selectedImagePlatform]"
              :key="size.name"
              class="border-t border-gray-100 dark:border-gray-700"
            >
              <td class="py-3 font-medium text-gray-800 dark:text-gray-200">
                {{ size.name }}
              </td>
              <td class="py-3 text-primary-600 font-mono">
                {{ size.size }}
              </td>
              <td class="py-3 text-gray-500">
                {{ size.ratio }}
              </td>
              <td class="py-3 text-gray-500 text-sm">
                {{ size.tips }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ========== 活动日历 ========== -->
    <div
      v-if="selectedTool === 'calendar'"
      class="card"
    >
      <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-4">
        📅 电商活动日历 - {{ selectedYear }}年
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
        全年电商营销节点一览，帮你提前规划运营节奏
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div 
          v-for="month in months" 
          :key="month"
          class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
        >
          <h4 class="font-bold text-lg text-primary-600 dark:text-primary-400 mb-3">
            {{ month }}
          </h4>
          <div class="space-y-2">
            <div 
              v-for="event in (calendarEvents as any)[month]" 
              :key="event.name"
              class="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="font-medium text-gray-800 dark:text-gray-200 text-sm">{{ event.name }}</span>
                <span 
                  class="px-2 py-0.5 rounded text-xs font-medium"
                  :class="getImportanceColor(event.importance)"
                >
                  {{ getImportanceLabel(event.importance) }}
                </span>
              </div>
              <div class="text-xs text-gray-500 mb-1">
                {{ event.date }}
              </div>
              <div class="flex flex-wrap gap-1 mb-1">
                <span 
                  v-for="platform in event.platforms" 
                  :key="platform"
                  class="px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded text-xs"
                >
                  {{ platform }}
                </span>
              </div>
              <div class="text-xs text-gray-400 dark:text-gray-500">
                {{ event.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 竞品分析 ========== -->
    <div
      v-if="selectedTool === 'competitor'"
      class="card"
    >
      <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-4">
        🎯 竞品分析
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">竞品名称</label>
          <input
            v-model="competitorForm.competitorName"
            type="text"
            placeholder="输入竞品名称"
            class="input"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">我们的产品</label>
          <input
            v-model="competitorForm.ourProduct"
            type="text"
            placeholder="我们的产品特点"
            class="input"
          >
        </div>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">我们的优势</label>
        <textarea
          v-model="competitorForm.ourAdvantage"
          placeholder="列出我们的差异化优势..."
          rows="2"
          class="input resize-none"
        />
      </div>
      <button
        :disabled="isAnalyzing || !aiStore.isConfigured"
        class="btn-primary w-full"
        @click="analyzeCompetitor"
      >
        {{ isAnalyzing ? '分析中...' : '开始分析' }}
      </button>
      <div
        v-if="competitorResult"
        class="mt-6"
      >
        <h4 class="font-medium text-gray-800 dark:text-gray-200 mb-3">
          分析结果
        </h4>
        <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
          {{ competitorResult }}
        </div>
      </div>
    </div>

    <!-- ========== 评价分析 ========== -->
    <div
      v-if="selectedTool === 'review-analysis'"
      class="card"
    >
      <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-4">
        💬 评价分析
      </h3>
      <div class="mb-4">
        <div class="flex gap-4 mb-3">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="reviewForm.reviewType"
              type="radio"
              value="all"
              class="radio"
            >
            <span class="text-sm">全部评价</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="reviewForm.reviewType"
              type="radio"
              value="positive"
              class="radio"
            >
            <span class="text-sm">好评</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="reviewForm.reviewType"
              type="radio"
              value="negative"
              class="radio"
            >
            <span class="text-sm">差评</span>
          </label>
        </div>
        <textarea
          v-model="reviewForm.reviews"
          placeholder="粘贴评价内容（多条用换行分隔）..."
          rows="6"
          class="input resize-none"
        />
      </div>
      <button
        :disabled="isReviewAnalyzing || !aiStore.isConfigured"
        class="btn-primary w-full"
        @click="analyzeReviews"
      >
        {{ isReviewAnalyzing ? '分析中...' : '开始分析' }}
      </button>
      <div
        v-if="reviewResult"
        class="mt-6"
      >
        <h4 class="font-medium text-gray-800 dark:text-gray-200 mb-3">
          分析结果
        </h4>
        <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
          {{ reviewResult }}
        </div>
      </div>
    </div>
  </div>
</template>
