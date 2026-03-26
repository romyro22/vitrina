# Code Review: Full Stack Overhaul (UI + Docker + Seed + Infrastructure)

**Date:** 2026-03-26
**Reviewer:** AI Code Review
**Commit(s):** 90fa1a0..HEAD (3 commits)
**Files reviewed:** 35

## Summary

Large-scale overhaul covering UI redesign, Docker setup, seed script, ESLint config, Vitest setup, pino logging, Valkey cache, and Lexical rendering. Overall code quality is good with consistent patterns. However, there are 3 critical security findings (empty PAYLOAD_SECRET fallback, weak default in docker-compose, Dockerfile build without env vars), 1 confirmed bug (trackPriceChanges hook blocked by access control), and several medium-severity performance and correctness issues.

## Findings

### CRITICAL

1. **Empty PAYLOAD_SECRET fallback** — `src/payload.config.ts:28`
2. **Default weak secret in docker-compose** — `docker-compose.yml:36`
3. **Dockerfile build without env vars** — `Dockerfile:21`

### HIGH

1. **trackPriceChanges hook blocked by access control** — `src/hooks/trackPriceChanges.ts:15-22`
2. **Double DB fetch for product on detail page** — `src/app/(storefront)/products/[slug]/page.tsx:17,32`
3. **Incorrect type guard for image filter** — `src/app/(storefront)/products/[slug]/page.tsx:41`
4. **`as Media` casts without SAFETY comment** — `src/components/product-grid.tsx:12-13,19`

### MEDIUM

1. **Redis `KEYS` command in production** — `src/lib/cache.ts:83`
2. **Redis singleton not resilient to reconnection** — `src/lib/cache.ts:6-33`
3. **Unsanitized sort parameter from URL** — `src/app/(storefront)/products/page.tsx:16`
4. **Stale URL in WhatsApp button** — `src/components/whatsapp-button.tsx:23`
5. **Double fetch in category page generateMetadata** — `src/app/(storefront)/categories/[slug]/page.tsx:15,30`
6. **No error handling in trackPriceChanges** — `src/hooks/trackPriceChanges.ts:15-22`
7. **Image gallery out-of-bounds risk** — `src/components/product-image-gallery.tsx:32`
8. **Mobile menu doesn't close on route change** — `src/components/mobile-menu.tsx`
9. **Cache test singleton pollution** — `tests/lib/cache.test.ts`
10. **Default PostgreSQL password exposed on host** — `docker-compose.yml:6`
11. **searchProducts LIKE injection** — `src/lib/payload-helpers.ts:117`
12. **.env.example lacks secret requirements** — `.env.example:5`

### LOW

1. **Relative imports instead of `@/`** — `src/components/header.tsx:5-6`, `src/components/product-grid.tsx:1`
2. **Missing JSDoc on some exports** — `src/components/whatsapp-button.tsx`, `src/lib/cache.ts:9`
3. **Hardcoded 200ms seed delay** — `scripts/seed.ts:170`
4. **Sequential deletion in seed --force** — `scripts/seed.ts:49-71`

### INFO

1. `force-dynamic` on layout is a conscious trade-off for Docker deployability — documented in plans.

---

## Detailed Findings

### Finding 1: Empty PAYLOAD_SECRET fallback allows unauthenticated admin access [FIXED]
**Severity:** CRITICAL
**Fixed in:** `src/payload.config.ts` — Throw on missing PAYLOAD_SECRET/DATABASE_URL at startup
**File:** `src/payload.config.ts`
**Line(s):** 28
**Description:** `secret: process.env.PAYLOAD_SECRET || ''` falls back to an empty string if the env var is unset. Payload uses this secret to sign JWT tokens. An empty secret means anyone can forge admin session tokens.
**Suggestion:** Throw at startup if the secret is missing or too short.
```ts
const payloadSecret = process.env.PAYLOAD_SECRET
if (!payloadSecret || payloadSecret.length < 32) {
  throw new Error('PAYLOAD_SECRET must be set and at least 32 characters')
}
// Then use: secret: payloadSecret,
```

---

### Finding 2: Default PAYLOAD_SECRET in docker-compose.yml [FIXED]
**Severity:** CRITICAL
**Fixed in:** `docker-compose.yml` — Use `:?` syntax to require env var, fail if missing
**File:** `docker-compose.yml`
**Line(s):** 36
**Description:** `PAYLOAD_SECRET: ${PAYLOAD_SECRET:-dev-secret-change-in-production}` defaults to a known string. If deployed without setting the env var, all JWT tokens can be forged.
**Suggestion:** Remove the default so docker-compose fails to start without an explicit secret, or use a long random default that is clearly marked for dev only.

---

### Finding 3: Dockerfile build stage has no env vars for Payload [FIXED]
**Severity:** CRITICAL
**Fixed in:** `Dockerfile` — Added build-time ARGs with placeholder values for PAYLOAD_SECRET and DATABASE_URL
**File:** `Dockerfile`
**Line(s):** 21
**Description:** `RUN npm run build` runs without `DATABASE_URL` or `PAYLOAD_SECRET`. Payload's config reads these at build time. The `force-dynamic` on storefront prevents DB access, but Payload admin pages may still need the secret for config validation. If the build breaks in a new Payload version, there's no mechanism to pass build args.
**Suggestion:** Add build-time ARGs with dummy values (matching what the `--experimental-build-mode compile` approach used before).
```dockerfile
ARG PAYLOAD_SECRET=build-time-placeholder-not-used-at-runtime
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}
RUN npm run build
```

---

### Finding 4: trackPriceChanges hook will fail — access control blocks create [FIXED]
**Severity:** HIGH
**Fixed in:** `src/hooks/trackPriceChanges.ts` — Added `overrideAccess: true` + try/catch error handling
**File:** `src/hooks/trackPriceChanges.ts`
**Line(s):** 15-22
**Description:** The `PriceHistory` collection has `create: () => false` in its access control. The hook calls `req.payload.create` without `overrideAccess: true`, so every price change will throw an access denied error, which propagates and blocks the product update entirely.
**Suggestion:**
```ts
await req.payload.create({
  collection: 'price-history',
  data: {
    product: originalDoc.id,
    oldPrice,
    newPrice,
  },
  overrideAccess: true, // Hook runs server-side, bypass access control
})
```
Also wrap in try/catch so logging failures don't block product updates.

---

### Finding 5: Double DB fetch on product detail page [FIXED]
**Severity:** HIGH
**Fixed in:** `src/lib/payload-helpers.ts` — Wrapped `getProductBySlug` and `getCategoryBySlug` with React `cache()` for per-request deduplication
**File:** `src/app/(storefront)/products/[slug]/page.tsx`
**Line(s):** 17, 32
**Description:** `getProductBySlug(slug)` is called once in `generateMetadata` and once in the page component. Each call hits the database. Next.js fetch deduplication does not apply to Payload's local API calls.
**Suggestion:** Use React `cache()` to deduplicate, or restructure to pass data from metadata to the page.

---

### Finding 6: Incorrect type guard — checks for `string` but union is `number | Media` [FIXED]
**Severity:** HIGH
**Fixed in:** `src/app/(storefront)/products/[slug]/page.tsx` — Replaced `typeof img !== 'string'` with `typeof img === 'object' && img !== null`
**File:** `src/app/(storefront)/products/[slug]/page.tsx`
**Line(s):** 41
**Description:** `.filter((img): img is Media => typeof img !== 'string' && typeof img === 'object' && 'url' in img)` — the Payload type is `(number | Media)[]`, not `(string | Media)[]`. The `typeof img !== 'string'` check is checking the wrong type. The `typeof img === 'object'` secondary check saves it, but the guard is misleading.
**Suggestion:** Replace with `typeof img !== 'number'` or just `typeof img === 'object'`.

---

### Finding 7: `as Media` casts without SAFETY comment [FIXED]
**Severity:** HIGH
**Fixed in:** `src/components/product-grid.tsx` — Added `// SAFETY:` comments explaining the typeof guards
**File:** `src/components/product-grid.tsx`
**Line(s):** 12-13, 19
**Description:** Uses `as Media` after a `typeof !== 'number'` guard but per project rules (`CLAUDE.md` section 10), every `as` cast requires a `// SAFETY:` comment.
**Suggestion:** Add SAFETY comments explaining the type guard justifies the cast.

---

## Statistics
- Files reviewed: 35
- Findings: 3 critical / 4 high / 12 medium / 4 low / 1 info
- Overall assessment: **APPROVED** (all CRITICAL and HIGH findings fixed — 12 MEDIUM + 4 LOW remain for future iteration)
