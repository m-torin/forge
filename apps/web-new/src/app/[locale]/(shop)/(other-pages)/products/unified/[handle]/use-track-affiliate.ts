'use client'

import { analytics } from '@repo/analytics-legacy'
import { useCallback } from 'react'

interface TrackAffiliateClickParams {
  productId: string
  productTitle: string
  productPrice: number
  productHandle: string
  seller: string
  sellerPrice: number
  isLowestPrice: boolean
  displayMode: 'buttons' | 'table'
  locale?: string
  priceDifference?: number
  priceDifferencePercent?: string
}

export function useTrackAffiliateClick() {
  return useCallback((params: TrackAffiliateClickParams) => {
    // Use PostHog's capture method directly
    analytics.capture('Affiliate Link Clicked', {
      productId: params.productId,
      productTitle: params.productTitle,
      productPrice: params.productPrice,
      seller: params.seller,
      sellerPrice: params.sellerPrice,
      priceComparison: params.isLowestPrice ? 'lowest' : 'regular',
      displayMode: params.displayMode,
      productHandle: params.productHandle,
      locale: params.locale,
      priceDifference: params.priceDifference,
      priceDifferencePercent: params.priceDifferencePercent,
      timestamp: new Date().toISOString()
    })
  }, [])
}