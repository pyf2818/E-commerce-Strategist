# Vercel 部署指南

本指南帮助你将电商军师部署到 Vercel。

## ✅ 预检查清单

- [ ] 代码已推送到 GitHub 仓库
- [ ] 已注册 Vercel 账号 (https://vercel.com)
- [ ] 已安装 Vercel CLI (可选，用于命令行部署)

---

## 🚀 部署方式

### 方式 1: Vercel Dashboard (推荐 - 最简单)

1. **登录 Vercel**：https://vercel.com/new
2. **导入仓库**：
   - 选择 "Import Git Repository"
   - 找到 `E-commerce-Strategist` 仓库并导入
3. **配置项目**：
   - Framework Preset: `Vite`
   - Root Directory: `./` (默认)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - 点击 "Deploy"
4. **等待部署完成**（通常 2-5 分钟）
5. **获取访问地址**：`https://your-project.vercel.app`

---

### 方式 2: Vercel CLI (适合命令行操作)

```bash
# 1. 登录 Vercel (首次)
vercel login

# 2. 部署 (交互式配置 - 首次需要)
vercel

# 3. 生产环境部署
vercel --prod
```

CLI 会引导你完成首次配置，之后即可一键部署。

---

### 方式 3: 自动化部署 (推荐用于团队)

Vercel 会自动监听 GitHub 仓库的 main 分支：

1. 导入项目后，在 Vercel Dashboard 中：
   - 设置 `Production Branch` 为 `main`
   - 开启 "Automatic Deployments"
2. 每次 `git push origin main` 后，Vercel 会自动重新部署

---

## ⚙️ 环境变量配置 (可选)

在 Vercel Dashboard 中设置：

1. 进入项目 → Settings → Environment Variables
2. 添加变量（如果需要预配置默认 API Key）：

```
OPENAI_API_KEY=sk-...
ZHIPU_API_KEY=...
QWEN_API_KEY=...
DEEPSEEK_API_KEY=...
SILICONFLOW_API_KEY=...
```

**注意**：
- 这些变量仅用于服务端，前端仍需要 localStorage 存储
- 建议小范围分享时，让每个用户用自己的 API Key，不要共享密钥

---

## 🔧 配置说明

### vercel.json 关键配置

```json
{
  "framework": "vite",              // 使用 Vite 框架
  "builds": [{ "src": "package.json", "use": "@vercel/static-build" }],
  "routes": [{ "src": "/(.*)", "dest": "/index.html" }],  // SPA 路由
  "headers": [
    { "source": "/(.*)", "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "X-Frame-Options", "value": "DENY" }
    ]}
  ]
}
```

### 为什么不需要后端代理？

- 这是一个**纯前端应用**
- API 调用直接从浏览器到 AI 提供商
- ⚠️ **CORS 限制**：某些提供商（OpenAI、智谱、通义）可能拦截浏览器请求

**解决方案**：
1. 使用 DeepSeek（支持跨域，无需代理）
2. 安装浏览器插件 "Allow CORS" 或 "CORS Unblock"
3. 配置 CORS 代理（需自建或使用第三方服务）

---

## 🧪 本地测试部署

在部署前，建议本地先测试构建：

```bash
# 1. 构建项目
npm run build

# 2. 预览生产构建
npm run preview

# 3. 检查控制台是否有错误
# 4. 访问 http://localhost:4173 测试功能
```

---

## 🐛 常见问题

### Q1: 图片/视频生成失败？
**A**：可能是 CORS 拦截或 API Key 无效。
- 使用 DeepSeek 测试是否可访问
- 检查 Settings 页面的 API Key 是否正确
- 某些提供商不支持图像/视频生成（如 DeepSeek）

### Q2: 部署后页面空白？
**A**：可能是 `base` 配置问题。
- 检查 `vite.config.ts` 中的 `base` 是否为 `/`（根路径部署）
- 如果使用子路径（如 `/myapp/`），需要修改 base

### Q3: Vercel 构建失败？
**A**：常见原因：
- Node.js 版本过低（需要 18+）
- 依赖未安装完成（自动重试即可）
- TypeScript 类型错误（运行 `npm run type-check` 修复）

### Q4: 如何配置自定义域名？
**A**：
1. Vercel Dashboard → 项目 → Settings → Domains
2. 添加域名（如 `shop.yourdomain.com`）
3. 在域名 DNS 处添加 CNAME 记录指向 `cname.vercel-dns.com`

---

## 📊 监控与分析

- **访问统计**：Vercel Analytics (免费版有限制)
- **错误监控**：可集成 Sentry 或 LogRocket
- **性能监控**：Vercel 内置 Web Vitals 报告

---

## 🔒 安全建议

⚠️ **重要警告**：
- **不要将此应用用于生产商业服务**（API Key 暴露在客户端）
- 仅供小范围分享或个人使用
- 如果要公开服务，需要：
  1. 实现后端代理层（Vercel Serverless Functions）
  2. 添加用户认证
  3. 使用数据库存储用户配额
  4. 实施速率限制

---

## 📞 支持

如遇问题：
1. 检查 GitHub Issues: https://github.com/pyf2818/E-commerce-Strategist/issues
2. 查看 CLAUDE.md 了解项目架构
3. 查看 Vercel 文档: https://vercel.com/docs

---

## 🎉 部署成功！

部署完成后，你可以：
1. 在 Settings 页面配置你的 API Key
2. 让用户访问你的 Vercel 地址
3. 提醒用户：首次使用需要配置自己的 API Key

祝你部署顺利！
