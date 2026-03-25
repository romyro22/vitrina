# Plan: UI Overhaul + Fill the Gaps

**Created:** 2026-03-25
**Status:** draft
**Confidence Score:** 8/10
**Estimated Tasks:** 14
**Estimated Files:** ~30

## Summary

Complete visual redesign of the Vitrina storefront with a distinctive, production-grade aesthetic (replacing the current grayscale default shadcn theme), plus filling the four infrastructure gaps: Lexical rich text rendering, pino structured logging, Valkey cache integration, and Vitest test setup with initial coverage.

## Approach

**UI Overhaul:** Redesign every storefront component and page using `/frontend-design` for each visual task. The current theme is stock shadcn grayscale — we'll introduce a warm, distinctive color palette and richer visual hierarchy. All 8 components + 4 pages + 2 layout pieces get refreshed.

**Gaps:** Implement in dependency order — logger first (used everywhere), then Lexical renderer (unblocks product descriptions), then Valkey cache (performance layer), then Vitest + tests (validates everything).

---

## Part A: UI Overhaul

### Task 1: Design System — Color Palette & Theme [UI]
**Files:** `src/app/globals.css`
**Description:**
Replace the stock grayscale shadcn/ui palette with a distinctive, warm color system. The current theme has 0% saturation on every HSL variable — it needs personality.

Requirements:
- Define a new light mode palette with a warm primary color (not blue — differentiate from generic templates)
- Update dark mode palette to match
- Keep the CSS custom property structure (`--background`, `--foreground`, `--primary`, etc.) intact — all components use these
- Add a custom accent color for the WhatsApp CTA (currently hardcoded `#25D366`)
- Consider adding a subtle background texture or gradient variable

**Validation:**
- [ ] All existing color references (`text-foreground`, `bg-primary`, etc.) resolve correctly
- [ ] Light and dark mode both look intentional, not auto-generated
- [ ] No broken contrast ratios (WCAG AA minimum)

---

### Task 2: Typography & Base Styles [UI]
**Files:** `src/app/layout.tsx`, `src/app/globals.css`
**Description:**
Introduce a custom font pairing via `next/font`. The current setup uses the browser default sans-serif.

Requirements:
- Import a display font (headings) and a body font via `next/font/google`
- Apply via CSS variables and Tailwind config
- Add base prose styles for rich text content (will be used by Lexical renderer in Task 10)
- Set up font-feature-settings for tabular numbers (prices)

**Validation:**
- [ ] Fonts load without layout shift (Next.js `next/font` handles this)
- [ ] Heading hierarchy is visually distinct from body text
- [ ] Price numbers align properly in grids

---

### Task 3: Header Redesign [UI]
**Files:** `src/components/header.tsx`
**Description:**
Redesign the sticky header. Current header is a basic flex row with logo + search.

Requirements:
- Keep sticky behavior with backdrop blur
- Add navigation links: "Inicio", "Productos", and category dropdown (or top categories inline)
- Improve search bar visual treatment (current is basic input)
- Add mobile hamburger menu for small screens
- Logo area should feel branded, not generic
- The header receives `storeName` and `logoUrl` props — keep this interface

Note: If a mobile menu is added as a separate client component, create `src/components/mobile-menu.tsx`.

**Validation:**
- [ ] Responsive: works on 320px through 1440px+
- [ ] Search is accessible (label, keyboard nav)
- [ ] No hydration errors (server/client boundary clean)

---

### Task 4: Footer Redesign [UI]
**Files:** `src/components/footer.tsx`
**Description:**
Current footer is a single line with copyright. Expand it to feel complete.

Requirements:
- Add a WhatsApp contact link (use the whatsappNumber from SiteSettings — will need to pass it as prop or fetch in layout)
- Add quick navigation links (Inicio, Productos, categorias)
- Keep copyright line
- Consider a "Powered by Vitrina" subtle branding
- Props interface may need to expand: `FooterProps { storeName: string; whatsappNumber?: string }`

Update `src/app/(storefront)/layout.tsx` to pass the new props.

**Validation:**
- [ ] Footer has clear visual sections
- [ ] WhatsApp link works (opens wa.me)
- [ ] Responsive layout

---

### Task 5: Product Card Redesign [UI]
**Files:** `src/components/product-card.tsx`
**Description:**
The product card is the most-seen component. Current version is a basic bordered card with image + name + price.

Requirements:
- Add subtle hover animation beyond just `scale-105` on image
- Improve price typography (use tabular figures)
- Add a small WhatsApp icon or "Consultar" badge when `isPricePublic` is false
- Improve the "No disponible" overlay treatment
- The "Sin imagen" placeholder should look intentional, not broken
- Keep the same `ProductCardProps` interface

**Validation:**
- [ ] Cards look good at all grid sizes (2-col mobile, 3-col tablet, 4-col desktop)
- [ ] Hover state is visible but not distracting
- [ ] Price and "Consultar precio" have clear visual hierarchy

---

### Task 6: Product Grid Enhancement [UI]
**Files:** `src/components/product-grid.tsx`
**Description:**
Minor adjustments to the grid component.

Requirements:
- Improve the empty state ("No se encontraron productos") — add an illustration or icon
- Consider staggered fade-in animation for cards (CSS only, no JS library)
- Keep the responsive grid breakpoints: 2 / 3 / 4 columns
- Keep same `ProductGridProps` interface

**Validation:**
- [ ] Empty state is visually informative
- [ ] Grid spacing is consistent across breakpoints

---

### Task 7: Category Navigation Redesign [UI]
**Files:** `src/components/category-nav.tsx`
**Description:**
Current implementation is horizontally-wrapping pill buttons. Works but looks generic.

Requirements:
- Consider horizontal scroll with fade edges on mobile instead of wrapping
- Improve active state visual treatment (current is filled primary)
- Add subtle transition between active/inactive states
- Keep the `CategoryNavProps` interface (`categories`, `activeSlug`)

**Validation:**
- [ ] Horizontal scroll works on mobile without breaking layout
- [ ] Active category is clearly distinguished
- [ ] Keyboard accessible

---

### Task 8: Search Bar Redesign [UI]
**Files:** `src/components/search-bar.tsx`
**Description:**
Current search is a basic text input with icon. It's functional but plain.

Requirements:
- Improve focus states and visual treatment
- Consider a Command+K / Ctrl+K keyboard shortcut hint
- Add a subtle loading/searching state
- Keep the same behavior: form submit navigates to `/products?q=...`
- Remains a `'use client'` component

**Validation:**
- [ ] Focus state is clearly visible
- [ ] Submit works on Enter
- [ ] Responsive width (current `max-w-md` may need adjustment)

---

### Task 9: Home Page Redesign [UI]
**Files:** `src/app/(storefront)/page.tsx`
**Description:**
Current home page is: title → category nav → featured grid → "ver todos" link. Functional but flat.

Requirements:
- Add a hero section with store name and tagline (use data from `SiteSettings`)
- Featured products section with a stronger visual treatment (larger first card? carousel?)
- Category nav integrated naturally (not just a raw pill list)
- Clear CTA to browse all products
- Keep using `getSiteSettings()`, `getFeaturedProducts()`, `getCategories()` from payload-helpers

**Validation:**
- [ ] Hero section has visual impact
- [ ] Featured products are prominently displayed
- [ ] Page works with 0 featured products and 0 categories (empty states)

---

### Task 9b: Products List Page Redesign [UI]
**Files:** `src/app/(storefront)/products/page.tsx`
**Description:**
Current page is: title → category nav → product grid → pagination. Clean but basic.

Requirements:
- Add results count ("12 productos encontrados")
- Improve search results feedback when `q` param is present
- Consider a sort dropdown (newest, price low-high, price high-low) — this requires adding a `sort` param to `getProducts()` and `searchProducts()` in `src/lib/payload-helpers.ts`
- Category nav should show active state when filtered
- Pagination redesign is handled in Task 9c

**Validation:**
- [ ] Results count is accurate
- [ ] Search query is shown and clearable
- [ ] Sort changes URL params (server-side, no client state needed)

---

### Task 9c: Pagination Redesign [UI]
**Files:** `src/components/pagination.tsx`
**Description:**
Current pagination is minimal: prev/next arrows with "1 / 5" text. Works but could be better.

Requirements:
- Add page number buttons (show up to 5 pages with ellipsis for large sets)
- Improve disabled state visual treatment
- Keep the `PaginationProps` interface but ensure it supports the new page number display
- Keep it as a server component (Link-based, no client state)

**Validation:**
- [ ] Page numbers are clickable links
- [ ] Current page is highlighted
- [ ] Ellipsis shows correctly for > 5 pages
- [ ] Works with 1 page (renders nothing), 2 pages, 5+ pages

---

### Task 9d: Product Detail Page Redesign [UI]
**Files:** `src/app/(storefront)/products/[slug]/page.tsx`
**Description:**
The product detail page has the most content. Current layout: back link → image gallery (main + thumbnails) → product info column.

Requirements:
- Improve image gallery — add clickable thumbnails that swap the main image (will require a client component `src/components/product-image-gallery.tsx`)
- Better price section with stronger visual weight
- Improve WhatsApp CTA area — make it more prominent
- Rich text description will be handled by Task 10 (Lexical renderer) — for now, just ensure there's a clean container for it
- Improve availability badges
- Breadcrumb navigation (Home → Category → Product Name) instead of just back arrow
- Keep `generateMetadata` function

**Validation:**
- [ ] Image gallery thumbnail click works
- [ ] Breadcrumbs show correct hierarchy
- [ ] WhatsApp button is the most prominent CTA
- [ ] Page looks good with 0 images, 1 image, and 5+ images

---

### Task 9e: Category Page & Not Found Page [UI]
**Files:** `src/app/(storefront)/categories/[slug]/page.tsx`, `src/app/(storefront)/not-found.tsx`
**Description:**
Minor visual updates to match the new design system.

Requirements:
- Category page: add category description with better typography, match products page layout
- Not-found page: add a distinctive illustration or visual (SVG), improve copy, add search bar

**Validation:**
- [ ] Category page matches products page visual style
- [ ] 404 page is helpful (search + home link)

---

## Part B: Fill the Gaps

### Task 10: Lexical Rich Text Renderer
**Files:** `src/components/rich-text-renderer.tsx`, `src/app/(storefront)/products/[slug]/page.tsx`
**Description:**
Product descriptions are stored as Lexical JSON (type `SerializedEditorState`) but currently render as "Consulta mas detalles por WhatsApp." placeholder text.

Implementation:
1. Create `src/components/rich-text-renderer.tsx`:
   ```tsx
   import { RichText } from '@payloadcms/richtext-lexical/react'
   import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
   ```
2. Use the `RichText` component from `@payloadcms/richtext-lexical/react` — it includes built-in converters for all default Lexical node types
3. Pass `data={product.description}` as `SerializedEditorState`
4. Add custom upload converter to use `next/image` for optimized images
5. Add custom link converter for internal links to products/categories
6. Style the output with Tailwind `prose` classes
7. Replace the placeholder in `products/[slug]/page.tsx` lines 154-163

The `@payloadcms/richtext-lexical` package is already installed (it's in dependencies). No new packages needed.

**Validation:**
- [ ] Rich text renders headings, paragraphs, lists, bold, italic
- [ ] Embedded images use `next/image`
- [ ] Internal links resolve to correct routes
- [ ] Empty/null descriptions don't crash
- [ ] `npm run build` passes

---

### Task 11: Pino Structured Logger
**Files:** `src/lib/logger.ts`, `package.json`
**Description:**
Set up pino as documented in `.claude/sections/05_logging.md`.

Implementation:
1. `npm install pino pino-pretty`
2. Create `src/lib/logger.ts`:
   - Export `logger` (root instance)
   - Export `getLogger(module: string)` returning a child logger
   - Use `pino-pretty` in development, JSON in production
   - Read `LOG_LEVEL` from env (default: `"info"`)
3. Add structured logging to `src/lib/payload-helpers.ts`:
   - Log `product_fetched`, `products_listed`, `category_fetched` at `info` level
   - Log `product_not_found`, `category_not_found` at `warn` level
   - Include timing (`durationMs`) for each query
4. Add logger to `src/hooks/trackPriceChanges.ts`:
   - Log `price_changed` with `{ productId, oldPrice, newPrice }`

**Validation:**
- [ ] `npm run build` passes (pino works in both server and edge)
- [ ] Dev server shows colored, formatted logs
- [ ] No secrets logged

---

### Task 12: Valkey Cache Integration
**Files:** `src/lib/cache.ts`, `src/lib/payload-helpers.ts`, `package.json`
**Description:**
Wire Valkey (Redis-compatible, already running in Docker on port 6379) into the app for caching frequently-read data.

Implementation:
1. `npm install ioredis`
2. Create `src/lib/cache.ts`:
   - Export a singleton `ioredis` client connected to `VALKEY_URL` env var (default `redis://localhost:6379`)
   - Export `getCached<T>(key: string, fetcher: () => Promise<T>, ttlSeconds: number): Promise<T>`
   - The helper checks cache first, calls fetcher on miss, stores result with TTL
   - Export `invalidateCache(pattern: string): Promise<void>` for cache busting
3. Update `src/lib/payload-helpers.ts`:
   - Wrap `getSiteSettings()` with 5-minute cache (changes rarely)
   - Wrap `getCategories()` with 5-minute cache
   - Do NOT cache product queries (they change frequently and have pagination)
4. Add `VALKEY_URL` to `.env.example` if it exists
5. Graceful degradation: if Valkey is unavailable, skip cache and query Payload directly

**Validation:**
- [ ] App starts and works without Valkey running (graceful fallback)
- [ ] With Valkey running: `getSiteSettings()` hits cache on second call
- [ ] Cache is JSON-serializable (no circular refs)
- [ ] `npm run build` passes

---

### Task 13: Vitest Setup
**Files:** `vitest.config.ts`, `tests/setup.ts`, `package.json`, `tsconfig.json`
**Description:**
Set up the test infrastructure as documented in `.claude/sections/06_testing.md`.

Implementation:
1. `npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom`
2. Create `vitest.config.ts`:
   - Use `@vitejs/plugin-react`
   - Set environment to `jsdom`
   - Configure path alias `@/` → `src/`
   - Set `setupFiles: ['./tests/setup.ts']`
3. Create `tests/setup.ts`:
   - Import `@testing-library/jest-dom/vitest`
4. Add scripts to `package.json`:
   - `"test": "vitest"`
   - `"test:run": "vitest run"`
   - `"test:coverage": "vitest run --coverage"`

**Validation:**
- [ ] `npx vitest run` executes (even with 0 tests)
- [ ] Path alias `@/` resolves in test files
- [ ] JSX/TSX test files are supported

---

### Task 14: Initial Test Suite
**Files:** `tests/lib/whatsapp.test.ts`, `tests/lib/cache.test.ts`, `tests/components/product-card.test.tsx`
**Description:**
Write foundational tests for the most critical utilities and one component.

Tests to write:

**`tests/lib/whatsapp.test.ts`:**
- `buildWhatsAppUrl` encodes product name correctly
- `buildWhatsAppUrl` handles null price (shows "Consultar")
- `buildWhatsAppUrl` strips non-numeric characters from phone number
- `buildWhatsAppUrl` uses custom currency symbol

**`tests/lib/cache.test.ts`:**
- `getCached` calls fetcher on cache miss
- `getCached` returns cached value on hit (mock ioredis)
- `getCached` falls back to fetcher when Valkey is down
- `invalidateCache` deletes matching keys

**`tests/components/product-card.test.tsx`:**
- Renders product name and price
- Shows "Consultar precio" when `isPricePublic` is false
- Shows "No disponible" overlay when `isAvailable` is false
- Links to correct product slug URL

**Validation:**
- [ ] All tests pass: `npx vitest run`
- [ ] No flaky tests (no timers, no network)
- [ ] Tests follow structure: `tests/` mirrors `src/`

---

## Dependencies

| Package | Version | Purpose | Dev? |
|---|---|---|---|
| `pino` | latest | Structured logging | No |
| `pino-pretty` | latest | Dev log formatting | Yes |
| `ioredis` | latest | Valkey/Redis client | No |
| `vitest` | latest | Test runner | Yes |
| `@testing-library/react` | latest | Component testing | Yes |
| `@testing-library/jest-dom` | latest | DOM assertions | Yes |
| `@vitejs/plugin-react` | latest | JSX support in Vitest | Yes |
| `jsdom` | latest | DOM environment for tests | Yes |

No new UI packages needed — `@payloadcms/richtext-lexical`, `lucide-react`, `tailwind-merge`, and `clsx` are already installed.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| UI overhaul breaks existing functionality | Run `npm run lint && npx tsc --noEmit && npm run build` after each UI task |
| Lexical `RichText` component version mismatch | Package is already installed at `latest` — use Context7 MCP to verify API |
| Valkey connection failure in production | Graceful fallback in `cache.ts` — catch connection errors and skip cache |
| Font loading performance | Use `next/font` which automatically self-hosts and preloads |
| ioredis bundle size in edge runtime | `payload-helpers.ts` runs in Node.js server components, not edge — safe |

## Out of Scope

- Dark mode toggle UI (vars are defined but no toggle mechanism — separate feature)
- Product sorting backend (Task 9b adds UI; if backend changes feel too large, defer to next plan)
- SEO metadata enhancements beyond what exists
- Analytics / tracking
- i18n beyond Spanish
- Inventory management system (future feature mentioned by user)
- E2E tests (Playwright) — start with unit/component tests first

## Execution Order

Tasks should be executed in this order for clean dependency chain:

1. **Task 11** — Pino logger (used by subsequent tasks)
2. **Task 1** — Design system / theme
3. **Task 2** — Typography
4. **Task 3** — Header
5. **Task 4** — Footer
6. **Task 5** — Product card
7. **Task 6** — Product grid
8. **Task 7** — Category nav
9. **Task 8** — Search bar
10. **Task 9c** — Pagination
11. **Task 9** — Home page
12. **Task 9b** — Products page
13. **Task 9d** — Product detail page
14. **Task 9e** — Category + 404 pages
15. **Task 10** — Lexical renderer
16. **Task 12** — Valkey cache
17. **Task 13** — Vitest setup
18. **Task 14** — Initial tests

Run validation (`npm run lint && npx tsc --noEmit && npm run build`) after tasks 2, 4, 10, 12, and 14.
