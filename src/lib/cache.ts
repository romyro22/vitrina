import Redis from 'ioredis'
import { getLogger } from '@/lib/logger'

const log = getLogger('cache')

let redisClient: Redis | null = null

/** Returns a singleton Redis/Valkey client, or null if connection fails */
function getRedisClient(): Redis | null {
  if (redisClient) return redisClient

  const url = process.env.VALKEY_URL ?? 'redis://localhost:6379'

  try {
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) return null
        return Math.min(times * 200, 1000)
      },
      lazyConnect: true,
    })

    redisClient.on('error', (err) => {
      log.warn({ error: err.message }, 'cache_connection_error')
    })

    return redisClient
  } catch {
    log.warn('cache_client_creation_failed')
    return null
  }
}

/**
 * Gets a value from cache or calls the fetcher on miss.
 * Falls back to the fetcher if Valkey is unavailable.
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number,
): Promise<T> {
  const client = getRedisClient()

  if (!client) {
    return fetcher()
  }

  try {
    await client.connect().catch(() => {
      /* already connected or connection failed — handled by error handler */
    })

    const cached = await client.get(key)
    if (cached) {
      log.debug({ key }, 'cache_hit')
      return JSON.parse(cached) as T
    }
  } catch {
    log.debug({ key }, 'cache_miss_error')
    return fetcher()
  }

  const value = await fetcher()

  try {
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds)
    log.debug({ key, ttlSeconds }, 'cache_set')
  } catch {
    log.debug({ key }, 'cache_set_error')
  }

  return value
}

/** Deletes all keys matching a given pattern */
export async function invalidateCache(pattern: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    const keys = await client.keys(pattern)
    if (keys.length > 0) {
      await client.del(...keys)
      log.info({ pattern, keysDeleted: keys.length }, 'cache_invalidated')
    }
  } catch {
    log.warn({ pattern }, 'cache_invalidation_error')
  }
}
