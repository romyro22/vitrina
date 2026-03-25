interface WhatsAppLinkOptions {
  whatsappNumber: string
  messageTemplate: string
  productName: string
  price?: number | null
  currencySymbol?: string
  url: string
}

export function buildWhatsAppUrl({
  whatsappNumber,
  messageTemplate,
  productName,
  price,
  currencySymbol = '$',
  url,
}: WhatsAppLinkOptions): string {
  const priceText = price != null ? `${currencySymbol}${price.toLocaleString()}` : 'Consultar'

  const message = messageTemplate
    .replace('{productName}', productName)
    .replace('{price}', priceText)
    .replace('{url}', url)

  const cleanNumber = whatsappNumber.replace(/\D/g, '')

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
}
