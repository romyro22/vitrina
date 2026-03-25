import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'storeName',
      type: 'text',
      required: true,
      defaultValue: 'Mi Vitrina',
    },
    {
      name: 'whatsappNumber',
      type: 'text',
      required: true,
      admin: {
        description: 'Numero de WhatsApp con codigo de pais, sin espacios ni signos. Ej: 5491155551234',
      },
    },
    {
      name: 'whatsappMessageTemplate',
      type: 'textarea',
      defaultValue:
        'Hola! Me interesa el producto "{productName}" ({price}). Lo vi en: {url}',
      admin: {
        description:
          'Variables disponibles: {productName}, {price}, {url}',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'currencySymbol',
      type: 'text',
      defaultValue: '$',
    },
  ],
}
