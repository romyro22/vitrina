import { notFound } from 'next/navigation'
import { ProductGrid } from '@/components/product-grid'
import { CategoryNav } from '@/components/category-nav'
import { Pagination } from '@/components/pagination'
import { getCategories, getCategoryBySlug, getProducts, getSiteSettings } from '@/lib/payload-helpers'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: 'Categoria no encontrada' }

  return {
    title: category.name,
    description: category.description ?? `Productos en ${category.name}`,
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const page = Number(sp.page) || 1

  const [settings, category, categories] = await Promise.all([
    getSiteSettings(),
    getCategoryBySlug(slug),
    getCategories(),
  ])

  if (!category) notFound()

  const products = await getProducts({
    where: { category: { equals: category.id } },
    page,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold text-foreground">{category.name}</h1>
      {category.description && (
        <p className="mb-6 text-muted-foreground">{category.description}</p>
      )}

      {categories.docs.length > 0 && (
        <div className="mb-6">
          <CategoryNav categories={categories.docs} activeSlug={slug} />
        </div>
      )}

      <ProductGrid products={products.docs} currencySymbol={settings.currencySymbol ?? '$'} />

      <Pagination
        currentPage={products.page ?? 1}
        totalPages={products.totalPages}
        baseUrl={`/categories/${slug}`}
      />
    </div>
  )
}
