"use client";

import { useCallback } from "react";

import { analytics } from "@repo/analytics-legacy";

interface TrackAffiliateClickParams {
  displayMode: "buttons" | "table";
  isLowestPrice: boolean;
  locale?: string;
  priceDifference?: number;
  priceDifferencePercent?: string;
  productHandle: string;
  productId: string;
  productPrice: number;
  productTitle: string;
  seller: string;
  sellerPrice: number;
}

export function useTrackAffiliateClick() {
  return useCallback((params: TrackAffiliateClickParams) => {
    // Use PostHog's capture method directly
    analytics.capture("Affiliate Link Clicked", {
      displayMode: params.displayMode,
      locale: params.locale,
      priceComparison: params.isLowestPrice ? "lowest" : "regular",
      priceDifference: params.priceDifference,
      priceDifferencePercent: params.priceDifferencePercent,
      productHandle: params.productHandle,
      productId: params.productId,
      productPrice: params.productPrice,
      productTitle: params.productTitle,
      seller: params.seller,
      sellerPrice: params.sellerPrice,
      timestamp: new Date().toISOString(),
    });
  }, []);
}
