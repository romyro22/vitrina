'use client'

import { MessageCircle } from 'lucide-react'

interface WhatsAppFabProps {
  whatsappNumber: string
}

/** Floating WhatsApp button visible on all storefront pages */
export function WhatsAppFab({ whatsappNumber }: WhatsAppFabProps) {
  const cleanNumber = whatsappNumber.replace(/\D/g, '')

  const handleClick = () => {
    window.open(
      `https://wa.me/${cleanNumber}?text=${encodeURIComponent('Hola! Me gustaría hacer una consulta.')}`,
      '_blank',
    )
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#1da851] hover:shadow-xl active:scale-95 sm:bottom-8 sm:right-8"
      aria-label="Consultar por WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  )
}
