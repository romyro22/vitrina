import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/components/product-card'

// Mock next/image to render a plain img
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Mock next/link to render a plain anchor
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('ProductCard', () => {
  it('should render the product name', () => {
    render(
      <ProductCard name="Camiseta Roja" slug="camiseta-roja" price={2500} />,
    )
    expect(screen.getByText('Camiseta Roja')).toBeInTheDocument()
  })

  it('should render the price with currency symbol', () => {
    render(
      <ProductCard
        name="Zapatos"
        slug="zapatos"
        price={5000}
        currencySymbol="$"
        isPricePublic={true}
      />,
    )
    expect(screen.getByText(/\$5,000/)).toBeInTheDocument()
  })

  it('should show "Consultar precio" when isPricePublic is false', () => {
    render(
      <ProductCard
        name="Producto X"
        slug="producto-x"
        price={1000}
        isPricePublic={false}
      />,
    )
    expect(screen.getByText('Consultar precio')).toBeInTheDocument()
  })

  it('should show "No disponible" overlay when isAvailable is false', () => {
    render(
      <ProductCard
        name="Agotado"
        slug="agotado"
        price={100}
        isAvailable={false}
      />,
    )
    expect(screen.getByText('No disponible')).toBeInTheDocument()
  })

  it('should link to the correct product page', () => {
    const { container } = render(
      <ProductCard name="Bolso" slug="bolso-cuero" price={3000} />,
    )
    const link = container.querySelector('a')
    expect(link).toHaveAttribute('href', '/products/bolso-cuero')
  })
})
