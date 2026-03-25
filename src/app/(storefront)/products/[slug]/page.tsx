import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { getProductBySlug, getSiteSettings } from '@/lib/payload-helpers'
import type { Metadata } from 'next'

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
    ? product.images.filter((img): img is Exclude<typeof img, string> => typeof img !== 'string')
    : []

  const category =
    product.category && typeof product.category !== 'string'
      ? product.category
      : null

  const currencySymbol = settings.currencySymbol ?? '$'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        href={category ? `/categories/${category.slug}` : '/products'}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {category ? category.name : 'Todos los productos'}
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        {/* Image gallery */}
        <div className="space-y-4">
          {images.length > 0 ? (
            <>
              <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                <Image
                  src={images[0].url}
                  alt={images[0].alt || product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(1).map((img) => (
                    <div
                      key={img.id}
                      className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                    >
                      <Image
                        src={img.sizes?.thumbnail?.url || img.url}
                        alt={img.alt || product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 25vw, 12vw"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-xl bg-muted text-muted-foreground">
              Sin imagen
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-6">
          <div>
            {category && (
              <Link
                href={`/categories/${category.slug}`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {category.name}
              </Link>
            )}
            <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
              {product.name}
            </h1>
          </div>

          {/* Price */}
          <div>
            {product.isPricePublic && product.price != null ? (
              <span className="text-3xl font-bold text-foreground">
                {currencySymbol}{product.price.toLocaleString()}
              </span>
            ) : (
              <span className="text-lg text-muted-foreground">
                Consultar precio por WhatsApp
              </span>
            )}
          </div>

          {/* Availability */}
          {!product.isAvailable ? (
            <div className="inline-flex w-fit items-center rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
              No disponible
            </div>
          ) : product.stockQuantity != null && product.stockQuantity > 0 ? (
            <div className="inline-flex w-fit items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              En stock ({product.stockQuantity} disponibles)
            </div>
          ) : null}

          {/* WhatsApp CTA */}
          {product.isAvailable && settings.whatsappNumber && (
            <WhatsAppButton
              whatsappNumber={settings.whatsappNumber}
              messageTemplate={
                settings.whatsappMessageTemplate ??
                'Hola! Me interesa el producto "{productName}" ({price}). Lo vi en: {url}'
              }
              productName={product.name}
              price={product.isPricePublic ? product.price : null}
              currencySymbol={currencySymbol}
            />
          )}

          {/* Description */}
          {product.description && (
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {/* Lexical rich text renders as JSON; for now show a simple text notice */}
              <p className="text-base text-foreground">
                {typeof product.description === 'string'
                  ? product.description
                  : 'Consulta mas detalles por WhatsApp.'}
              </p>
            </div>
          )}

          {/* SKU */}
          {product.sku && (
            <p className="text-xs text-muted-foreground">
              SKU: {product.sku}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
