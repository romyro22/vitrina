import type { CollectionAfterChangeHook } from 'payload'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { getLogger } from '@/lib/logger'

const log = getLogger('hooks:blur-placeholder')

/** Generates a 10x10 base64 blur placeholder for uploaded images */
export const generateBlurPlaceholder: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  if (!doc.filename || !doc.mimeType?.startsWith('image/')) return doc
  if (doc.blurDataUrl && operation === 'update') return doc

  try {
    const mediaDir = path.resolve(process.cwd(), 'media')
    const filePath = path.join(mediaDir, doc.filename)

    if (!fs.existsSync(filePath)) return doc

    const buffer = await sharp(filePath)
      .resize(10, 10, { fit: 'inside' })
      .toFormat('png')
      .toBuffer()

    const blurDataUrl = `data:image/png;base64,${buffer.toString('base64')}`

    await req.payload.update({
      collection: 'media',
      id: doc.id,
      data: { blurDataUrl },
      overrideAccess: true, // SAFETY: server-side hook, bypass access control
      // Joining the caller's transaction is mandatory: without `req` this opens a
      // second transaction against a row the outer one still holds locked, and the
      // update blocks forever instead of failing. Recursion is cut by the
      // blurDataUrl guard above, which is set by the time afterChange re-fires.
      req,
    })

    log.info({ mediaId: doc.id }, 'blur_placeholder_generated')
  } catch (error) {
    log.warn({ mediaId: doc.id, error }, 'blur_placeholder_failed')
  }

  return doc
}
