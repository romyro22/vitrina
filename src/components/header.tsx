import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { Store } from 'lucide-react'
import { SearchBar } from './search-bar'
import { MobileMenu } from './mobile-menu'

interface HeaderProps {
  storeName: string
  logoUrl?: string | null
}

/** Sticky storefront header with navigation, search, and mobile menu */
export function Header({ storeName, logoUrl }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80">
          {logoUrl ? (
            <Image src={logoUrl} alt={storeName} width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="h-5 w-5" />
            </div>
          )}
          <span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-foreground">
            {storeName}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Inicio
          </Link>
          <Link
            href="/products"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Productos
          </Link>
        </nav>

        {/* Search + Mobile menu */}
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:block">
            <Suspense fallback={null}>
              <SearchBar />
            </Suspense>
          </div>
          <MobileMenu />
        </div>
      </div>

      {/* Mobile search — visible only on small screens */}
      <div className="border-t border-border/40 px-4 py-2 sm:hidden">
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
      </div>
    </header>
  )
}
