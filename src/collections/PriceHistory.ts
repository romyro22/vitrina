import type { CollectionConfig } from 'payload'

export const PriceHistory: CollectionConfig = {
  slug: 'price-history',
  admin: {
    defaultColumns: ['product', 'oldPrice', 'newPrice', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'oldPrice',
      type: 'number',
    },
    {
      name: 'newPrice',
      type: 'number',
    },
  ],
  timestamps: true,
}
