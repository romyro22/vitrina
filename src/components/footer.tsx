import Link from 'next/link'
import { MessageCircle, Store } from 'lucide-react'

interface FooterProps {
  storeName: string
  whatsappNumber?: string | null
}

/** Storefront footer with navigation, WhatsApp contact link, and branding */
export function Footer({ storeName, whatsappNumber }: FooterProps) {
  const cleanNumber = whatsappNumber?.replace(/\D/g, '')

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Store className="h-4 w-4" />
              </div>
              <span className="font-[family-name:var(--font-display)] text-base font-bold text-foreground">
                {storeName}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Explora nuestros productos y consulta precios directamente por WhatsApp.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Navegación</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Inicio
              </Link>
              <Link href="/products" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Productos
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Contacto</h3>
            {cleanNumber && (
              <a
                href={`https://wa.me/${cleanNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <MessageCircle className="h-4 w-4 text-whatsapp" />
                WhatsApp
              </a>
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {storeName}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
