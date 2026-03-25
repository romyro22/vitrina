import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams?: Record<string, string>
}

/** Builds a paginated URL preserving existing search params */
function buildUrl(page: number, baseUrl: string, searchParams: Record<string, string>) {
  const params = new URLSearchParams(searchParams)
  if (page > 1) params.set('page', String(page))
  else params.delete('page')
  const queryString = params.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

/** Computes which page numbers to show with ellipsis */
function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]

  if (currentPage > 3) {
    pages.push('ellipsis')
  }

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (currentPage < totalPages - 2) {
    pages.push('ellipsis')
  }

  pages.push(totalPages)
  return pages
}

const linkBaseStyles = 'inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200'
const linkActiveStyles = `${linkBaseStyles} bg-primary text-primary-foreground shadow-sm`
const linkDefaultStyles = `${linkBaseStyles} border border-border/60 text-foreground hover:bg-accent`
const linkDisabledStyles = `${linkBaseStyles} border border-border/40 text-muted-foreground/40 cursor-not-allowed`

/** Page-number pagination with ellipsis for large page counts */
export function Pagination({ currentPage, totalPages, baseUrl, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-10" aria-label="Paginación">
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1, baseUrl, searchParams)}
          className={linkDefaultStyles}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className={linkDisabledStyles} aria-hidden="true">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {/* Page numbers */}
      {pages.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span key={`ellipsis-${index}`} className="inline-flex h-9 w-6 items-center justify-center text-sm text-muted-foreground">
              ...
            </span>
          )
        }

        if (page === currentPage) {
          return (
            <span key={page} className={linkActiveStyles} aria-current="page">
              {page}
            </span>
          )
        }

        return (
          <Link
            key={page}
            href={buildUrl(page, baseUrl, searchParams)}
            className={linkDefaultStyles}
          >
            {page}
          </Link>
        )
      })}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1, baseUrl, searchParams)}
          className={linkDefaultStyles}
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={linkDisabledStyles} aria-hidden="true">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  )
}
