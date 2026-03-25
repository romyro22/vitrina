import Link from 'next/link'
import { X } from 'lucide-react'
import { ProductGrid } from '@/components/product-grid'
import { CategoryNav } from '@/components/category-nav'
import { Pagination } from '@/components/pagination'
import { getCategories, getProducts, getSiteSettings, searchProducts } from '@/lib/payload-helpers'

interface Props {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const query = params.q ?? ''
  const page = Number(params.page) || 1
  const sort = params.sort ?? '-createdAt'

  const [settings, categories, products] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    query
      ? searchProducts(query, page)
      : getProducts({ page, sort }),
  ])

  const currencySymbol = settings.currencySymbol ?? '$'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Title + result count */}
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-foreground sm:text-3xl">
          {query ? `Resultados para "${query}"` : 'Todos los productos'}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {products.totalDocs} {products.totalDocs === 1 ? 'producto' : 'productos'}
          </p>
          {query && (
            <Link
              href="/products"
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Limpiar búsqueda
              <X className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Categories */}
      {categories.docs.length > 0 && (
        <div className="mb-6">
          <CategoryNav categories={categories.docs} />
        </div>
      )}

      {/* Product grid */}
      <ProductGrid products={products.docs} currencySymbol={currencySymbol} />

      {/* Pagination */}
      <Pagination
        currentPage={products.page ?? 1}
        totalPages={products.totalPages}
        baseUrl="/products"
        searchParams={query ? { q: query } : {}}
      />
    </div>
  )
}
