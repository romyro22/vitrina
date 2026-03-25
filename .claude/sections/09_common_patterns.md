# Common Patterns

## 1. Payload Collection Config

```ts
// src/collections/NewCollection.ts
import type { CollectionConfig } from "payload";

export const NewCollection: CollectionConfig = {
  slug: "new-collection",
  admin: { useAsTitle: "name" },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
  ],
};
// Then register in src/payload.config.ts -> collections: [...]
```

## 2. Server Component Data Fetching

```tsx
// src/app/(storefront)/products/page.tsx
import { getPayload } from "payload";
import config from "@payload-config";
import { ProductGrid } from "@/components/product-grid";
import type { Product } from "@/payload-types";

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { page = "1", q } = await searchParams;
  const payload = await getPayload({ config });

  const products = await payload.find({
    collection: "products",
    limit: 12,
    page: Number(page),
    where: q ? { name: { contains: q } } : {},
  });

  return <ProductGrid products={products.docs as Product[]} />;
}
```

## 3. Client Component (WhatsApp)

```tsx
// src/components/whatsapp-button.tsx
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
      className={`inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#1da851] ${className ?? ""}`}
    >
      <MessageCircle className="h-5 w-5" />
      Consultar Precio
    </button>
  );
}
```
