import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 sm:px-6">
      {/* Illustration */}
      <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-muted">
        <svg className="h-14 w-14 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" strokeWidth={0.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      </div>

      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-foreground">404</h1>
      <p className="mt-3 text-center text-lg text-muted-foreground">
        No encontramos la página que buscas
      </p>
      <p className="mt-1 text-center text-sm text-muted-foreground/70">
        Es posible que el enlace esté incorrecto o que el producto ya no esté disponible.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Home className="h-4 w-4" />
          Volver al inicio
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card px-6 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-accent"
        >
          <Search className="h-4 w-4" />
          Buscar productos
        </Link>
      </div>
    </div>
  )
}
