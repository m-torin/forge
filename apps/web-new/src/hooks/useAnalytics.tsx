'use client';

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { analytics, analyticsHelpers } from '@/lib/analytics-setup';
import type { ProductViewedEvent } from '@/lib/analytics-setup';

// Custom hook for page tracking
export function usePageTracking() {
  const pathname = usePathname();

  useEffect(() => {
    // Extract page info from pathname
    const segments = pathname.split('/').filter(Boolean);
    const locale = segments[0];
    const category = segments[1] || 'home';
    const pageName = segments[segments.length - 1] || 'home';

    analyticsHelpers.trackPageView(pageName, category, {
      locale,
      path: pathname,
    });
  }, [pathname]);
}

// Custom hook for product impressions
export function useProductImpressions(
  products: ProductViewedEvent[], 
  listId: string,
  category: string
) {
  useEffect(() => {
    if (products.length > 0) {
      analyticsHelpers.trackProductListViewed(listId, category, products);
    }
  }, [products, listId, category]);
}

// Custom hook for intersection observer based tracking
export function useViewportTracking(
  ref: React.RefObject<HTMLElement>,
  onVisible: () => void,
  options?: IntersectionObserverInit
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible();
          observer.unobserve(element);
        }
      },
      { threshold: 0.5, ...options }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, onVisible, options]);
}

// Hook for tracking product views with viewport detection
export function useProductViewTracking(product: ProductViewedEvent | null) {
  const trackView = useCallback(() => {
    if (product) {
      analyticsHelpers.trackProductViewed(product);
    }
  }, [product]);

  return { trackView };
}

// Hook for cart analytics
export function useCartAnalytics() {
  const trackAddToCart = useCallback((product: ProductViewedEvent, quantity: number) => {
    analyticsHelpers.trackProductAdded({
      ...product,
      quantity,
    });
  }, []);

  const trackRemoveFromCart = useCallback((product: ProductViewedEvent) => {
    analyticsHelpers.trackProductRemoved(product);
  }, []);

  const trackCartView = useCallback((cartId: string, products: ProductViewedEvent[], total: number) => {
    analyticsHelpers.trackCartViewed(cartId, products, total);
  }, []);

  return {
    trackAddToCart,
    trackRemoveFromCart,
    trackCartView,
  };
}

// Hook for search analytics
export function useSearchAnalytics() {
  const trackSearch = useCallback((query: string, resultCount: number) => {
    analyticsHelpers.trackProductsSearched(query, resultCount);
  }, []);

  return { trackSearch };
}

// Hook for wishlist analytics
export function useWishlistAnalytics() {
  const trackAddToWishlist = useCallback((product: ProductViewedEvent) => {
    analyticsHelpers.trackProductAddedToWishlist(product);
  }, []);

  const trackRemoveFromWishlist = useCallback((product: ProductViewedEvent) => {
    analyticsHelpers.trackProductRemovedFromWishlist(product);
  }, []);

  return {
    trackAddToWishlist,
    trackRemoveFromWishlist,
  };
}

// Hook for filter/sort analytics
export function useFilterAnalytics() {
  const trackFilter = useCallback((filters: Record<string, any>, resultCount: number) => {
    analyticsHelpers.trackProductsFiltered(filters, resultCount);
  }, []);

  const trackSort = useCallback((sortOrder: string, resultCount: number) => {
    analyticsHelpers.trackProductsSorted(sortOrder, resultCount);
  }, []);

  return {
    trackFilter,
    trackSort,
  };
}

// Hook for promotion analytics
export function usePromotionAnalytics() {
  const trackPromotionView = useCallback((id: string, name: string, creative?: string, position?: string) => {
    analyticsHelpers.trackPromotionViewed(id, name, creative, position);
  }, []);

  const trackPromotionClick = useCallback((id: string, name: string, creative?: string, position?: string) => {
    analyticsHelpers.trackPromotionClicked(id, name, creative, position);
  }, []);

  return {
    trackPromotionView,
    trackPromotionClick,
  };
}