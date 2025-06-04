'use client'

import { StandardLayout } from './standard'

interface ChildrenLayoutProps {
  product: any
  relatedProducts: any[]
  reviews: any[]
  dict: any
  locale: string
}

export function ChildrenLayout(props: ChildrenLayoutProps) {
  // For now, using StandardLayout as a placeholder
  // TODO: Implement children-specific layout with kid-friendly design
  return <StandardLayout {...props} />
}