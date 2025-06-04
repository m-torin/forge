'use client'

import { StandardLayout } from './standard'

interface GalleryLayoutProps {
  product: any
  relatedProducts: any[]
  reviews: any[]
  dict: any
  locale: string
}

export function GalleryLayout(props: GalleryLayoutProps) {
  // For now, using StandardLayout as a placeholder
  // TODO: Implement gallery-specific layout
  return <StandardLayout {...props} />
}