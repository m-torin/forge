"use client";

import { useGuestActions } from "@/contexts/GuestActionsContext";

// Convenience hook for analytics
export function useAnalytics() {
  const { analytics } = useGuestActions();
  return analytics;
}

// Product-specific analytics
export function useProductAnalytics() {
  const { analytics } = useGuestActions();

  return {
    trackViewed: async (product: {
      id: string;
      name: string;
      price: number;
      category?: string;
      brand?: string;
      imageUrl?: string;
    }) => {
      await analytics.track("Product Viewed", {
        url: window.location.href,
        brand: product.brand,
        category: product.category,
        imageUrl: product.imageUrl,
        price: product.price,
        productId: product.id,
        productName: product.name,
      });
    },

    trackClicked: async (productId: string, productName?: string) => {
      await analytics.track("Product Clicked", {
        productId,
        productName,
      });
    },

    trackAddedToCart: async (product: {
      id: string;
      name: string;
      price: number;
      quantity: number;
    }) => {
      await analytics.track("Product Added", {
        price: product.price,
        productId: product.id,
        productName: product.name,
        quantity: product.quantity,
      });
    },
  };
}

// E-commerce analytics
export function useEcommerceAnalytics() {
  const { analytics } = useGuestActions();

  return {
    trackCheckoutStarted: async (items: any[], total: number) => {
      await analytics.track("Checkout Started", {
        checkoutId: `checkout_${Date.now()}`,
        currency: "USD",
        products: items,
        revenue: total,
      });
    },

    trackOrderCompleted: async (
      orderId: string,
      items: any[],
      total: number,
    ) => {
      await analytics.track("Order Completed", {
        currency: "USD",
        orderId,
        products: items,
        revenue: total,
      });
    },
  };
}

// Engagement analytics
export function useEngagementAnalytics() {
  const { activity, analytics } = useGuestActions();

  return {
    trackSearch: (query: string, resultsCount?: number) => {
      // This also saves to local activity history
      activity.trackSearch(query, resultsCount);
    },

    trackFilter: async (
      filters: Record<string, any>,
      resultsCount?: number,
    ) => {
      await analytics.track("Products Filtered", {
        filters,
        results: resultsCount,
      });
    },

    trackSort: async (sortBy: string, resultsCount?: number) => {
      await analytics.track("Products Sorted", {
        results: resultsCount,
        sortOrder: sortBy,
      });
    },
  };
}

// Auth analytics - Better Auth only tracks to PostHog
// Use these to ensure events go to all analytics providers
export function useAuthAnalytics() {
  const { analytics } = useGuestActions();

  return {
    trackSignedUp: async (method: string) => {
      await analytics.track("Signed Up", { method });
    },

    trackSignedIn: async (method: string) => {
      await analytics.track("Signed In", { method });
    },

    trackSignedOut: async () => {
      await analytics.track("Signed Out", {});
    },
  };
}
