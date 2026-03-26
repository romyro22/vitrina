# Plan: Storefront Enhancements Sprint (4 PIV Cycles)

**Created:** 2026-03-26
**Status:** executed
**Confidence Score:** 9/10
**Estimated Tasks:** 8 (2 per feature × 4 features)
**Estimated Files:** ~10

## Summary

Four quick-win storefront improvements delivered as sequential PIV (Plan → Implement → Validate) cycles: blur image placeholders, related products section, JSON-LD structured data, and a floating WhatsApp button. Each cycle is independent and commits separately.

## Approach

Each feature follows a strict PIV loop with fix iterations:

```
PIV Cycle:
  1. PLAN    — read this section for implementation details
  2. IMPLEMENT — execute the tasks
  3. VALIDATE  — run: /validate
     ├── PASS → /commit → next PIV cycle
     └── FAIL → fix errors → go to step 3 (repeat until PASS)
```

If validation fails, the executor must:
1. Read the error output
2. Fix the issue in the relevant file(s)
3. Re-run `/validate`
4. Only proceed to `/commit` when all checks pass
5. Maximum 3 fix attempts per cycle — if still failing, stop and report

---

## PIV Cycle 1: Blur Image Placeholders

### Task 1.1: Add blurDataUrl field to Media collection + afterChange hook
**Files:** `src/collections/Media.ts` (modify), `src/hooks/generateBlurPlaceholder.ts` (create)
**Description:**

**1.1a. Add field to Media collection:**
Add a `blurDataUrl` field to the Media collection that stores a base64 blur placeholder string. This field is auto-generated, not user-editable:

```ts
{
  name: 'blurDataUrl',
  type: 'text',
  admin: {
    readOnly: true,
    position: 'sidebar',
    description: 'Auto-generated blur placeholder for Next.js Image',
  },
}
```

**1.1b. Create afterChange hook:**
Create `src/hooks/generateBlurPlaceholder.ts`:

```ts
import type { CollectionAfterChangeHook } from 'payload'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { getLogger } from '@/lib/logger'

const log = getLogger('hooks:blur-placeholder')

export const generateBlurPlaceholder: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  // Only run on create/update when we have a filename and it's an image
  if (!doc.filename || !doc.mimeType?.startsWith('image/')) return doc
  if (doc.blurDataUrl && operation === 'update') return doc // Already has blur

  try {
    const mediaDir = path.resolve(process.cwd(), 'media')
    const filePath = path.join(mediaDir, doc.filename)

    if (!fs.existsSync(filePath)) return doc

    const buffer = await sharp(filePath)
      .resize(10, 10, { fit: 'inside' })
      .toFormat('png')
      .toBuffer()

    const blurDataUrl = `data:image/png;base64,${buffer.toString('base64')}`

    // Update the document with the blur placeholder (bypass hooks to avoid recursion)
    await req.payload.update({
      collection: 'media',
      id: doc.id,
      data: { blurDataUrl },
      overrideAccess: true,
    })

    log.info({ mediaId: doc.id }, 'blur_placeholder_generated')
  } catch (error) {
    log.warn({ mediaId: doc.id, error }, 'blur_placeholder_failed')
  }

  return doc
}
```

Register the hook in `Media.ts`:
```ts
import { generateBlurPlaceholder } from '../hooks/generateBlurPlaceholder'
// ...
hooks: {
  afterChange: [generateBlurPlaceholder],
},
```

After adding the field, run `npm run generate:types` to update `payload-types.ts` with the new `blurDataUrl` field on the `Media` interface.

**Validation:**
- [ ] `npm run generate:types` succeeds
- [ ] `npx tsc --noEmit` passes
- [ ] Media type now has `blurDataUrl?: string | null`

---

### Task 1.2: Use blurDataUrl in ProductCard and ProductImageGallery
**Files:** `src/components/product-card.tsx` (modify), `src/components/product-grid.tsx` (modify), `src/components/product-image-gallery.tsx` (modify), `src/app/(storefront)/products/[slug]/page.tsx` (modify)
**Description:**

**1.2a. Add `blurDataUrl` to ProductCard props:**
```ts
interface ProductCardProps {
  // ... existing props
  blurDataUrl?: string | null
}
```

In the `<Image>` component, add the blur placeholder:
```tsx
<Image
  src={imageUrl}
  alt={imageAlt || name}
  fill
  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
  placeholder={blurDataUrl ? 'blur' : 'empty'}
  blurDataURL={blurDataUrl ?? undefined}
/>
```

**1.2b. Pass blurDataUrl through ProductGrid:**
Add a `getBlurDataUrl` function similar to `getImageUrl`:
```ts
function getBlurDataUrl(product: Product): string | undefined {
  const firstImage = Array.isArray(product.images) ? product.images[0] : undefined
  if (!firstImage || typeof firstImage === 'number') return undefined
  // SAFETY: typeof guard above eliminates `number` from the union `number | Media`
  return (firstImage as Media).blurDataUrl ?? undefined
}
```
Pass it to `<ProductCard blurDataUrl={getBlurDataUrl(product)} />`.

**1.2c. Add blurDataUrl to ProductImageGallery:**
Add `blurDataUrl` to the `GalleryImage` interface and the main image `<Image>`:
```tsx
interface GalleryImage {
  id: number
  url: string
  alt: string
  thumbnailUrl?: string | null
  blurDataUrl?: string | null  // Add this
}
```
On the main `<Image>`:
```tsx
placeholder={selected.blurDataUrl ? 'blur' : 'empty'}
blurDataURL={selected.blurDataUrl ?? undefined}
```

**1.2d. Update product detail page to pass blurDataUrl:**
In `src/app/(storefront)/products/[slug]/page.tsx`, add `blurDataUrl` to the image mapping:
```ts
.map((img) => ({
  id: img.id,
  url: img.url ?? '',
  alt: img.alt || product.name,
  thumbnailUrl: img.sizes?.thumbnail?.url ?? null,
  blurDataUrl: img.blurDataUrl ?? null,  // Add this
}))
```

**Validation:**
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `npx vitest run` passes

---

## PIV Cycle 2: Related Products

### Task 2.1: Add getRelatedProducts helper
**Files:** `src/lib/payload-helpers.ts` (modify)
**Description:**

Add a new helper function that fetches products from the same category, excluding the current product:

```ts
/** Fetches related products from the same category, excluding the given product ID */
export async function getRelatedProducts(categoryId: number, excludeProductId: number, limit = 4) {
  const start = Date.now()
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'products',
    where: {
      isAvailable: { equals: true },
      category: { equals: categoryId },
      id: { not_equals: excludeProductId },
    },
    limit,
    sort: '-createdAt',
    depth: 2,
  })
  log.info(
    { categoryId, excludeProductId, count: result.totalDocs, durationMs: Date.now() - start },
    'related_products_fetched',
  )
  return result
}
```

**Validation:**
- [ ] `npx tsc --noEmit` passes

---

### Task 2.2: Add RelatedProducts section to product detail page [UI]
**Files:** `src/app/(storefront)/products/[slug]/page.tsx` (modify)
**Description:**

After the product detail grid (after the closing `</div>` of the 2-column grid), add a related products section:

1. Import `getRelatedProducts` from `@/lib/payload-helpers` and `ProductGrid` from `@/components/product-grid`.
2. In the page component, after the existing `Promise.all`, fetch related products if a category exists:
```ts
const relatedProducts = category
  ? await getRelatedProducts(category.id, product.id)
  : null
```
3. Render below the product detail grid (still inside the outer `<div className="mx-auto max-w-7xl ...">` wrapper):
```tsx
{/* Related products */}
{relatedProducts && relatedProducts.docs.length > 0 && (
  <section className="mt-16 border-t border-border/40 pt-10">
    <h2 className="mb-6 font-[family-name:var(--font-display)] text-xl font-bold text-foreground">
      También te puede interesar
    </h2>
    <ProductGrid products={relatedProducts.docs} currencySymbol={currencySymbol} />
  </section>
)}
```

**Validation:**
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `npx vitest run` passes

---

## PIV Cycle 3: JSON-LD Structured Data

### Task 3.1: Add ProductJsonLd component
**Files:** `src/components/product-json-ld.tsx` (create)
**Description:**

Create a server component that renders a `<script type="application/ld+json">` tag with Google's Product schema:

```tsx
import type { Product, Media, Category } from '@/payload-types'

interface ProductJsonLdProps {
  product: Product
  currencySymbol: string
  siteUrl: string
}

/** Renders JSON-LD structured data for Google rich results */
export function ProductJsonLd({ product, currencySymbol, siteUrl }: ProductJsonLdProps) {
  const category = product.category && typeof product.category === 'object'
    ? product.category as Category  // SAFETY: typeof guard narrows from number | Category
    : null

  const firstImage = Array.isArray(product.images) ? product.images[0] : undefined
  const imageUrl = firstImage && typeof firstImage === 'object'
    ? (firstImage as Media).url  // SAFETY: typeof guard narrows from number | Media
    : undefined

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(imageUrl ? { image: `${siteUrl}${imageUrl}` } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(category ? { category: category.name } : {}),
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: 'USD',
      ...(product.isPricePublic && product.price != null
        ? { price: product.price.toString() }
        : {}),
      availability: product.isAvailable
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

**Validation:**
- [ ] `npx tsc --noEmit` passes

---

### Task 3.2: Add ProductJsonLd to product detail page
**Files:** `src/app/(storefront)/products/[slug]/page.tsx` (modify)
**Description:**

1. Import `ProductJsonLd` from `@/components/product-json-ld`.
2. Get the site URL: `const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'`
3. Wrap the page return in a fragment and add the JSON-LD as the first child:

```tsx
return (
  <>
    <ProductJsonLd product={product} currencySymbol={currencySymbol} siteUrl={siteUrl} />
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      {/* ... existing content */}
    </div>
  </>
)
```

**Validation:**
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `npx vitest run` passes

---

## PIV Cycle 4: WhatsApp Floating Button

### Task 4.1: Create WhatsAppFab component [UI]
**Files:** `src/components/whatsapp-fab.tsx` (create)
**Description:**

Create a floating action button (FAB) that appears on all storefront pages. It's a client component fixed to the bottom-right corner:

```tsx
'use client'

import { MessageCircle } from 'lucide-react'

interface WhatsAppFabProps {
  whatsappNumber: string
}

/** Floating WhatsApp button visible on all storefront pages */
export function WhatsAppFab({ whatsappNumber }: WhatsAppFabProps) {
  const cleanNumber = whatsappNumber.replace(/\D/g, '')

  const handleClick = () => {
    window.open(
      `https://wa.me/${cleanNumber}?text=${encodeURIComponent('Hola! Me gustaría hacer una consulta.')}`,
      '_blank',
    )
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#1da851] hover:shadow-xl active:scale-95 sm:bottom-8 sm:right-8"
      aria-label="Consultar por WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  )
}
```

Design notes:
- Fixed position, bottom-right, with `z-40` (below header's `z-50`)
- WhatsApp green (`#25D366`) matching the existing WhatsApp brand color
- Scale animation on hover (110%) and press (95%)
- Larger margin on desktop (`sm:bottom-8 sm:right-8`)
- Generic greeting message (not product-specific — that's what the product detail WhatsAppButton is for)

**Validation:**
- [ ] `npx tsc --noEmit` passes

---

### Task 4.2: Add WhatsAppFab to storefront layout
**Files:** `src/app/(storefront)/layout.tsx` (modify)
**Description:**

1. Import `WhatsAppFab` from `@/components/whatsapp-fab`.
2. Add it inside the storefront wrapper div, after `<Footer>`:

```tsx
<div className="storefront flex min-h-screen flex-col">
  <Header storeName={settings.storeName} logoUrl={logoUrl} />
  <main className="flex-1">{children}</main>
  <Footer storeName={settings.storeName} whatsappNumber={settings.whatsappNumber} />
  {settings.whatsappNumber && (
    <WhatsAppFab whatsappNumber={settings.whatsappNumber} />
  )}
</div>
```

The FAB only renders if a WhatsApp number is configured in Site Settings.

**Validation:**
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `npx vitest run` passes

---

## Dependencies

None — no new npm packages needed. `sharp` is already installed (used by Payload for image processing).

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Blur hook causes recursion (update triggers afterChange again) | Check `doc.blurDataUrl` + `operation === 'update'` to skip if already set |
| Existing media won't have blur placeholders | They'll render without blur (graceful fallback `placeholder="empty"`). A migration script could backfill them later. |
| JSON-LD with missing price may confuse Google | Only include `price` field when `isPricePublic` is true. Google handles missing price gracefully. |
| WhatsApp FAB overlaps footer on mobile | `z-40` + `bottom-6` keeps it above the fold. Footer is not fixed, so no overlap. |
| `getRelatedProducts` returns 0 results for categories with 1 product | Section is conditionally rendered only if `docs.length > 0` |

## Out of Scope

- Backfill blur placeholders for existing media (separate migration task)
- BreadcrumbList JSON-LD (future enhancement)
- Quick view modal (higher complexity, separate sprint)
- WhatsApp Business API integration

## Execution Order

Run these in sequence, each as a full PIV cycle:

```
PIV 1: Blur placeholders
  → /execute (Tasks 1.1 + 1.2)
  → /validate
  → if FAIL: fix → /validate (repeat up to 3x)
  → /commit

PIV 2: Related products
  → /execute (Tasks 2.1 + 2.2)
  → /validate
  → if FAIL: fix → /validate (repeat up to 3x)
  → /commit

PIV 3: JSON-LD structured data
  → /execute (Tasks 3.1 + 3.2)
  → /validate
  → if FAIL: fix → /validate (repeat up to 3x)
  → /commit

PIV 4: WhatsApp FAB
  → /execute (Tasks 4.1 + 4.2)
  → /validate
  → if FAIL: fix → /validate (repeat up to 3x)
  → /commit
```
