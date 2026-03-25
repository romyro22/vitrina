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
    await req.payload.create({
      collection: 'price-history',
      data: {
        product: originalDoc.id,
        oldPrice,
        newPrice,
      },
    })
    log.info({ productId: originalDoc.id, oldPrice, newPrice }, 'price_changed')
  }

  return data
}
