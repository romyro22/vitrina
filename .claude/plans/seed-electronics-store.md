# Plan: Seed Electronics Store + Dockerfile Fix

**Created:** 2026-03-25
**Status:** executed
**Confidence Score:** 8/10
**Estimated Tasks:** 4
**Estimated Files:** 5

## Summary

Create a TypeScript seed script that populates Vitrina with realistic electronics store data: hierarchical categories, 60+ products with Unsplash images, and site settings. Also revert the Dockerfile from `--experimental-build-mode compile` to the stable `force-dynamic` approach to eliminate the React hydration error in Payload's admin panel.

## Approach

Single seed script using Payload's Local API (`getPayload` + `payload.create`) executed outside Next.js via `tsx`. Images are downloaded from Unsplash direct URLs to a temp directory, then uploaded via `filePath`. The script is idempotent — it checks for existing data before creating.

---

## Tasks

### Task 1: Revert Dockerfile to force-dynamic approach
**Files:** `Dockerfile` (modify), `src/app/(storefront)/layout.tsx` (modify)
**Description:**

**1a. Update `src/app/(storefront)/layout.tsx`** — Add `export const dynamic = 'force-dynamic'` back to the storefront layout. This tells Next.js to skip static generation for all storefront pages, so `next build` succeeds without a database connection.

```tsx
// Add this line after the imports, before the component:
export const dynamic = 'force-dynamic'
```

**1b. Update `Dockerfile`** — Replace the two experimental build mode commands with a standard `npm run build`:

Replace:
```dockerfile
RUN npx next build --experimental-build-mode compile
RUN npx next build --experimental-build-mode generate-env
```

With:
```dockerfile
# force-dynamic on storefront layout means no DB needed during build.
# Payload admin pages handle their own dynamic rendering.
RUN npm run build
```

Keep everything else in the Dockerfile unchanged (Node 24, multi-stage, standalone output).

**Validation:**
- [ ] `docker compose up --build -d` succeeds
- [ ] No React hydration error #418 in Payload admin console
- [ ] Storefront pages render correctly at runtime

---

### Task 2: Install tsx and add seed script to package.json
**Files:** `package.json` (modify)
**Description:**

Install `tsx` as a dev dependency — it runs TypeScript files directly without a separate compile step:
```bash
npm install -D tsx
```

Add the seed script to `package.json` scripts:
```json
"seed": "tsx scripts/seed.ts"
```

**Validation:**
- [ ] `npx tsx --version` works
- [ ] `npm run seed` is a valid script (will fail until Task 3 creates the file)

---

### Task 3: Create seed data definitions
**Files:** `scripts/seed-data.ts` (create)
**Description:**

Create a data file that defines all categories, products, and site settings. This separates data from logic for maintainability.

**Categories structure** (parent → children):

```
Celulares y Dispositivos Móviles (sortOrder: 1)
  ├── Celulares & Accesorios (sortOrder: 1)
  ├── Smartwatches y Accesorios (sortOrder: 2)
  └── Tablets y E-Readers (sortOrder: 3)

Audio y Sonido (sortOrder: 2)
  ├── Auriculares (sortOrder: 1)
  ├── Speakers (sortOrder: 2)
  └── Micrófonos y Accesorios (sortOrder: 3)

Entretenimiento, Imagen y Gaming (sortOrder: 3)
  ├── Televisores (sortOrder: 1)
  ├── Consolas (sortOrder: 2)
  ├── Controles (sortOrder: 3)
  ├── Juegos (sortOrder: 4)
  ├── Accesorios para Consolas (sortOrder: 5)
  ├── Proyectores y Pantallas (sortOrder: 6)
  └── Soportes para TV (sortOrder: 7)

Smart Home (sortOrder: 4)
  ├── Cámaras de Seguridad (sortOrder: 1)
  ├── Cerraduras Digitales (sortOrder: 2)
  ├── Alarmas y Sensores (sortOrder: 3)
  ├── Iluminación Conectada (sortOrder: 4)
  └── Interruptores Inteligentes (sortOrder: 5)

Navegación y Movilidad Eléctrica (sortOrder: 5)
  └── Sistemas de Navegación GPS (sortOrder: 1)
```

**Products:** 3-5 per leaf category. Each product definition includes:
- `name`: Realistic Spanish product name (e.g., "Samsung Galaxy S24 Ultra 256GB")
- `categorySlug`: Matches the leaf category slug
- `price`: Realistic USD price
- `sku`: Format `VIT-{CAT}-{NNN}` (e.g., `VIT-CEL-001`)
- `stockQuantity`: Random 5-50
- `isPricePublic`: true for most, false for a few premium items
- `featured`: true for ~8-10 standout products
- `imageQuery`: Unsplash search term for image (e.g., "samsung smartphone")
- `imageUrl`: Direct Unsplash URL `https://images.unsplash.com/photo-{id}?w=800&q=80`

Use real Unsplash photo IDs for each product. The image URLs should be curated — pick actual Unsplash photo IDs that show the right type of product.

**Site settings:**
```ts
{
  storeName: 'TecnoVitrina',
  whatsappNumber: '5491155551234',
  whatsappMessageTemplate: 'Hola! Me interesa el producto "{productName}" ({price}). Lo vi en: {url}',
  currencySymbol: '$',
}
```

Export types:
```ts
interface SeedCategory {
  name: string
  slug: string
  description?: string
  sortOrder: number
  children?: SeedCategory[]
}

interface SeedProduct {
  name: string
  categorySlug: string
  price: number
  sku: string
  stockQuantity: number
  isPricePublic: boolean
  featured: boolean
  imageUrl: string
  imageAlt: string
}
```

**Validation:**
- [ ] File exports `categories`, `products`, and `siteSettings`
- [ ] Every product's `categorySlug` matches a leaf category slug
- [ ] No duplicate SKUs
- [ ] At least 60 products total

---

### Task 4: Create seed script
**Files:** `scripts/seed.ts` (create)
**Description:**

Create the main seed script that uses Payload's Local API to populate the database. The script must:

**1. Initialize Payload outside Next.js:**
```ts
import { getPayload } from 'payload'
import config from '../src/payload.config'
```

Note: Since this runs outside Next.js, we can't use `@payload-config`. Import the config directly from its source path. The script will be run with `tsx` which handles TypeScript + ESM natively.

**2. Idempotency check:**
Before seeding, check if data already exists:
```ts
const existingProducts = await payload.find({ collection: 'products', limit: 1 })
if (existingProducts.totalDocs > 0) {
  console.log('Database already seeded. Use --force to reseed.')
  process.exit(0)
}
```
Support a `--force` flag that deletes all existing data before reseeding.

**3. Create categories (parents first, then children):**
```ts
for (const parentCat of categories) {
  const parent = await payload.create({
    collection: 'categories',
    data: { name, slug, description, sortOrder, isActive: true },
  })
  for (const childCat of parentCat.children) {
    await payload.create({
      collection: 'categories',
      data: { ...childCat, parent: parent.id, isActive: true },
    })
  }
}
```

**4. Download and upload images:**
For each product, download the Unsplash image to a temp file, then upload it to Payload's media collection:
```ts
import fs from 'fs'
import path from 'path'
import os from 'os'

async function downloadImage(url: string, filename: string): Promise<string> {
  const response = await fetch(url)
  const buffer = Buffer.from(await response.arrayBuffer())
  const tmpPath = path.join(os.tmpdir(), filename)
  fs.writeFileSync(tmpPath, buffer)
  return tmpPath
}

// Then upload:
const filePath = await downloadImage(product.imageUrl, `${product.sku}.jpg`)
const media = await payload.create({
  collection: 'media',
  data: { alt: product.imageAlt },
  filePath,
})
fs.unlinkSync(filePath) // Clean up temp file
```

**5. Create products:**
Look up the category by slug, then create:
```ts
const category = await payload.find({
  collection: 'categories',
  where: { slug: { equals: product.categorySlug } },
  limit: 1,
})

await payload.create({
  collection: 'products',
  data: {
    name: product.name,
    price: product.price,
    sku: product.sku,
    stockQuantity: product.stockQuantity,
    isPricePublic: product.isPricePublic,
    isAvailable: true,
    featured: product.featured,
    category: category.docs[0].id,
    images: [media.id],
  },
})
```

**6. Update site settings:**
```ts
await payload.updateGlobal({
  slug: 'site-settings',
  data: siteSettings,
})
```

**7. Progress logging:**
Use `console.log` with progress indicators:
```
🌱 Seeding TecnoVitrina...
📁 Creating categories... (5 parents, 21 children)
📁 [1/5] Celulares y Dispositivos Móviles
   └── Celulares & Accesorios
   └── Smartwatches y Accesorios
   └── Tablets y E-Readers
...
📦 Creating products... (65 total)
📦 [1/65] Samsung Galaxy S24 Ultra 256GB — downloading image...
📦 [1/65] Samsung Galaxy S24 Ultra 256GB — created ✓
...
⚙️  Updating site settings...
✅ Seed complete! Created 26 categories, 65 products, 65 media items.
```

**8. Handle the tsconfig paths:**
Since we're running outside Next.js, `@/` and `@payload-config` aliases won't resolve. The script should use relative imports. Add a `tsconfig.seed.json` that extends the main tsconfig but adjusts paths, OR just use relative paths in the script.

Simplest approach: create a small `scripts/tsconfig.json`:
```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["../src/*"],
      "@payload-config": ["../src/payload.config.ts"]
    }
  }
}
```

And run with: `tsx --tsconfig scripts/tsconfig.json scripts/seed.ts`

Update the package.json seed script accordingly.

**Validation:**
- [ ] `npm run seed` creates categories, products, media, and site settings
- [ ] Running `npm run seed` a second time exits with "already seeded" message
- [ ] `npm run seed -- --force` deletes and recreates all data
- [ ] Images are visible in Payload admin panel
- [ ] Storefront shows products at `http://localhost:3000`

---

## Dependencies

| Package | Version | Purpose | Dev? |
|---|---|---|---|
| `tsx` | latest | Run TypeScript seed script directly | Yes |

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Unsplash URLs might 404 or rate-limit | Use curated, stable photo IDs; add retry logic with delay between downloads |
| Payload slug auto-generation hooks run on `beforeValidate` | Provide slugs explicitly in seed data to avoid non-deterministic slugs |
| `tsx` can't resolve `@payload-config` alias | Use a dedicated `scripts/tsconfig.json` with correct path mappings |
| Large number of sequential creates is slow | Acceptable for a one-time seed script; could batch but not worth the complexity |
| Docker rebuild needed after Dockerfile change | User is already comfortable with `docker compose up --build` |

## Out of Scope

- Seed script for production data (this is test/demo data only)
- Automated image generation or AI-generated product descriptions
- Price history seed data
- User accounts beyond the first admin user (created via `/admin/create-first-user`)
- Logo upload for site settings (can be added manually via admin)
