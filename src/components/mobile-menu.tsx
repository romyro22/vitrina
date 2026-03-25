'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

/** Hamburger menu for mobile navigation */
export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const close = useCallback(() => setIsOpen(false), [])

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-border bg-background/98 backdrop-blur-lg">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3">
            <Link
              href="/"
              onClick={close}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Inicio
            </Link>
            <Link
              href="/products"
              onClick={close}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Productos
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}
