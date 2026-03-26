# Code Review: Storefront Enhancements Sprint

**Date:** 2026-03-26
**Reviewer:** AI Code Review
**Changes:** Uncommitted (post PIV sprint)
**Files reviewed:** 11 (7 modified + 4 new)

## Summary

Four clean features: blur placeholders, related products, JSON-LD structured data, and WhatsApp FAB. Code quality is high — proper SAFETY comments, JSDoc on exports, correct server/client boundaries. One medium issue with the blur hook recursion guard and a few low-severity items.

## Findings

### CRITICAL
None

### HIGH
None

### MEDIUM

1. **Blur hook recursion guard is fragile** — `src/hooks/generateBlurPlaceholder.ts:16`
2. **`currencySymbol` prop unused in ProductJsonLd** — `src/components/product-json-ld.tsx:10`
3. **Related products fetch is sequential, not parallel** — `src/app/(storefront)/products/[slug]/page.tsx:60-62`

### LOW

1. **JSX indentation inside fragment** — `src/app/(storefront)/products/[slug]/page.tsx:67-68`
2. **Unused import type `Category` in product-json-ld** — partially used via cast but imported type is redundant

### INFO

1. Existing media items won't have blur placeholders until re-uploaded or a backfill script is run.

## Detailed Findings

### Finding 1: Blur hook recursion guard is fragile
**Severity:** MEDIUM
**File:** `src/hooks/generateBlurPlaceholder.ts`
**Line(s):** 16
**Description:** `if (doc.blurDataUrl && operation === 'update') return doc` — This guard skips blur generation on update if `blurDataUrl` already exists. However, the `payload.update` call at line 31 triggers another `afterChange` invocation. The guard works because on the second invocation `doc.blurDataUrl` is set. But if the first invocation's `payload.update` somehow fails to set the field (partial write, race condition), the guard won't catch it and it could loop. More importantly, if someone manually clears `blurDataUrl` in the admin panel and saves, the hook will regenerate — which is actually desired behavior. The guard is correct but brittle.
**Suggestion:** Add a context flag or use `req.context` to prevent re-entry:
```ts
if (req.context?.skipBlurGeneration) return doc
// ... generate blur ...
await req.payload.update({
  collection: 'media',
  id: doc.id,
  data: { blurDataUrl },
  overrideAccess: true,
  context: { skipBlurGeneration: true },
})
```

### Finding 2: `currencySymbol` prop unused in ProductJsonLd
**Severity:** MEDIUM
**File:** `src/components/product-json-ld.tsx`
**Line(s):** 4, 10
**Description:** `currencySymbol` is in the interface and passed by the parent, but never used in the component body. The JSON-LD uses hardcoded `priceCurrency: 'USD'`. This is a dead prop.
**Suggestion:** Either remove `currencySymbol` from the interface and the parent's prop passing, or use it to derive the `priceCurrency` field dynamically.

### Finding 3: Related products fetch is sequential
**Severity:** MEDIUM
**File:** `src/app/(storefront)/products/[slug]/page.tsx`
**Line(s):** 60-62
**Description:** `getRelatedProducts` is called after the main `Promise.all` completes, making the product detail page waterfall: first fetch product+settings, then fetch related products. Since the related fetch depends on `category.id`, it can't be in the initial `Promise.all`, but it could be started earlier using conditional logic.
**Suggestion:** This is acceptable for now since related products are at the bottom of the page. Could optimize later with streaming/Suspense.

## Statistics
- Files reviewed: 11
- Findings: 0 critical / 0 high / 3 medium / 2 low / 1 info
- Overall assessment: **APPROVE** (no blockers, medium issues are non-urgent improvements)
