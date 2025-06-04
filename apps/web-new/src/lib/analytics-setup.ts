import { Analytics } from "@repo/analytics/emitters";

import type { CommonEventProperties } from "@repo/analytics/emitters/types";

// Initialize analytics with all 6 Segment-style emitters
export const analytics = new Analytics({
  providers: {
    googleAnalytics: {
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!,
    },
    posthog: {
      apiKey: process.env.NEXT_PUBLIC_POSTHOG_API_KEY!,
      config: {
        apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      },
    },
    segment: {
      config: {
        flushAt: 20,
        flushInterval: 10000,
      },
      writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY!,
    },
  },
  debug: process.env.NODE_ENV === "development",
  disabled: process.env.NODE_ENV === "test",
});

// E-commerce specific event types
export interface ProductViewedEvent extends CommonEventProperties {
  brand?: string;
  category?: string;
  currency: string;
  imageUrl?: string;
  position?: number;
  price: number;
  productId: string;
  productName: string;
  quantity?: number;
  url?: string;
  variant?: string;
}

export interface ProductAddedEvent extends ProductViewedEvent {
  cartId?: string;
  quantity: number;
}

export interface CheckoutEvent extends CommonEventProperties {
  checkoutId: string;
  currency?: string;
  orderId?: string;
  paymentMethod?: string;
  products?: ProductViewedEvent[];
  revenue?: number;
  shippingMethod?: string;
  step: number;
}

export interface OrderCompletedEvent extends CommonEventProperties {
  coupon?: string;
  currency: string;
  discount?: number;
  orderId: string;
  products: ProductViewedEvent[];
  revenue: number;
  shipping?: number;
  tax?: number;
}

// Analytics helper functions
export const analyticsHelpers = {
  // Guest identification
  async identifyGuest(guestId: string, traits: Record<string, any>) {
    await analytics.identify(guestId, {
      ...traits,
      lastSeen: new Date().toISOString(),
    });
  },

  // Page tracking
  async trackPageView(
    pageName: string,
    category?: string,
    properties?: Record<string, any>,
  ) {
    await analytics.page(category, pageName, {
      ...properties,
      url: window.location.href,
      locale: document.documentElement.lang || "en",
      path: window.location.pathname,
      referrer: document.referrer,
      title: document.title,
    });
  },

  // E-commerce events
  async trackProductViewed(product: ProductViewedEvent) {
    await analytics.track("Product Viewed", {
      ...product,
      url: window.location.href,
    });
  },

  async trackProductListViewed(
    listId: string,
    category: string,
    products: ProductViewedEvent[],
  ) {
    await analytics.track("Product List Viewed", {
      category,
      listId,
      products: products.map((p, index) => ({
        ...p,
        position: index + 1,
      })),
    });
  },

  async trackProductClicked(product: ProductViewedEvent) {
    await analytics.track("Product Clicked", product);
  },

  async trackProductAdded(product: ProductAddedEvent) {
    await analytics.track("Product Added", product);
  },

  async trackProductRemoved(product: ProductViewedEvent) {
    await analytics.track("Product Removed", product);
  },

  async trackCartViewed(
    cartId: string,
    products: ProductViewedEvent[],
    revenue: number,
  ) {
    await analytics.track("Cart Viewed", {
      cartId,
      currency: "USD",
      products,
      revenue,
    });
  },

  async trackCheckoutStarted(checkout: CheckoutEvent) {
    await analytics.track("Checkout Started", checkout);
  },

  async trackCheckoutStepViewed(checkout: CheckoutEvent) {
    await analytics.track("Checkout Step Viewed", checkout);
  },

  async trackCheckoutStepCompleted(checkout: CheckoutEvent) {
    await analytics.track("Checkout Step Completed", checkout);
  },

  async trackOrderCompleted(order: OrderCompletedEvent) {
    await analytics.track("Order Completed", order);
  },

  // Search events
  async trackProductsSearched(query: string, results: number) {
    await analytics.track("Products Searched", {
      query,
      results,
    });
  },

  // Promotion events
  async trackPromotionViewed(
    promotionId: string,
    promotionName: string,
    creative?: string,
    position?: string,
  ) {
    await analytics.track("Promotion Viewed", {
      creative,
      position,
      promotionId,
      promotionName,
    });
  },

  async trackPromotionClicked(
    promotionId: string,
    promotionName: string,
    creative?: string,
    position?: string,
  ) {
    await analytics.track("Promotion Clicked", {
      creative,
      position,
      promotionId,
      promotionName,
    });
  },

  // Wishlist events
  async trackProductAddedToWishlist(product: ProductViewedEvent) {
    await analytics.track("Product Added to Wishlist", product);
  },

  async trackProductRemovedFromWishlist(product: ProductViewedEvent) {
    await analytics.track("Product Removed from Wishlist", product);
  },

  // Share events
  async trackProductShared(product: ProductViewedEvent, method: string) {
    await analytics.track("Product Shared", {
      ...product,
      shareMethod: method,
    });
  },

  // Review events
  async trackReviewSubmitted(
    productId: string,
    rating: number,
    reviewId: string,
  ) {
    await analytics.track("Product Review Submitted", {
      productId,
      rating,
      reviewId,
    });
  },

  // Filter events
  async trackProductsFiltered(filters: Record<string, any>, results: number) {
    await analytics.track("Products Filtered", {
      filters,
      results,
    });
  },

  // Sort events
  async trackProductsSorted(sortOrder: string, results: number) {
    await analytics.track("Products Sorted", {
      results,
      sortOrder,
    });
  },

  // Authentication events - Better Auth only tracks to PostHog
  // We need these to ensure events go to all providers (Segment, GA, etc.)
  async trackSignedUp(method: string, guestId?: string) {
    await analytics.track("Signed Up", {
      guestId,
      method,
    });
  },

  async trackSignedIn(method: string, guestId?: string) {
    await analytics.track("Signed In", {
      guestId,
      method,
    });
  },

  async trackSignedOut(guestId?: string) {
    await analytics.track("Signed Out", {
      guestId,
    });
  },

  // Email events
  async trackEmailSignup(listId: string, location: string) {
    await analytics.track("Email List Signup", {
      listId,
      location,
    });
  },

  // Coupon events
  async trackCouponEntered(couponId: string, couponName: string) {
    await analytics.track("Coupon Entered", {
      couponId,
      couponName,
    });
  },

  async trackCouponApplied(
    couponId: string,
    couponName: string,
    discount: number,
  ) {
    await analytics.track("Coupon Applied", {
      couponId,
      couponName,
      discount,
    });
  },

  async trackCouponDenied(
    couponId: string,
    couponName: string,
    reason: string,
  ) {
    await analytics.track("Coupon Denied", {
      couponId,
      couponName,
      reason,
    });
  },
};

// Export for use in components
export default analytics;
