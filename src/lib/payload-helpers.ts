import { cache } from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getLogger } from '@/lib/logger'
import { getCached } from '@/lib/cache'

const log = getLogger('payload-helpers')

const CACHE_TTL_SETTINGS = 300 // 5 minutes
const CACHE_TTL_CATEGORIES = 300 // 5 minutes

/** Returns the shared Payload client instance */
export async function getPayloadClient() {
  return getPayload({ config: configPromise })
}

/** Fetches the global site settings (store name, WhatsApp, currency, etc.) — cached for 5 min */
export async function getSiteSettings() {
  return getCached('vitrina:site-settings', async () => {
    const start = Date.now()
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'site-settings' })
    log.info({ durationMs: Date.now() - start }, 'site_settings_fetched')
    return settings
  }, CACHE_TTL_SETTINGS)
}

/** Fetches paginated products with optional filters and sorting */
export async function getProducts(options?: {
  where?: Record<string, unknown>
  limit?: number
  page?: number
  sort?: string
}) {
  const start = Date.now()
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'products',
    where: {
      isAvailable: { equals: true },
      ...options?.where,
    },
    limit: options?.limit ?? 12,
    page: options?.page ?? 1,
    sort: options?.sort ?? '-createdAt',
    depth: 2,
  })
  log.info(
    { totalDocs: result.totalDocs, page: result.page, durationMs: Date.now() - start },
    'products_listed',
  )
  return result
}

/** Fetches a single product by its unique slug — deduplicated per request via React cache() */
export const getProductBySlug = cache(async (slug: string) => {
  const start = Date.now()
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  const product = result.docs[0] ?? null
  if (product) {
    log.info({ slug, productId: product.id, durationMs: Date.now() - start }, 'product_fetched')
  } else {
    log.warn({ slug, durationMs: Date.now() - start }, 'product_not_found')
  }
  return product
})

/** Fetches all active categories sorted by sortOrder — cached for 5 min */
export async function getCategories() {
  return getCached('vitrina:categories', async () => {
    const start = Date.now()
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'categories',
      where: { isActive: { equals: true } },
      sort: 'sortOrder',
      limit: 100,
      depth: 1,
    })
    log.info({ count: result.totalDocs, durationMs: Date.now() - start }, 'categories_fetched')
    return result
  }, CACHE_TTL_CATEGORIES)
}

/** Fetches a single category by its unique slug — deduplicated per request via React cache() */
export const getCategoryBySlug = cache(async (slug: string) => {
  const start = Date.now()
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  const category = result.docs[0] ?? null
  if (category) {
    log.info({ slug, categoryId: category.id, durationMs: Date.now() - start }, 'category_fetched')
  } else {
    log.warn({ slug, durationMs: Date.now() - start }, 'category_not_found')
  }
  return category
})

/** Fetches related products from the same category, excluding the given product ID */
export async function getRelatedProducts(categoryId: number, excludeProductId: number, limit = 4) {
  const start = Date.now()
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'products',
    where: {
      isAvailable: { equals: true },
      category: { equals: categoryId },
      id: { not_equals: excludeProductId },
    },
    limit,
    sort: '-createdAt',
    depth: 2,
  })
  log.info(
    { categoryId, excludeProductId, count: result.totalDocs, durationMs: Date.now() - start },
    'related_products_fetched',
  )
  return result
}

/** Searches products by name (like match) with pagination */
export async function searchProducts(query: string, page = 1) {
  const start = Date.now()
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'products',
    where: {
      isAvailable: { equals: true },
      name: { like: query },
    },
    limit: 12,
    page,
    depth: 2,
  })
  log.info(
    { query, totalDocs: result.totalDocs, page, durationMs: Date.now() - start },
    'products_searched',
  )
  return result
}

/** Fetches featured products for the homepage */
export async function getFeaturedProducts() {
  const start = Date.now()
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'products',
    where: {
      isAvailable: { equals: true },
      featured: { equals: true },
    },
    limit: 8,
    sort: '-createdAt',
    depth: 2,
  })
  log.info({ count: result.totalDocs, durationMs: Date.now() - start }, 'featured_products_fetched')
  return result
}
