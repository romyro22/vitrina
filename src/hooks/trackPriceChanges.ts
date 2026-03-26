import type { CollectionBeforeChangeHook } from 'payload'
import { getLogger } from '@/lib/logger'

const log = getLogger('hooks:price-changes')

export const trackPriceChanges: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  if (operation !== 'update' || !originalDoc) return data

  const oldPrice = originalDoc.price
  const newPrice = data.price

  if (oldPrice !== undefined && newPrice !== undefined && oldPrice !== newPrice) {
    try {
      await req.payload.create({
        collection: 'price-history',
        data: {
          product: originalDoc.id,
          oldPrice,
          newPrice,
        },
        overrideAccess: true, // SAFETY: hook runs server-side; PriceHistory has create: () => false
      })
      log.info({ productId: originalDoc.id, oldPrice, newPrice }, 'price_changed')
    } catch (error) {
      log.error({ productId: originalDoc.id, error }, 'price_history_create_failed')
    }
  }

  return data
}
