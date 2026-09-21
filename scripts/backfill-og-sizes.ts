import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getLogger } from '@/lib/logger'

const log = getLogger('backfill-og-sizes')

/** Restricts the run to a single media ID, for a trial pass before the full set */
const ONLY_FLAG_INDEX = process.argv.indexOf('--only')
const ONLY_ID =
  ONLY_FLAG_INDEX !== -1 ? Number(process.argv[ONLY_FLAG_INDEX + 1]) : null

/**
 * Backfills the `og` image size for media uploaded before that size existed.
 *
 * Payload only runs createImageSizes when a file enters the upload pipeline, so
 * adding a size to the collection config does nothing for existing documents.
 * Passing filePath with overwriteExistingFiles re-reads the file from disk and
 * regenerates every configured size in place.
 */
async function backfillOgSizes() {
  const payload = await getPayload({ config })
  const mediaDir = path.resolve(process.cwd(), 'media')

  const result = await payload.find({
    collection: 'media',
    limit: 0,
    depth: 0,
    ...(ONLY_ID !== null ? { where: { id: { equals: ONLY_ID } } } : {}),
  })

  // Materialise the full list before mutating anything — paginating while
  // updating would shift rows between pages.
  const docs = result.docs

  let processed = 0
  let skipped = 0
  let failed = 0

  for (const doc of docs) {
    if (doc.sizes?.og?.url) {
      skipped++
      continue
    }

    if (!doc.filename) {
      skipped++
      continue
    }

    const filePath = path.join(mediaDir, doc.filename)

    if (!fs.existsSync(filePath)) {
      failed++
      continue
    }

    try {
      // Passing `filePath` alone is not enough: payload resolves it but skips
      // re-processing, so the update succeeds while no size is regenerated. Handing
      // it an actual file buffer is what puts the upload back through sharp.
      const data = fs.readFileSync(filePath)

      await payload.update({
        collection: 'media',
        id: doc.id,
        data: {},
        file: {
          name: doc.filename,
          data,
          mimetype: doc.mimeType ?? 'image/jpeg',
          size: data.length,
        },
        overwriteExistingFiles: true,
        overrideAccess: true, // SAFETY: script runs server-side, outside an admin session
      })
      processed++
    } catch {
      failed++
    }
  }

  // Single summary line — logging inside the loop is forbidden by the logging rules
  log.info({ total: docs.length, processed, skipped, failed }, 'media.og_backfill.done')

  process.exit(failed > 0 ? 1 : 0)
}

backfillOgSizes().catch((error) => {
  log.error({ error }, 'media.og_backfill.failed')
  process.exit(1)
})
