import { ProductGrid } from '@/components/product-grid'
import { CategoryNav } from '@/components/category-nav'
import { Pagination } from '@/components/pagination'
import { getCategories, getProducts, getSiteSettings, searchProducts } from '@/lib/payload-helpers'

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const query = params.q ?? ''
  const page = Number(params.page) || 1

  const [settings, categories, products] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    query
      ? searchProducts(query, page)
      : getProducts({ page }),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        {query ? `Resultados para "${query}"` : 'Todos los productos'}
      </h1>

      {categories.docs.length > 0 && (
        <div className="mb-6">
          <CategoryNav categories={categories.docs} />
        </div>
      )}

      <ProductGrid products={products.docs} currencySymbol={settings.currencySymbol ?? '$'} />

      <Pagination
        currentPage={products.page ?? 1}
        totalPages={products.totalPages}
        baseUrl="/products"
        searchParams={query ? { q: query } : {}}
      />
    </div>
  )
}
