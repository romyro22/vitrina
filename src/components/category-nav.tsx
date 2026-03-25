import Link from 'next/link'
import type { Category } from '@/payload-types'

interface CategoryNavProps {
  categories: Category[]
  activeSlug?: string
}

/** Horizontal scrollable category pill navigation with active state */
export function CategoryNav({ categories, activeSlug }: CategoryNavProps) {
  return (
    <div className="relative">
      {/* Fade edge on scroll (mobile) */}
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-background to-transparent sm:hidden" />

      <nav
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0"
        aria-label="Categorías"
      >
        <Link
          href="/products"
          className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
            !activeSlug
              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
              : 'border-border/60 bg-card text-muted-foreground hover:border-border hover:text-foreground'
          }`}
        >
          Todos
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              activeSlug === category.slug
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border/60 bg-card text-muted-foreground hover:border-border hover:text-foreground'
            }`}
          >
            {category.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}
