# Architecture

## Next.js App Router + Payload CMS

```
src/
├── app/
│   ├── (payload)/        # Admin CMS — Payload auto-manages these routes
│   │   ├── admin/        # Admin dashboard UI
│   │   └── api/          # REST + GraphQL endpoints (auto-generated)
│   └── (storefront)/     # Public storefront — our custom pages
│       ├── page.tsx              # Home (featured products + categories)
│       ├── categories/[slug]/    # Category listing
│       ├── products/             # All products
│       └── products/[slug]/      # Product detail
├── collections/          # Payload collection configs (data models)
├── globals/              # Payload global configs (site settings)
├── hooks/                # Payload lifecycle hooks
├── components/           # React components (shared between routes)
│   └── ui/               # shadcn/ui primitives
├── lib/                  # Utilities and helpers
├── payload.config.ts     # CMS configuration entry point
└── payload-types.ts      # Auto-generated types (DO NOT EDIT)
```

## Where new features go

- **New data model** → `src/collections/NewCollection.ts`, register in `payload.config.ts`
- **New storefront page** → `src/app/(storefront)/new-route/page.tsx`
- **New component** → `src/components/new-component.tsx`
- **New utility** → `src/lib/new-util.ts`
- **New Payload hook** → `src/hooks/hookName.ts`
- **New API endpoint** → Payload handles REST/GraphQL automatically; custom endpoints go in collection config `endpoints` array
