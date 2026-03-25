import Link from 'next/link'
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <section className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {settings.storeName}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Explora nuestros productos
        </p>
      </section>

      {categories.docs.length > 0 && (
        <section className="mb-8">
          <CategoryNav categories={categories.docs} />
        </section>
      )}

      {featured.docs.length > 0 && (
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Destacados</h2>
          </div>
          <ProductGrid products={featured.docs} currencySymbol={settings.currencySymbol ?? '$'} />
        </section>
      )}

      <div className="text-center">
        <Link
          href="/products"
          className="inline-flex items-center rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Ver todos los productos
        </Link>
      </div>
    </div>
  )
}
