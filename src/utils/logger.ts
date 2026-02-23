/**
 * 日志工具类
 * 生产环境只输出错误日志，开发环境输出所有级别日志
 */
const isDev = import.meta.env.DEV

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const prefix = '[电商军师]'

function formatMessage(level: LogLevel, ...args: unknown[]): string {
  const timestamp = new Date().toISOString()
  return `${timestamp} ${prefix}[${level.toUpperCase()}] ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')}`
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.log(formatMessage('debug', ...args))
    }
  },

  info: (...args: unknown[]) => {
    if (isDev) {
      console.info(formatMessage('info', ...args))
    }
  },

  warn: (...args: unknown[]) => {
    console.warn(formatMessage('warn', ...args))
  },

  error: (...args: unknown[]) => {
    console.error(formatMessage('error', ...args))
  }
}

// 保持向后兼容的别名
export const log = logger.debug
export const consoleError = logger.error
export const consoleWarn = logger.warn
