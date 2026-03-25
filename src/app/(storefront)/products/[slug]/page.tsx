import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Package, ShieldCheck } from 'lucide-react'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { ProductImageGallery } from '@/components/product-image-gallery'
import { RichTextRenderer } from '@/components/rich-text-renderer'
import { getProductBySlug, getSiteSettings } from '@/lib/payload-helpers'
import type { Metadata } from 'next'
import type { Media } from '@/payload-types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Producto no encontrado' }

  return {
    title: product.name,
    description: `${product.name} - Consulta el precio por WhatsApp`,
    openGraph: {
      title: product.name,
      type: 'website',
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
        .filter((img): img is Media => typeof img !== 'string' && typeof img === 'object' && 'url' in img)
        .map((img) => ({
          id: img.id,
          url: img.url ?? '',
          alt: img.alt || product.name,
          thumbnailUrl: img.sizes?.thumbnail?.url ?? null,
        }))
    : []

  const category =
    product.category && typeof product.category === 'object'
      ? product.category
      : null

  const currencySymbol = settings.currencySymbol ?? '$'

  return (
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
    </div>
  )
}
