import { ProductCard } from './product-card'

interface Product {
  id: string
  name: string
  slug: string
  price?: number | null
  isPricePublic?: boolean
  isAvailable?: boolean
  images?: Array<{
    id: string
    url: string
    alt: string
    sizes?: {
      thumbnail?: { url: string } | null
      card?: { url: string } | null
    }
  }> | null
}

interface ProductGridProps {
  products: Product[]
  currencySymbol?: string
}

function getImageUrl(product: Product): string | undefined {
  const firstImage = Array.isArray(product.images) ? product.images[0] : undefined
  if (!firstImage) return undefined
  if (typeof firstImage === 'string') return undefined
  return firstImage.sizes?.card?.url || firstImage.sizes?.thumbnail?.url || firstImage.url
}

function getImageAlt(product: Product): string {
  const firstImage = Array.isArray(product.images) ? product.images[0] : undefined
  if (!firstImage || typeof firstImage === 'string') return product.name
  return firstImage.alt || product.name
}

export function ProductGrid({ products, currencySymbol = '$' }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border p-8">
        <p className="text-muted-foreground">No se encontraron productos</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          name={product.name}
          slug={product.slug}
          price={product.price}
          isPricePublic={product.isPricePublic}
          currencySymbol={currencySymbol}
          imageUrl={getImageUrl(product)}
          imageAlt={getImageAlt(product)}
          isAvailable={product.isAvailable}
        />
      ))}
    </div>
  )
}
