"use client";

import { useCallback } from "react";

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
  return useCallback((_params: TrackAffiliateClickParams) => {
    // No-op
  }, []);
}
