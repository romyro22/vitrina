import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { SearchBar } from './search-bar'

interface HeaderProps {
  storeName: string
  logoUrl?: string | null
}

export function Header({ storeName, logoUrl }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {logoUrl ? (
            <Image src={logoUrl} alt={storeName} width={32} height={32} className="h-8 w-8 rounded" />
          ) : null}
          <span className="text-lg font-bold text-foreground">{storeName}</span>
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
