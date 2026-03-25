import type { CollectionBeforeChangeHook } from 'payload'

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
  }

  return data
}
