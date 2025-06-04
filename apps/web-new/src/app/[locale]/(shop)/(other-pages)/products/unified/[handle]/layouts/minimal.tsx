'use client'

import { StandardLayout } from './standard'

interface MinimalLayoutProps {
  product: any
  relatedProducts: any[]
  reviews: any[]
  dict: any
  locale: string
}

export function MinimalLayout(props: MinimalLayoutProps) {
  // For now, using StandardLayout as a placeholder
  // TODO: Implement minimal-specific layout
  return <StandardLayout {...props} />
}