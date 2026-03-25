# Code Style

## Naming

| Thing | Convention | Example |
|---|---|---|
| Files (components, lib) | kebab-case | `product-card.tsx` |
| Files (collections) | PascalCase | `Products.ts` |
| Components | PascalCase | `ProductCard` |
| Functions/variables | camelCase | `getProductsByCategory` |
| Types/interfaces | PascalCase | `ProductCardProps` |
| Constants | SCREAMING_SNAKE | `MAX_PRODUCTS_PER_PAGE` |

## Exports

Named exports for components and utilities. Default exports only where Next.js requires them (pages, layouts, route handlers, `payload.config.ts`).

```tsx
// Good — component
export function ProductCard({ product }: ProductCardProps) { ... }

// Good — page (Next.js requires default export)
export default async function ProductsPage() { ... }

// Bad — default export on a component
export default function ProductCard() { ... }
```

## Import Order

1. React / Next.js
2. Third-party (`payload`, `lucide-react`, `clsx`)
3. `@/` aliased imports (collections, lib, components)
4. Relative imports
5. Type-only imports last

```tsx
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getPayload } from "@/lib/payload-helpers";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/payload-types";
```

## Path Alias

Always use `@/` for `src/` imports. Never use relative paths across directories.

## Props

Define props interfaces inline, co-located with the component:

```tsx
interface ProductCardProps {
  product: Product;
  showCategory?: boolean;
}

export function ProductCard({ product, showCategory = false }: ProductCardProps) { ... }
```
