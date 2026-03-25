import { describe, it, expect } from 'vitest'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

describe('buildWhatsAppUrl', () => {
  const baseOptions = {
    whatsappNumber: '5491112345678',
    messageTemplate: 'Hola! Me interesa {productName} ({price}). {url}',
    productName: 'Camiseta Azul',
    price: 1500,
    currencySymbol: '$',
    url: 'https://vitrina.test/products/camiseta-azul',
  }

  it('should build a valid wa.me URL with encoded message', () => {
    const url = buildWhatsAppUrl(baseOptions)
    expect(url).toContain('https://wa.me/5491112345678')
    expect(url).toContain('text=')
  })

  it('should encode the product name in the message', () => {
    const url = buildWhatsAppUrl(baseOptions)
    expect(url).toContain('Camiseta%20Azul')
  })

  it('should include the formatted price with currency symbol', () => {
    const url = buildWhatsAppUrl(baseOptions)
    const decoded = decodeURIComponent(url)
    expect(decoded).toContain('$1,500')
  })

  it('should show "Consultar" when price is null', () => {
    const url = buildWhatsAppUrl({ ...baseOptions, price: null })
    const decoded = decodeURIComponent(url)
    expect(decoded).toContain('Consultar')
    expect(decoded).not.toContain('$')
  })

  it('should show "Consultar" when price is undefined', () => {
    const url = buildWhatsAppUrl({ ...baseOptions, price: undefined })
    const decoded = decodeURIComponent(url)
    expect(decoded).toContain('Consultar')
  })

  it('should strip non-numeric characters from the phone number', () => {
    const url = buildWhatsAppUrl({
      ...baseOptions,
      whatsappNumber: '+54 911 1234-5678',
    })
    expect(url).toContain('https://wa.me/5491112345678')
  })

  it('should use the provided currency symbol', () => {
    const url = buildWhatsAppUrl({ ...baseOptions, currencySymbol: 'USD' })
    const decoded = decodeURIComponent(url)
    expect(decoded).toContain('USD1,500')
  })

  it('should include the product URL in the message', () => {
    const url = buildWhatsAppUrl(baseOptions)
    const decoded = decodeURIComponent(url)
    expect(decoded).toContain('https://vitrina.test/products/camiseta-azul')
  })
})
