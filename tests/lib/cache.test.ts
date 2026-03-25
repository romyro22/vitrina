import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockStore = new Map<string, string>()

// Mock ioredis before importing cache module
vi.mock('ioredis', () => {
  const MockRedis = vi.fn().mockImplementation(function MockRedis() {
    return {
      connect: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockImplementation((key: string) => Promise.resolve(mockStore.get(key) ?? null)),
      set: vi.fn().mockImplementation((key: string, value: string) => {
        mockStore.set(key, value)
        return Promise.resolve('OK')
      }),
      keys: vi.fn().mockImplementation((pattern: string) => {
        const prefix = pattern.replace('*', '')
        const matched = [...mockStore.keys()].filter((k) => k.startsWith(prefix))
        return Promise.resolve(matched)
      }),
      del: vi.fn().mockImplementation((...keys: string[]) => {
        for (const k of keys) mockStore.delete(k)
        return Promise.resolve(keys.length)
      }),
      on: vi.fn(),
    }
  })

  return { default: MockRedis }
})

// Mock logger to keep tests quiet
vi.mock('@/lib/logger', () => ({
  getLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  }),
}))

// Import after mocks are in place
import { getCached, invalidateCache } from '@/lib/cache'

describe('cache', () => {
  beforeEach(() => {
    mockStore.clear()
  })

  it('should call fetcher on cache miss and return the value', async () => {
    const fetcher = vi.fn().mockResolvedValue({ name: 'Mi Tienda' })
    const result = await getCached('test:miss', fetcher, 300)

    expect(fetcher).toHaveBeenCalledOnce()
    expect(result).toEqual({ name: 'Mi Tienda' })
  })

  it('should return cached value on hit without calling fetcher again', async () => {
    // First call populates cache
    const fetcher1 = vi.fn().mockResolvedValue({ count: 5 })
    await getCached('test:hit', fetcher1, 300)
    expect(fetcher1).toHaveBeenCalledOnce()

    // Second call should read from cache
    const fetcher2 = vi.fn().mockResolvedValue({ count: 99 })
    const result = await getCached('test:hit', fetcher2, 300)

    expect(fetcher2).not.toHaveBeenCalled()
    expect(result).toEqual({ count: 5 })
  })

  it('should invalidate matching cache keys', async () => {
    // Populate some keys
    mockStore.set('vitrina:settings', JSON.stringify({ name: 'test' }))
    mockStore.set('vitrina:categories', JSON.stringify([]))

    await invalidateCache('vitrina:*')
    expect(mockStore.size).toBe(0)
  })
})
