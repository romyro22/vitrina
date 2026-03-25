import Image from 'next/image'
import Link from 'next/link'

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
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt || name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Sin imagen
          </div>
        )}
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-black">
              No disponible
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight text-foreground group-hover:text-primary">
          {name}
        </h3>
        <div className="mt-auto pt-2">
          {isPricePublic && price != null ? (
            <span className="text-lg font-bold text-foreground">
              {currencySymbol}{price.toLocaleString()}
            </span>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">
              Consultar precio
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
