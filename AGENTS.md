# 电商军师 - Agent 指南

## 项目概述

一站式电商内容创作与知识学习平台。用户配置自己的 AI API Key 后，可使用内容创作、AI问答等功能。

## 技术栈

- **框架**: Vue 3 + TypeScript (Composition API with `<script setup>`)
- **构建**: Vite 5 | **样式**: TailwindCSS 3 | **状态**: Pinia + persistedstate
- **路由**: Vue Router 4 (History) | **部署**: GitHub Pages

## 常用命令

```bash
npm install          # 安装依赖
npm run dev         # 开发模式 (端口 3000)
npm run type-check  # 类型检查 (vue-tsc)
npm run lint        # ESLint 检查 + 自动修复
npm run build       # 生产构建 (先 type-check 再 build)
npm run preview     # 预览构建结果
```

> **注意**: 项目未配置测试框架。如需测试，可安装 vitest 并配置 `npm run test`。

## 代码风格

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `AppHeader.vue` |
| 变量/函数 | camelCase | `handleSubmit` |
| 常量 | UPPER_SNAKE_CASE | `PROVIDER_DEFAULTS` |
| 类型/接口 | PascalCase | `AIConfig`, `ChatMessage` |

### 导入顺序

```typescript
// 1. Vue 核心库
import { ref, computed } from 'vue'
// 2. 第三方库
import { useRoute } from 'vue-router'
// 3. 项目内部模块 (@/ 别名)
import { useAIStore } from '@/stores'
import type { AIConfig } from '@/types'
```

### 组件规范

```vue
<script setup lang="ts">
interface Props {
  title: string
}
const props = defineProps<Props>()
const emit = defineEmits<{ update: [value: string] }>()

const isLoading = ref(false)
const displayTitle = computed(() => props.title.toUpperCase())

const handleSubmit = async () => {
  isLoading.value = true
  try { /* ... */ }
  catch (e) { error.value = e instanceof Error ? e.message : '失败' }
  finally { isLoading.value = false }
}
</script>
```

### TypeScript 规范

- ✅ 使用具体类型: `const items = ref<string[]>([])`
- ✅ 未使用参数加 `_`: `const handler = (_event: Event, data: string) => {}`
- ❌ 避免 `any`: 用 `unknown` 替代

### 错误处理模式

```typescript
interface Result<T> { success: boolean; data?: T; error?: string }

async function fetchData(): Promise<Result<Data>> {
  try {
    const res = await fetch(url)
    if (!res.ok) return { success: false, error: '请求失败' }
    return { success: true, data: await res.json() }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : '错误' }
  }
}
```

### 样式规范

- 使用 TailwindCSS 工具类 + 预定义组件类 (`.btn`, `.btn-primary`, `.card`, `.input`)
- 仅在需要复杂样式时使用 `<style scoped>`

## 项目结构

```
src/
├── assets/main.css       # Tailwind 入口 + 自定义样式
├── components/           # 组件 (common/, layout/)
├── composables/         # 组合式函数
├── router/              # 路由配置 (懒加载)
├── services/            # 服务层 (ai.ts, prompts.ts)
├── stores/              # Pinia 状态 (ai.ts, content.ts)
├── types/                # TypeScript 类型定义
└── views/                # 页面视图
```

## 验证清单

修改代码后，确保运行：

- [ ] `npm run type-check` - 无类型错误
- [ ] `npm run lint` - 无 ESLint 错误  
- [ ] `npm run build` - 构建成功

## 安全注意事项

1. API Key 仅存于 localStorage，不上传服务器
2. 不在代码中硬编码任何密钥
3. 部分 API 需在服务商后台配置 CORS
