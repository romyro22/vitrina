import { ProductCard } from './product-card'
import type { Product, Media } from '@/payload-types'

interface ProductGridProps {
  products: Product[]
  currencySymbol?: string
}

function getImageUrl(product: Product): string | undefined {
  const firstImage = Array.isArray(product.images) ? product.images[0] : undefined
  if (!firstImage || typeof firstImage === 'number') return undefined
  const media = firstImage as Media
  return media.sizes?.card?.url || media.sizes?.thumbnail?.url || media.url || undefined
}

function getImageAlt(product: Product): string {
  const firstImage = Array.isArray(product.images) ? product.images[0] : undefined
  if (!firstImage || typeof firstImage === 'number') return product.name
  return (firstImage as Media).alt || product.name
}

/** Responsive product grid with staggered animation and empty state */
export function ProductGrid({ products, currencySymbol = '$' }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30 p-10">
        <svg className="mb-4 h-16 w-16 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" strokeWidth={0.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
        <p className="text-sm font-medium text-muted-foreground">No se encontraron productos</p>
        <p className="mt-1 text-xs text-muted-foreground/70">Intenta con otros términos de búsqueda</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ProductCard
            name={product.name}
            slug={product.slug}
            price={product.price}
            isPricePublic={product.isPricePublic ?? true}
            currencySymbol={currencySymbol}
            imageUrl={getImageUrl(product)}
            imageAlt={getImageAlt(product)}
            isAvailable={product.isAvailable ?? true}
          />
        </div>
      ))}
    </div>
  )
}
