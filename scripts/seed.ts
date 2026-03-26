import fs from 'fs'
import os from 'os'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'
import { categories, products, siteSettings } from './seed-data'

const FORCE_FLAG = process.argv.includes('--force')

/** Downloads an image from a URL to a temporary file */
async function downloadImage(url: string, filename: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  const tmpPath = path.join(os.tmpdir(), filename)
  fs.writeFileSync(tmpPath, buffer)
  return tmpPath
}

/** Generates a slug from a name string */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function seed() {
  console.log('\n🌱 Seeding TecnoVitrina...\n')

  const payload = await getPayload({ config })

  // ── Idempotency check ───────────────────────────────────────────
  const existingProducts = await payload.find({ collection: 'products', limit: 1 })

  if (existingProducts.totalDocs > 0 && !FORCE_FLAG) {
    console.log('⚠️  Database already has products. Use --force to reseed.')
    process.exit(0)
  }

  if (FORCE_FLAG && existingProducts.totalDocs > 0) {
    console.log('🗑️  --force flag detected. Deleting existing data...')

    // Delete in dependency order: products → media → categories
    const allProducts = await payload.find({ collection: 'products', limit: 1000 })
    for (const product of allProducts.docs) {
      await payload.delete({ collection: 'products', id: product.id })
    }
    console.log(`   Deleted ${allProducts.totalDocs} products`)

    const allMedia = await payload.find({ collection: 'media', limit: 1000 })
    for (const media of allMedia.docs) {
      await payload.delete({ collection: 'media', id: media.id })
    }
    console.log(`   Deleted ${allMedia.totalDocs} media items`)

    const allCategories = await payload.find({ collection: 'categories', limit: 1000 })
    // Delete children first (they reference parents)
    const children = allCategories.docs.filter((c) => c.parent !== null && c.parent !== undefined)
    const parents = allCategories.docs.filter((c) => c.parent === null || c.parent === undefined)
    for (const cat of children) {
      await payload.delete({ collection: 'categories', id: cat.id })
    }
    for (const cat of parents) {
      await payload.delete({ collection: 'categories', id: cat.id })
    }
    console.log(`   Deleted ${allCategories.totalDocs} categories\n`)
  }

  // ── Create categories ───────────────────────────────────────────
  const totalChildren = categories.reduce((acc, c) => acc + (c.children?.length ?? 0), 0)
  console.log(`📁 Creating categories... (${categories.length} parents, ${totalChildren} children)`)

  const categoryMap = new Map<string, number>() // slug → id

  for (const parentCat of categories) {
    const parent = await payload.create({
      collection: 'categories',
      data: {
        name: parentCat.name,
        slug: parentCat.slug,
        description: parentCat.description,
        sortOrder: parentCat.sortOrder,
        isActive: true,
      },
    })
    categoryMap.set(parentCat.slug, parent.id)
    console.log(`   📁 ${parentCat.name}`)

    if (parentCat.children) {
      for (const childCat of parentCat.children) {
        const child = await payload.create({
          collection: 'categories',
          data: {
            name: childCat.name,
            slug: childCat.slug,
            description: childCat.description,
            sortOrder: childCat.sortOrder,
            isActive: true,
            parent: parent.id,
          },
        })
        categoryMap.set(childCat.slug, child.id)
        console.log(`      └── ${childCat.name}`)
      }
    }
  }

  // ── Create products with images ─────────────────────────────────
  console.log(`\n📦 Creating products... (${products.length} total)`)

  let mediaCount = 0

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const productIndex = `[${i + 1}/${products.length}]`

    // Look up category
    const categoryId = categoryMap.get(product.categorySlug)
    if (!categoryId) {
      console.error(`   ❌ ${productIndex} Category "${product.categorySlug}" not found — skipping ${product.name}`)
      continue
    }

    // Download and upload image
    let mediaId: number | undefined
    try {
      console.log(`   📦 ${productIndex} ${product.name} — downloading image...`)
      const tmpPath = await downloadImage(product.imageUrl, `${product.sku}.jpg`)

      const media = await payload.create({
        collection: 'media',
        data: { alt: product.imageAlt },
        filePath: tmpPath,
      })
      mediaId = media.id
      mediaCount++

      // Clean up temp file
      try { fs.unlinkSync(tmpPath) } catch { /* ignore cleanup errors */ }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.warn(`   ⚠️  ${productIndex} Image download failed: ${errorMessage} — creating product without image`)
    }

    // Create product
    await payload.create({
      collection: 'products',
      data: {
        name: product.name,
        slug: slugify(product.name),
        price: product.price,
        sku: product.sku,
        stockQuantity: product.stockQuantity,
        isPricePublic: product.isPricePublic,
        isAvailable: true,
        featured: product.featured,
        category: categoryId,
        ...(mediaId ? { images: [mediaId] } : {}),
      },
    })
    console.log(`   ✅ ${productIndex} ${product.name}`)

    // Small delay between requests to avoid overwhelming Unsplash
    if (i < products.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }

  // ── Update site settings ────────────────────────────────────────
  console.log('\n⚙️  Updating site settings...')
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      storeName: siteSettings.storeName,
      whatsappNumber: siteSettings.whatsappNumber,
      whatsappMessageTemplate: siteSettings.whatsappMessageTemplate,
      currencySymbol: siteSettings.currencySymbol,
    },
  })

  // ── Summary ─────────────────────────────────────────────────────
  const totalCategories = categories.length + totalChildren
  console.log(`\n✅ Seed complete!`)
  console.log(`   📁 ${totalCategories} categories`)
  console.log(`   📦 ${products.length} products`)
  console.log(`   🖼️  ${mediaCount} media items`)
  console.log(`   ⚙️  Site settings configured as "${siteSettings.storeName}"\n`)

  process.exit(0)
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})
