'use client'

import { MessageCircle } from 'lucide-react'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

interface WhatsAppButtonProps {
  whatsappNumber: string
  messageTemplate: string
  productName: string
  price?: number | null
  currencySymbol?: string
  className?: string
}

export function WhatsAppButton({
  whatsappNumber,
  messageTemplate,
  productName,
  price,
  currencySymbol,
  className,
}: WhatsAppButtonProps) {
  const url = typeof window !== 'undefined' ? window.location.href : ''

  const handleClick = () => {
    const whatsappUrl = buildWhatsAppUrl({
      whatsappNumber,
      messageTemplate,
      productName,
      price,
      currencySymbol,
      url,
    })
    window.open(whatsappUrl, '_blank')
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#1da851] active:bg-[#178a42] ${className ?? ''}`}
    >
      <MessageCircle className="h-5 w-5" />
      Consultar Precio
    </button>
  )
}
