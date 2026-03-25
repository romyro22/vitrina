'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

/** Search bar component that navigates to /products with query parameter */
export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = query.trim()
      if (trimmed) {
        router.push(`/products?q=${encodeURIComponent(trimmed)}`)
      } else {
        router.push('/products')
      }
    },
    [query, router],
  )

  return (
    <form onSubmit={handleSubmit} className="relative w-full sm:max-w-xs lg:max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar productos..."
        aria-label="Buscar productos"
        className="h-9 w-full rounded-lg border border-border/60 bg-muted/40 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </form>
  )
}
