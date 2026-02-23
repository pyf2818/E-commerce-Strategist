#!/usr/bin/env tsx

/**
 * 部署助手脚本
 * 用法: npx tsx scripts/deploy.ts [command]
 *
 * 命令:
 *   build     - 构建生产版本
 *   vercel    - 部署到 Vercel
 *   github    - 推送代码到 GitHub
 *   release  - 完整发布流程 (build → github → vercel)
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

const ROOT = process.cwd()

function run(command: string, message?: string) {
  const cmd = message ? `${command} # ${message}` : command
  console.log(`\n▶ ${cmd}`)
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit' })
    console.log(`✅ ${command} 完成`)
  } catch (error) {
    console.error(`❌ ${command} 失败`)
    process.exit(1)
  }
}

function checkPrerequisites() {
  console.log('\n🔍 检查部署前置条件...')

  // 检查 Node.js
  try {
    const nodeVersion = execSync('node --version').toString().trim()
    console.log(`✅ Node.js: ${nodeVersion}`)
  } catch {
    console.error('❌ 未找到 Node.js，请先安装 Node.js 18+')
    process.exit(1)
  }

  // 检查依赖
  if (!existsSync(join(ROOT, 'node_modules'))) {
    console.log('📦 安装依赖...')
    run('npm install', 'Installing dependencies')
  } else {
    console.log('✅ 依赖已安装')
  }

  // 检查 Git
  try {
    execSync('git --version')
    console.log('✅ Git 已配置')
  } catch {
    console.error('❌ 未找到 Git，请先安装 Git')
    process.exit(1)
  }

  // 检查 Vercel CLI
  try {
    execSync('vercel --version')
    console.log('✅ Vercel CLI 已安装')
  } catch {
    console.warn('⚠️  Vercel CLI 未安装，建议安装: npm i -g vercel')
  }
}

function build() {
  console.log('\n🔨 构建生产版本...')
  run('npm run build', 'Building for production')

  if (!existsSync(join(ROOT, 'dist'))) {
    console.error('❌ 构建失败：dist 目录不存在')
    process.exit(1)
  }

  console.log('✅ 构建成功')
}

function deployToVercel() {
  console.log('\n🚀 部署到 Vercel...')

  // 检查是否已登录
  try {
    execSync('vercel whoami', { stdio: 'ignore' })
    console.log('✅ 已登录 Vercel')
  } catch {
    console.log('🔐 请先登录 Vercel:')
    run('vercel login', 'Logging in to Vercel')
  }

  // 部署（首次会交互式配置）
  console.log('📤 正在部署...')
  run('vercel --prod', 'Deploying to production')

  console.log('\n🎉 部署成功！')
  console.log('访问地址: https://your-project.vercel.app (请查看 Vercel 输出)')
}

function pushToGitHub() {
  console.log('\n📤 推送代码到 GitHub...')

  // 检查是否存在远程仓库
  try {
    const remotes = execSync('git remote -v').toString()
    if (!remotes.includes('origin')) {
      console.log('⚠️  未找到 origin 远程仓库')
      console.log('请先创建 GitHub 仓库并将远程地址添加到 origin')
      console.log('命令: git remote add origin https://github.com/username/repo.git')
      process.exit(1)
    }
  } catch {
    console.error('❌ Git 配置错误')
    process.exit(1)
  }

  // 检查是否有未提交的更改
  const status = execSync('git status --porcelain').toString().trim()
  if (status) {
    console.log('📝 发现未提交的更改:')
    console.log(status)
    console.log('\n正在提交...')
    run('git add .', 'Staging all changes')
    run('git commit -m "chore: prepare for deployment"', 'Committing changes')
  } else {
    console.log('✅ 工作目录干净')
  }

  // 获取当前分支
  const currentBranch = execSync('git branch --show-current').toString().trim()
  console.log(`📍 当前分支: ${currentBranch}`)

  // 推送到远程
  run(`git push origin ${currentBranch}`, `Pushing to ${currentBranch}`)

  console.log('✅ 代码已推送到 GitHub')
}

function fullRelease() {
  console.log('\n🎯 开始完整发布流程...')
  console.log('步骤: 1) 检查环境 → 2) 构建 → 3) 推送到 GitHub → 4) 部署到 Vercel\n')

  checkPrerequisites()
  build()
  pushToGitHub()
  deployToVercel()

  console.log('\n✅ 所有步骤完成！')
  console.log('\n📋 后续步骤:')
  console.log('1. 在 Vercel Dashboard 配置环境变量（如有需要）')
  console.log('2. 设置自定义域名（如有）')
  console.log('3. 分享给用户使用')
}

// CLI 入口
const command = process.argv[2]

switch (command) {
  case 'build':
    checkPrerequisites()
    build()
    break

  case 'vercel':
    checkPrerequisites()
    deployToVercel()
    break

  case 'github':
    checkPrerequisites()
    pushToGitHub()
    break

  case 'release':
    fullRelease()
    break

  default:
    console.log(`
🚀 电商军师 - 部署助手

用法: npx tsx scripts/deploy.ts [command]

可用命令:
  build     - 构建生产版本
  vercel    - 部署到 Vercel
  github    - 推送代码到 GitHub
  release  - 完整发布流程 (build → github → vercel)

示例:
  npx tsx scripts/deploy.ts build     # 仅构建
  npx tsx scripts/deploy.ts release  # 一键发布

前置条件:
  • Node.js 18+
  • Git
  • Vercel CLI (可选，用于 vercel 命令)
    `)
}
