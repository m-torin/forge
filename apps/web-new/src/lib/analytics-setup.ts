import { Analytics } from '@repo/analytics/emitters';
import type { 
  TrackMessage, 
  IdentifyMessage, 
  PageMessage,
  CommonEventProperties 
} from '@repo/analytics/emitters/types';

// Initialize analytics with all 6 Segment-style emitters
export const analytics = new Analytics({
  providers: {
    segment: {
      writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY!,
      config: {
        flushAt: 20,
        flushInterval: 10000,
      },
    },
    posthog: {
      apiKey: process.env.NEXT_PUBLIC_POSTHOG_API_KEY!,
      config: {
        apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      },
    },
    googleAnalytics: {
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!,
    },
  },
  debug: process.env.NODE_ENV === 'development',
  disabled: process.env.NODE_ENV === 'test',
});

// E-commerce specific event types
export interface ProductViewedEvent extends CommonEventProperties {
  productId: string;
  productName: string;
  price: number;
  currency: string;
  category?: string;
  brand?: string;
  variant?: string;
  quantity?: number;
  position?: number;
  url?: string;
  imageUrl?: string;
}

export interface ProductAddedEvent extends ProductViewedEvent {
  cartId?: string;
  quantity: number;
}

export interface CheckoutEvent extends CommonEventProperties {
  checkoutId: string;
  orderId?: string;
  step: number;
  shippingMethod?: string;
  paymentMethod?: string;
  revenue?: number;
  currency?: string;
  products?: ProductViewedEvent[];
}

export interface OrderCompletedEvent extends CommonEventProperties {
  orderId: string;
  revenue: number;
  currency: string;
  tax?: number;
  shipping?: number;
  discount?: number;
  coupon?: string;
  products: ProductViewedEvent[];
}

// Analytics helper functions
export const analyticsHelpers = {
  // User identification
  async identifyUser(userId: string, traits: Record<string, any>) {
    await analytics.identify(userId, {
      ...traits,
      lastSeen: new Date().toISOString(),
    });
  },

  // Page tracking
  async trackPageView(pageName: string, category?: string, properties?: Record<string, any>) {
    await analytics.page(category, pageName, {
      ...properties,
      locale: document.documentElement.lang || 'en',
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer,
      title: document.title,
    });
  },

  // E-commerce events
  async trackProductViewed(product: ProductViewedEvent) {
    await analytics.track('Product Viewed', {
      ...product,
      url: window.location.href,
    });
  },

  async trackProductListViewed(listId: string, category: string, products: ProductViewedEvent[]) {
    await analytics.track('Product List Viewed', {
      listId,
      category,
      products: products.map((p, index) => ({
        ...p,
        position: index + 1,
      })),
    });
  },

  async trackProductClicked(product: ProductViewedEvent) {
    await analytics.track('Product Clicked', product);
  },

  async trackProductAdded(product: ProductAddedEvent) {
    await analytics.track('Product Added', product);
  },

  async trackProductRemoved(product: ProductViewedEvent) {
    await analytics.track('Product Removed', product);
  },

  async trackCartViewed(cartId: string, products: ProductViewedEvent[], revenue: number) {
    await analytics.track('Cart Viewed', {
      cartId,
      products,
      revenue,
      currency: 'USD',
    });
  },

  async trackCheckoutStarted(checkout: CheckoutEvent) {
    await analytics.track('Checkout Started', checkout);
  },

  async trackCheckoutStepViewed(checkout: CheckoutEvent) {
    await analytics.track('Checkout Step Viewed', checkout);
  },

  async trackCheckoutStepCompleted(checkout: CheckoutEvent) {
    await analytics.track('Checkout Step Completed', checkout);
  },

  async trackOrderCompleted(order: OrderCompletedEvent) {
    await analytics.track('Order Completed', order);
  },

  // Search events
  async trackProductsSearched(query: string, results: number) {
    await analytics.track('Products Searched', {
      query,
      results,
    });
  },

  // Promotion events
  async trackPromotionViewed(promotionId: string, promotionName: string, creative?: string, position?: string) {
    await analytics.track('Promotion Viewed', {
      promotionId,
      promotionName,
      creative,
      position,
    });
  },

  async trackPromotionClicked(promotionId: string, promotionName: string, creative?: string, position?: string) {
    await analytics.track('Promotion Clicked', {
      promotionId,
      promotionName,
      creative,
      position,
    });
  },

  // Wishlist events
  async trackProductAddedToWishlist(product: ProductViewedEvent) {
    await analytics.track('Product Added to Wishlist', product);
  },

  async trackProductRemovedFromWishlist(product: ProductViewedEvent) {
    await analytics.track('Product Removed from Wishlist', product);
  },

  // Share events
  async trackProductShared(product: ProductViewedEvent, method: string) {
    await analytics.track('Product Shared', {
      ...product,
      shareMethod: method,
    });
  },

  // Review events
  async trackReviewSubmitted(productId: string, rating: number, reviewId: string) {
    await analytics.track('Product Review Submitted', {
      productId,
      rating,
      reviewId,
    });
  },

  // Filter events
  async trackProductsFiltered(filters: Record<string, any>, results: number) {
    await analytics.track('Products Filtered', {
      filters,
      results,
    });
  },

  // Sort events
  async trackProductsSorted(sortOrder: string, results: number) {
    await analytics.track('Products Sorted', {
      sortOrder,
      results,
    });
  },

  // Authentication events
  async trackSignedUp(method: string, userId?: string) {
    await analytics.track('Signed Up', {
      method,
      userId,
    });
  },

  async trackSignedIn(method: string, userId?: string) {
    await analytics.track('Signed In', {
      method,
      userId,
    });
  },

  async trackSignedOut(userId?: string) {
    await analytics.track('Signed Out', {
      userId,
    });
  },

  // Email events
  async trackEmailSignup(listId: string, location: string) {
    await analytics.track('Email List Signup', {
      listId,
      location,
    });
  },

  // Coupon events
  async trackCouponEntered(couponId: string, couponName: string) {
    await analytics.track('Coupon Entered', {
      couponId,
      couponName,
    });
  },

  async trackCouponApplied(couponId: string, couponName: string, discount: number) {
    await analytics.track('Coupon Applied', {
      couponId,
      couponName,
      discount,
    });
  },

  async trackCouponDenied(couponId: string, couponName: string, reason: string) {
    await analytics.track('Coupon Denied', {
      couponId,
      couponName,
      reason,
    });
  },
};

// Export for use in components
export default analytics;