import type { Product, Media, Category } from '@/payload-types'

interface ProductJsonLdProps {
  product: Product
  currencySymbol: string
  siteUrl: string
}

/** Renders JSON-LD structured data for Google rich results (Product schema) */
export function ProductJsonLd({ product, siteUrl }: ProductJsonLdProps) {
  const category = product.category && typeof product.category === 'object'
    // SAFETY: typeof guard narrows from number | Category
    ? product.category as Category
    : null

  const firstImage = Array.isArray(product.images) ? product.images[0] : undefined
  const imageUrl = firstImage && typeof firstImage === 'object'
    // SAFETY: typeof guard narrows from number | Media
    ? (firstImage as Media).url
    : undefined

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(imageUrl ? { image: `${siteUrl}${imageUrl}` } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(category ? { category: category.name } : {}),
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: 'USD',
      ...(product.isPricePublic && product.price != null
        ? { price: product.price.toString() }
        : {}),
      availability: product.isAvailable
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
