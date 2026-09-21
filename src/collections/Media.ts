import type { CollectionConfig } from 'payload'
import { generateBlurPlaceholder } from '../hooks/generateBlurPlaceholder'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [generateBlurPlaceholder],
  },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        // 1.91:1 — the ratio Open Graph and WhatsApp link previews expect
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
        // Payload omits a size when the source is smaller on BOTH axes, which would
        // skip this one for every landscape photo under 1200x630 and leave the page
        // with no og:image at all. Enlarging keeps the tag always present; sources
        // that are already big enough are downscaled as usual.
        withoutEnlargement: false,
      },
    ],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    crop: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'blurDataUrl',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Auto-generated blur placeholder for Next.js Image',
      },
    },
  ],
}
