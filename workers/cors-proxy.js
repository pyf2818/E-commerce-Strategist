/**
 * Cloudflare Workers CORS 代理
 * 部署方法：
 * 1. 安装 wrangler: npm install -g wrangler
 * 2. 登录: wrangler login
 * 3. 创建 worker: wrangler init ai-proxy
 * 4. 复制此代码到 worker
 * 5. 部署: wrangler deploy
 * 
 * 然后将 worker 的 URL 填入上面的 CORS_PROXY 常量
 */

export default {
  async fetch(request) {
    const url = new URL(request.url)
    const targetUrl = url.searchParams.get('url')

    if (!targetUrl) {
      return new Response('Missing url parameter', { status: 400 })
    }

    // 转发请求
    const headers = new Headers(request.headers)
    headers.delete('host')
    headers.set('Origin', '*')
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: headers,
        body: request.body,
        redirect: 'follow'
      })

      // 复制响应，添加 CORS 头
      const responseHeaders = new Headers(response.headers)
      responseHeaders.set('Access-Control-Allow-Origin', '*')
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      })
    } catch (error) {
      return new Response(`Proxy error: ${error.message}`, { status: 500 })
    }
  }
}
