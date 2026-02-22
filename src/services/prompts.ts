import type { ContentType, Platform } from '@/types'

/**
 * 系统提示词模板
 */
export const SYSTEM_PROMPTS: Record<ContentType, string> = {
  'product-title': `你是一位专业的电商运营专家，擅长撰写高转化率的商品标题。
你的任务是帮助商家创作吸引人、SEO友好、符合平台规则的商品标题。
请遵循以下原则：
1. 突出产品核心卖点和优势
2. 包含热门搜索关键词
3. 符合平台字数限制
4. 避免违禁词和夸大宣传
5. 简洁有力，吸引点击`,

  'product-desc': `你是一位资深的电商文案策划师，擅长撰写打动人心的商品详情页描述。
你的任务是创作能够展示产品价值、解决用户痛点、促进转化的商品描述。
请遵循以下原则：
1. 开头抓住眼球，引发兴趣
2. 详细描述产品特点和优势
3. 使用场景化语言，让用户产生代入感
4. 突出差异化卖点
5. 引导用户下单行动`,

  'short-video': `你是一位短视频内容策划专家，深谙抖音、快手等平台的爆款内容逻辑。
你的任务是创作能够吸引用户停留、点赞、转发的短视频脚本。
请遵循以下原则：
1. 黄金3秒开头，抓住注意力
2. 内容紧凑，节奏明快
3. 设置悬念和反转
4. 引导互动和关注
5. 符合平台内容规范`,

  'live-script': `你是一位经验丰富的直播带货顾问，精通各大电商平台直播运营。
你的任务是创作专业的直播话术，帮助主播提升直播间GMV。
请遵循以下原则：
1. 开场暖场，活跃气氛
2. 产品介绍清晰有吸引力
3. 设置合理的价格锚点
4. 促单话术有力，制造紧迫感
5. 互动环节设计巧妙`,

  'marketing-copy': `你是一位资深营销文案专家，擅长创作各种营销活动的文案。
你的任务是撰写能够吸引目标用户、传达活动价值、促进转化的营销文案。
请遵循以下原则：
1. 标题吸引眼球
2. 突出活动优惠和福利
3. 制造紧迫感和稀缺感
4. 行动指令明确
5. 符合品牌调性`,

  'customer-service': `你是一位专业的电商客服培训师，熟悉各类客服场景和话术。
你的任务是创作专业的客服回复话术，帮助客服人员高效处理各类问题。
请遵循以下原则：
1. 语气友善专业
2. 快速响应核心问题
3. 提供解决方案而非推诿
4. 适当挽留客户
5. 维护店铺形象`,

  'social-media': `你是一位社交媒体运营专家，精通小红书、微博、朋友圈等平台的内容运营。
你的任务是创作适合社交平台传播的内容，提升品牌曝光和用户互动。
请遵循以下原则：
1. 内容有共鸣，引发讨论
2. 标题/开头吸引点击
3. 图文结合效果好
4. 善用话题标签
5. 引导互动分享`
}

/**
 * 用户提示词模板生成器
 */
export function createUserPrompt(
  type: ContentType,
  params: Record<string, string>,
  platform: Platform
): string {
  const platformName = { taobao: '淘宝', tmall: '天猫', jd: '京东', pdd: '拼多多', douyin: '抖音', kuaishou: '快手', xiaohongshu: '小红书', weixin: '微信', other: '电商平台' }[platform]

  const templates: Record<ContentType, (p: Record<string, string>, pf: string) => string> = {
    'product-title': (p, pf) => `请为以下商品创作${pf}标题：
商品名称：${p.productName || ''}
商品类目：${p.category || ''}
核心卖点：${p.sellingPoints || ''}
目标人群：${p.targetAudience || ''}
价格区间：${p.priceRange || ''}
其他要求：${p.additionalRequirements || '无'}

请生成3-5个标题供选择，并简要说明每个标题的特点。`,

    'product-desc': (p, pf) => `请为以下商品创作${pf}详情页描述：
商品名称：${p.productName || ''}
商品类目：${p.category || ''}
核心卖点：${p.sellingPoints || ''}
目标人群：${p.targetAudience || ''}
价格：${p.price || ''}
规格参数：${p.specifications || ''}
其他要求：${p.additionalRequirements || '无'}

请创作一份完整的商品详情页文案，包含：商品亮点、详细参数、使用场景、购买理由等部分。`,

    'short-video': (p, pf) => `请为以下内容创作${pf}短视频脚本：
视频主题：${p.topic || ''}
产品/服务：${p.product || ''}
视频时长：${p.duration || '30-60秒'}
目标效果：${p.objective || '提升品牌曝光'}
风格要求：${p.style || '轻松有趣'}
其他要求：${p.additionalRequirements || '无'}

请创作完整的短视频脚本，包含：
1. 视频标题/封面文案
2. 开头3秒吸睛内容
3. 中间主要内容
4. 结尾引导互动
5. 画面/配乐建议`,

    'live-script': (p, _pf) => `请为以下直播场景创作话术：
直播类型：${p.liveType || '带货直播'}
产品名称：${p.productName || ''}
产品价格：${p.price || ''}
优惠活动：${p.promotion || ''}
话术环节：${p.scene || '产品介绍'}
其他要求：${p.additionalRequirements || '无'}

请创作完整的直播话术，包含开场白、产品介绍、互动话术、促单话术等环节。`,

    'marketing-copy': (p, pf) => `请为以下营销活动创作文案：
活动类型：${p.activityType || '促销活动'}
活动主题：${p.theme || ''}
优惠内容：${p.discount || ''}
活动时间：${p.timeRange || ''}
目标人群：${p.targetAudience || ''}
投放渠道：${p.channel || pf}
其他要求：${p.additionalRequirements || '无'}

请创作完整的营销文案，包含标题、正文、行动号召等部分。`,

    'customer-service': (p, _pf) => `请为以下客服场景创作回复话术：
问题类型：${p.issueType || '一般咨询'}
用户问题：${p.userQuestion || ''}
商品信息：${p.productInfo || ''}
处理原则：${p.principle || '客户至上'}
其他要求：${p.additionalRequirements || '无'}

请创作专业、友善的客服回复话术。`,

    'social-media': (p, pf) => `请为以下内容创作${pf}社媒文案：
内容主题：${p.topic || ''}
内容类型：${p.contentType || '图文'}
目标平台：${pf}
目标效果：${p.objective || '提升互动'}
其他要求：${p.additionalRequirements || '无'}

请创作适合社交平台传播的内容，包含标题、正文、话题标签等。`
  }

  return templates[type](params, platformName)
}

/**
 * 获取系统提示词
 */
export function getSystemPrompt(type: ContentType): string {
  return SYSTEM_PROMPTS[type]
}
