import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Package, ShieldCheck } from 'lucide-react'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { ProductImageGallery } from '@/components/product-image-gallery'
import { RichTextRenderer } from '@/components/rich-text-renderer'
import { getProductBySlug, getRelatedProducts, getSiteSettings } from '@/lib/payload-helpers'
import { ProductGrid } from '@/components/product-grid'
import { ProductJsonLd } from '@/components/product-json-ld'
import { getSiteUrl } from '@/lib/site-url'
import type { Metadata } from 'next'
import type { Media, Product } from '@/payload-types'

interface Props {
  params: Promise<{ slug: string }>
}

interface OgImageDescriptor {
  url: string
  width: number
  height: number
  alt: string
}

/**
 * Resolves the best available Open Graph image for a product, as an absolute URL.
 *
 * Falls back og -> card -> original, and returns null when the product has no
 * images so the caller can omit the tag entirely rather than emit a broken one.
 */
function resolveOgImage(product: Product, siteUrl: string): OgImageDescriptor | null {
  const firstImage = product.images?.[0]
  if (!firstImage || typeof firstImage === 'number') return null

  // Always read the delivered dimensions, never the configured target: sharp does
  // not upscale, so a source narrower than 1200px yields a smaller `og` than set.
  const candidate = firstImage.sizes?.og?.url
    ? {
        url: firstImage.sizes.og.url,
        width: firstImage.sizes.og.width ?? 1200,
        height: firstImage.sizes.og.height ?? 630,
      }
    : firstImage.sizes?.card?.url
      ? {
          url: firstImage.sizes.card.url,
          width: firstImage.sizes.card.width ?? 768,
          height: firstImage.sizes.card.height ?? 1024,
        }
      : firstImage.url
        ? {
            url: firstImage.url,
            width: firstImage.width ?? 1200,
            height: firstImage.height ?? 630,
          }
        : null

  if (!candidate) return null

  return {
    ...candidate,
    // Payload emits relative URLs (no serverURL in payload.config.ts); this makes
    // them absolute. An already-absolute URL passes through unchanged.
    url: new URL(candidate.url, siteUrl).toString(),
    alt: firstImage.alt || product.name,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Producto no encontrado' }

  const settings = await getSiteSettings()
  const siteUrl = getSiteUrl()
  const ogImage = resolveOgImage(product, siteUrl)
  const description = `${product.name} - Consulta el precio por WhatsApp`

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      url: `${siteUrl}/products/${product.slug}`,
      siteName: settings.storeName,
      locale: 'es_AR',
      type: 'website',
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: product.name,
      description,
      ...(ogImage ? { images: [ogImage.url] } : {}),
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getSiteSettings(),
  ])

  if (!product) notFound()

  const images = Array.isArray(product.images)
    ? product.images
        .filter((img): img is Media => typeof img === 'object' && img !== null)
        .map((img) => ({
          id: img.id,
          url: img.url ?? '',
          alt: img.alt || product.name,
          thumbnailUrl: img.sizes?.thumbnail?.url ?? null,
          blurDataUrl: img.blurDataUrl ?? null,
        }))
    : []

  const category =
    product.category && typeof product.category === 'object'
      ? product.category
      : null

  const currencySymbol = settings.currencySymbol ?? '$'

  const relatedProducts = category
    ? await getRelatedProducts(category.id, product.id)
    : null

  const siteUrl = getSiteUrl()

  return (
    <>
    <ProductJsonLd product={product} currencySymbol={currencySymbol} siteUrl={siteUrl} />
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="transition-colors hover:text-foreground">Inicio</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        {category ? (
          <>
            <Link href={`/categories/${category.slug}`} className="transition-colors hover:text-foreground">
              {category.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        ) : (
          <>
            <Link href="/products" className="transition-colors hover:text-foreground">Productos</Link>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image gallery */}
        <ProductImageGallery images={images} productName={product.name} />

        {/* Product info */}
        <div className="flex flex-col">
          {/* Category badge */}
          {category && (
            <Link
              href={`/categories/${category.slug}`}
              className="mb-2 inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
            >
              {category.name}
            </Link>
          )}

          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {product.name}
          </h1>

          {/* Price */}
          <div className="mt-4">
            {product.isPricePublic && product.price != null ? (
              <span className="tabular-nums text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {currencySymbol}{product.price.toLocaleString()}
              </span>
            ) : (
              <span className="text-lg font-medium text-muted-foreground">
                Consultar precio por WhatsApp
              </span>
            )}
          </div>

          {/* Availability */}
          <div className="mt-4">
            {!product.isAvailable ? (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive">
                <Package className="h-4 w-4" />
                No disponible
              </div>
            ) : product.stockQuantity != null && product.stockQuantity > 0 ? (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-sm font-medium text-green-700">
                <ShieldCheck className="h-4 w-4" />
                En stock ({product.stockQuantity} disponibles)
              </div>
            ) : null}
          </div>

          {/* WhatsApp CTA */}
          {product.isAvailable && settings.whatsappNumber && (
            <div className="mt-6 rounded-xl border border-border/40 bg-muted/30 p-5">
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                ¿Te interesa este producto?
              </p>
              <WhatsAppButton
                whatsappNumber={settings.whatsappNumber}
                messageTemplate={
                  settings.whatsappMessageTemplate ??
                  'Hola! Me interesa el producto "{productName}" ({price}). Lo vi en: {url}'
                }
                productName={product.name}
                price={product.isPricePublic ? product.price : null}
                currencySymbol={currencySymbol}
                className="w-full justify-center sm:w-auto"
              />
            </div>
          )}

          {/* Rich text description */}
          {product.description && (
            <div className="mt-8 border-t border-border/40 pt-6">
              <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
                Descripción
              </h2>
              <RichTextRenderer
                data={typeof product.description === 'object' ? product.description : null}
              />
            </div>
          )}

          {/* SKU */}
          {product.sku && (
            <p className="mt-6 text-xs text-muted-foreground/70">
              SKU: {product.sku}
            </p>
          )}
        </div>
      </div>

      {/* Related products */}
      {relatedProducts && relatedProducts.docs.length > 0 && (
        <section className="mt-16 border-t border-border/40 pt-10">
          <h2 className="mb-6 font-[family-name:var(--font-display)] text-xl font-bold text-foreground">
            También te puede interesar
          </h2>
          <ProductGrid products={relatedProducts.docs} currencySymbol={currencySymbol} />
        </section>
      )}
    </div>
    </>
  )
}
