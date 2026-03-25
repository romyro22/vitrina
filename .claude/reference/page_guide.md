# Next.js Storefront Page Guide

## Step 1: Create the Route Directory

Create `src/app/(storefront)/<route>/page.tsx`:

```typescript
import type { Metadata } from "next";
import { getProducts } from "@/lib/payload-helpers";
import { ProductGrid } from "@/components/product-grid";

export const metadata: Metadata = {
  title: "Productos | Vitrina",
  description: "Explora nuestro catalogo de productos",
};

export default async function ProductosPage() {
  const products = await getProducts("published");

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Productos</h1>
      {products.length === 0 ? (
        <p className="text-muted-foreground">
          No hay productos disponibles.
        </p>
      ) : (
        <ProductGrid products={products} />
      )}
    </main>
  );
}
```

## Step 2: Dynamic Routes

For detail pages, create `src/app/(storefront)/<route>/[slug]/page.tsx`:

```typescript
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/payload-helpers";
import { ProductDetail } from "@/components/product-detail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "No encontrado | Vitrina" };

  return {
    title: `${product.name} | Vitrina`,
    description: product.description
      ? `${String(product.description).slice(0, 155)}...`
      : `Detalles de ${product.name}`,
  };
}

export async function generateStaticParams() {
  const products = await getProducts("published");
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductoPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="container mx-auto px-4 py-8">
      <ProductDetail product={product} />
    </main>
  );
}
```

## Step 3: Loading State

Create `src/app/(storefront)/<route>/loading.tsx`:

```typescript
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-48 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ))}
      </div>
    </main>
  );
}
```

## Step 4: Not Found Page

Create `src/app/(storefront)/<route>/[slug]/not-found.tsx`:

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
      <p className="text-muted-foreground mb-8">
        El producto que buscas no existe o fue eliminado.
      </p>
      <Button asChild>
        <Link href="/productos">Ver todos los productos</Link>
      </Button>
    </main>
  );
}
```

## Step 5: Create the Component

Create `src/components/product-grid.tsx`:

```typescript
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/payload-types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Link key={product.id} href={`/productos/${product.slug}`}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="line-clamp-1">{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {product.images?.[0]?.image &&
                typeof product.images[0].image === "object" && (
                  <Image
                    src={product.images[0].image.url ?? ""}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="rounded-md object-cover w-full h-48"
                  />
                )}
            </CardContent>
            <CardFooter>
              <span className="text-lg font-semibold">
                ${product.price.toFixed(2)}
              </span>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
```

## Data Fetching Pattern

All storefront pages use **React Server Components** with async data fetching:

```typescript
// Always fetch via payload-helpers.ts, never call Payload directly in pages
import { getSomething } from "@/lib/payload-helpers";

export default async function Page() {
  const data = await getSomething();
  return <Component data={data} />;
}
```

## Client Components

Only use `"use client"` when the component needs:
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`window`, `localStorage`)
- React hooks (`useState`, `useEffect`)

```typescript
"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface WhatsAppButtonProps {
  whatsappNumber: string;
  messageTemplate: string;
  productName: string;
  price?: number | null;
  currencySymbol?: string;
  className?: string;
}

export function WhatsAppButton({
  whatsappNumber,
  messageTemplate,
  productName,
  price,
  currencySymbol,
  className,
}: WhatsAppButtonProps) {
  const url = typeof window !== "undefined" ? window.location.href : "";

  const handleClick = () => {
    const whatsappUrl = buildWhatsAppUrl({
      whatsappNumber,
      messageTemplate,
      productName,
      price,
      currencySymbol,
      url,
    });
    window.open(whatsappUrl, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 font-semibold text-white hover:bg-[#1da851] ${className ?? ""}`}
    >
      <MessageCircle className="h-5 w-5" />
      Consultar Precio
    </button>
  );
}
```

## Checklist

- [ ] Route directory created under `src/app/(storefront)/`
- [ ] `page.tsx` is an async server component
- [ ] Data fetched via `@/lib/payload-helpers` (not direct Payload calls)
- [ ] `Metadata` exported (static or `generateMetadata` for dynamic)
- [ ] `loading.tsx` with skeleton UI
- [ ] `not-found.tsx` for dynamic routes
- [ ] `generateStaticParams` for dynamic routes (SSG)
- [ ] Components in `src/components/` with typed props interfaces
- [ ] Client components only where necessary (`"use client"`)
- [ ] Spanish text for all user-facing content
- [ ] Responsive layout with Tailwind (`grid`, `container`, breakpoints)
