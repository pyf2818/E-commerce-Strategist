<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useAIStore } from '@/stores'
import type { ChatMessage } from '@/types'
import ModelSelector from '@/components/common/ModelSelector.vue'

const aiStore = useAIStore()

interface Message extends ChatMessage {
  id: string
  timestamp: number
}

const messages = ref<Message[]>([])
const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return
  if (!aiStore.isConfigured) {
    addMessage('assistant', '请先在设置页面配置 AI API，才能使用 AI 助手功能。')
    return
  }

  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''
  
  // 添加用户消息
  addMessage('user', userMessage)
  isLoading.value = true

  try {
    const service = aiStore.getService()
    
    // 构建历史消息
    const chatHistory: ChatMessage[] = messages.value
      .slice(-10) // 保留最近10条消息作为上下文
      .map(m => ({ role: m.role, content: m.content }))

    // 流式输出
    let fullContent = ''
    const assistantMsg = addMessage('assistant', '')
    
    const systemPrompt = '你是一位专业的电商运营顾问，精通各大电商平台的运营策略。\n' +
      '你的任务是帮助商家解决电商运营中遇到的各种问题，包括：\n' +
      '- 店铺运营策略\n' +
      '- 产品选品建议\n' +
      '- 营销活动策划\n' +
      '- 数据分析解读\n' +
      '- 客户运营技巧\n' +
      '- 直播带货指导\n\n' +
      '请用专业、友善、实用的方式回答用户的问题。如果问题不明确，可以适当追问。'

    for await (const chunk of service.chatStream(
      [...chatHistory, { role: 'user', content: userMessage }],
      systemPrompt
    )) {
      fullContent += chunk
      assistantMsg.content = fullContent
      scrollToBottom()
    }
  } catch (e) {
    addMessage('assistant', `抱歉，出现了错误：${e instanceof Error ? e.message : '请稍后重试'}`)
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

// 添加消息
const addMessage = (role: 'user' | 'assistant', content: string): Message => {
  const msg: Message = {
    id: `msg-${Date.now()}`,
    role,
    content,
    timestamp: Date.now()
  }
  messages.value.push(msg)
  return msg
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 清空对话
const clearChat = () => {
  messages.value = []
}

// 快捷问题
const quickQuestions = [
  '如何提高店铺转化率？',
  '新手开淘宝店需要做什么准备？',
  '如何写出吸引人的商品标题？',
  '抖音直播带货有什么技巧？',
  '如何做竞品分析？'
]

const askQuick = (question: string) => {
  inputMessage.value = question
  sendMessage()
}

onMounted(() => {
  // 欢迎消息
  if (messages.value.length === 0) {
    addMessage('assistant', '你好！我是电商军师 AI 助手 🤖\n\n我可以帮你解答电商运营相关的问题，比如店铺运营、选品策略、营销活动、数据分析等。\n\n请问有什么可以帮助你的？')
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
    <!-- 顶部工具栏 -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">
        AI 助手
      </h2>
      <ModelSelector
        model-type="text"
        :show-label="true"
        size="md"
      />
    </div>
    
    <!-- 对话区域 -->
    <div 
      ref="messagesContainer"
      class="flex-1 overflow-y-auto space-y-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
    >
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex"
        :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[80%] rounded-2xl px-4 py-3"
          :class="message.role === 'user' 
            ? 'bg-primary-600 text-white rounded-br-sm' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'"
        >
          <pre class="whitespace-pre-wrap font-sans text-sm leading-relaxed">{{ message.content }}</pre>
        </div>
      </div>

      <!-- 加载中 -->
      <div
        v-if="isLoading"
        class="flex justify-start"
      >
        <div class="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 rounded-bl-sm">
          <span class="animate-pulse text-gray-700 dark:text-gray-300">正在思考中...</span>
        </div>
      </div>
    </div>

    <!-- 快捷问题 -->
    <div
      v-if="messages.length <= 2"
      class="mt-4"
    >
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
        你可以问我：
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="q in quickQuestions"
          :key="q"
          class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300 transition-colors"
          @click="askQuick(q)"
        >
          {{ q }}
        </button>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="mt-4 flex gap-3">
      <button
        v-if="messages.length > 1"
        class="btn-secondary"
        title="清空对话"
        @click="clearChat"
      >
        🗑️
      </button>
      <div class="flex-1 relative">
        <input
          v-model="inputMessage"
          type="text"
          placeholder="输入你的问题..."
          class="input pr-12"
          :disabled="isLoading"
          @keyup.enter="sendMessage"
        >
        <button
          :disabled="!inputMessage.trim() || isLoading || !aiStore.isConfigured"
          class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          @click="sendMessage"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
