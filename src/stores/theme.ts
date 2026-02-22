import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>('system')

  // 获取实际主题
  const getActualTheme = (): 'light' | 'dark' => {
    if (mode.value === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return mode.value
  }

  // 应用主题
  const applyTheme = () => {
    const theme = getActualTheme()
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 设置主题
  const setMode = (newMode: ThemeMode) => {
    mode.value = newMode
    applyTheme()
  }

  // 切换主题 (light <-> dark)
  const toggleTheme = () => {
    const currentTheme = getActualTheme()
    setMode(currentTheme === 'dark' ? 'light' : 'dark')
  }

  // 监听系统主题变化
  const watchSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (mode.value === 'system') {
        applyTheme()
      }
    })
  }

  // 初始化
  const init = () => {
    applyTheme()
    watchSystemTheme()
  }

  // 监听 mode 变化
  watch(mode, () => {
    applyTheme()
  })

  return {
    mode,
    getActualTheme,
    setMode,
    toggleTheme,
    init
  }
}, {
  persist: {
    key: 'theme-config',
    storage: localStorage,
    paths: ['mode']
  }
})
