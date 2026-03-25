import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

interface ProductCardProps {
  name: string
  slug: string
  price?: number | null
  isPricePublic?: boolean
  currencySymbol?: string
  imageUrl?: string
  imageAlt?: string
  isAvailable?: boolean
}

/** Product card for grid displays with image, name, price, and availability */
export function ProductCard({
  name,
  slug,
  price,
  isPricePublic = true,
  currencySymbol = '$',
  imageUrl,
  imageAlt,
  isAvailable = true,
}: ProductCardProps) {
  return (
    <Link
      href={`/products/${slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:border-border hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt || name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground/60">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
          </div>
        )}

        {/* Unavailable overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
            <span className="rounded-full bg-destructive/90 px-3 py-1 text-xs font-semibold text-destructive-foreground">
              No disponible
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-3.5 sm:p-4">
        <h3 className="line-clamp-2 font-[family-name:var(--font-display)] text-sm font-semibold leading-snug text-card-foreground transition-colors group-hover:text-primary">
          {name}
        </h3>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          {isPricePublic && price != null ? (
            <span className="tabular-nums text-lg font-bold tracking-tight text-foreground">
              {currencySymbol}{price.toLocaleString()}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <MessageCircle className="h-3.5 w-3.5 text-whatsapp" />
              Consultar precio
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
