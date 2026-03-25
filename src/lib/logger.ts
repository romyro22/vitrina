import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty' }
      : undefined,
})

/** Creates a child logger scoped to a specific module */
export function getLogger(moduleName: string) {
  return logger.child({ module: moduleName })
}
