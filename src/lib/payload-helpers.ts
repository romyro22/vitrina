import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function getPayloadClient() {
  return getPayload({ config: configPromise })
}

export async function getSiteSettings() {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings' })
}

export async function getProducts(options?: {
  where?: Record<string, unknown>
  limit?: number
  page?: number
  sort?: string
}) {
  const payload = await getPayloadClient()
  return payload.find({
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
}

export async function getProductBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  return result.docs[0] ?? null
}

export async function getCategories() {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'categories',
    where: { isActive: { equals: true } },
    sort: 'sortOrder',
    limit: 100,
    depth: 1,
  })
}

export async function getCategoryBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return result.docs[0] ?? null
}

export async function searchProducts(query: string, page = 1) {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'products',
    where: {
      isAvailable: { equals: true },
      name: { like: query },
    },
    limit: 12,
    page,
    depth: 2,
  })
}

export async function getFeaturedProducts() {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'products',
    where: {
      isAvailable: { equals: true },
      featured: { equals: true },
    },
    limit: 8,
    sort: '-createdAt',
    depth: 2,
  })
}
