import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { ProductGrid } from '@/components/product-grid'
import { CategoryNav } from '@/components/category-nav'
import { getCategories, getFeaturedProducts, getSiteSettings } from '@/lib/payload-helpers'

export default async function HomePage() {
  const [settings, featured, categories] = await Promise.all([
    getSiteSettings(),
    getFeaturedProducts(),
    getCategories(),
  ])

  return (
    <div>
      {/* Hero section */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-br from-primary/5 via-background to-accent/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {settings.storeName}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Explora nuestros productos y consulta precios directamente por WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
              >
                Ver productos
                <ArrowRight className="h-4 w-4" />
              </Link>
              {settings.whatsappNumber && (
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-accent hover:shadow-md"
                >
                  <MessageCircle className="h-4 w-4 text-whatsapp" />
                  Escríbenos
                </a>
              )}
            </div>
          </div>
        </div>
        {/* Decorative gradient orb */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/[0.06] blur-3xl" />
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Categories */}
        {categories.docs.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
              Categorías
            </h2>
            <CategoryNav categories={categories.docs} />
          </section>
        )}

        {/* Featured products */}
        {featured.docs.length > 0 && (
          <section className="mb-12">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-foreground">
                Productos destacados
              </h2>
              <Link
                href="/products"
                className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:inline-flex"
              >
                Ver todos
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ProductGrid products={featured.docs} currencySymbol={settings.currencySymbol ?? '$'} />
          </section>
        )}

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card px-8 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-accent hover:shadow-md"
          >
            Explorar todos los productos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
