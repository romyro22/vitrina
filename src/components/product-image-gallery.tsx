'use client'

import Image from 'next/image'
import { useState } from 'react'

interface GalleryImage {
  id: number
  url: string
  alt: string
  thumbnailUrl?: string | null
}

interface ProductImageGalleryProps {
  images: GalleryImage[]
  productName: string
}

/** Interactive image gallery with thumbnail selection */
export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-muted text-muted-foreground/50">
        <svg className="h-20 w-20" fill="none" viewBox="0 0 24 24" strokeWidth={0.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
        </svg>
      </div>
    )
  }

  const selected = images[selectedIndex]

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        <Image
          src={selected.url}
          alt={selected.alt || productName}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg transition-all duration-200 sm:h-20 sm:w-20 ${
                index === selectedIndex
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : 'opacity-60 hover:opacity-100'
              }`}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <Image
                src={img.thumbnailUrl || img.url}
                alt={img.alt || productName}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
