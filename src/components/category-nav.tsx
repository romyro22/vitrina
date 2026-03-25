import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
}

interface CategoryNavProps {
  categories: Category[]
  activeSlug?: string
}

export function CategoryNav({ categories, activeSlug }: CategoryNavProps) {
  return (
    <nav className="flex flex-wrap gap-2">
      <Link
        href="/products"
        className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
          !activeSlug
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-background text-foreground hover:bg-muted'
        }`}
      >
        Todos
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/categories/${category.slug}`}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            activeSlug === category.slug
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-foreground hover:bg-muted'
          }`}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  )
}
