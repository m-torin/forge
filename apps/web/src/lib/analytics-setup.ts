import { createClientAnalytics, track, identify, page, ecommerce } from '@repo/analytics/client';
import type { EmitterTrackPayload, EmitterIdentifyPayload } from '@repo/analytics/client';

// Initialize analytics with new client analytics
export const analytics = await createClientAnalytics({
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
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
  disabled: process.env.NODE_ENV === "test",
});

// E-commerce specific event types
export interface ProductViewedEvent {
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

export interface CheckoutEvent {
  checkoutId: string;
  currency?: string;
  orderId?: string;
  paymentMethod?: string;
  products?: ProductViewedEvent[];
  revenue?: number;
  shippingMethod?: string;
  step: number;
}

export interface OrderCompletedEvent {
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
    await analytics.emit(identify(guestId, {
      ...traits,
      lastSeen: new Date().toISOString(),
    }));
  },

  // Page tracking
  async trackPageView(
    pageName: string,
    category?: string,
    properties?: Record<string, any>,
  ) {
    await analytics.emit(page(pageName, {
      ...properties,
      category,
      url: window.location.href,
      locale: document.documentElement.lang || "en",
      path: window.location.pathname,
      referrer: document.referrer,
      title: document.title,
    }));
  },

  // E-commerce events
  async trackProductViewed(product: ProductViewedEvent) {
    await analytics.emit(ecommerce.productViewed({
      product_id: product.productId,
      product_name: product.productName,
      category: product.category,
      brand: product.brand,
      price: product.price,
      currency: product.currency,
      image_url: product.imageUrl,
      url: product.url || window.location.href,
      variant: product.variant,
      position: product.position,
      quantity: product.quantity,
    }));
  },

  async trackProductListViewed(
    listId: string,
    category: string,
    products: ProductViewedEvent[],
  ) {
    await analytics.emit(track("Product List Viewed", {
      category,
      list_id: listId,
      products: products.map((p, index) => ({
        product_id: p.productId,
        product_name: p.productName,
        category: p.category,
        brand: p.brand,
        price: p.price,
        currency: p.currency,
        position: index + 1,
        quantity: p.quantity,
        variant: p.variant,
      })),
    }));
  },

  async trackProductClicked(product: ProductViewedEvent) {
    await analytics.emit(ecommerce.productClicked({
      product_id: product.productId,
      product_name: product.productName,
      category: product.category,
      brand: product.brand,
      price: product.price,
      currency: product.currency,
      position: product.position,
      variant: product.variant,
    }));
  },

  async trackProductAdded(product: ProductAddedEvent) {
    await analytics.emit(ecommerce.productAddedToCart({
      cart_id: product.cartId,
      product_id: product.productId,
      product_name: product.productName,
      category: product.category,
      brand: product.brand,
      price: product.price,
      currency: product.currency,
      quantity: product.quantity,
      variant: product.variant,
    }));
  },

  async trackProductRemoved(product: ProductViewedEvent) {
    await analytics.emit(ecommerce.productRemovedFromCart({
      product_id: product.productId,
      product_name: product.productName,
      category: product.category,
      brand: product.brand,
      price: product.price,
      currency: product.currency,
      quantity: product.quantity,
      variant: product.variant,
    }));
  },

  async trackCartViewed(
    cartId: string,
    products: ProductViewedEvent[],
    revenue: number,
  ) {
    await analytics.emit(ecommerce.cartViewed({
      cart_id: cartId,
      currency: "USD",
      value: revenue,
      products: products.map((p) => ({
        product_id: p.productId,
        product_name: p.productName,
        category: p.category,
        brand: p.brand,
        price: p.price,
        currency: p.currency,
        quantity: p.quantity || 1,
        variant: p.variant,
      })),
    }));
  },

  async trackCheckoutStarted(checkout: CheckoutEvent) {
    await analytics.emit(ecommerce.checkoutStarted({
      checkout_id: checkout.checkoutId,
      order_id: checkout.orderId,
      currency: checkout.currency || 'USD',
      value: checkout.revenue || 0,
      step: checkout.step,
      payment_method: checkout.paymentMethod,
      shipping_method: checkout.shippingMethod,
      products: checkout.products?.map((p) => ({
        product_id: p.productId,
        product_name: p.productName,
        category: p.category,
        brand: p.brand,
        price: p.price,
        currency: p.currency,
        quantity: p.quantity || 1,
        variant: p.variant,
      })) || [],
    }));
  },

  async trackCheckoutStepViewed(checkout: CheckoutEvent) {
    await analytics.emit(track("Checkout Step Viewed", {
      checkout_id: checkout.checkoutId,
      order_id: checkout.orderId,
      step: checkout.step,
      payment_method: checkout.paymentMethod,
      shipping_method: checkout.shippingMethod,
    }));
  },

  async trackCheckoutStepCompleted(checkout: CheckoutEvent) {
    await analytics.emit(track("Checkout Step Completed", {
      checkout_id: checkout.checkoutId,
      order_id: checkout.orderId,
      step: checkout.step,
      payment_method: checkout.paymentMethod,
      shipping_method: checkout.shippingMethod,
    }));
  },

  async trackOrderCompleted(order: OrderCompletedEvent) {
    await analytics.emit(ecommerce.orderCompleted({
      order_id: order.orderId,
      currency: order.currency,
      value: order.revenue,
      discount: order.discount,
      shipping: order.shipping,
      tax: order.tax,
      coupon: order.coupon,
      products: order.products.map((p) => ({
        product_id: p.productId,
        product_name: p.productName,
        category: p.category,
        brand: p.brand,
        price: p.price,
        currency: p.currency,
        quantity: p.quantity || 1,
        variant: p.variant,
      })),
    }));
  },

  // Search events
  async trackProductsSearched(query: string, results: number) {
    await analytics.emit(track("Products Searched", {
      query,
      results,
    }));
  },

  // Promotion events
  async trackPromotionViewed(
    promotionId: string,
    promotionName: string,
    creative?: string,
    position?: string,
  ) {
    await analytics.emit(track("Promotion Viewed", {
      creative,
      position,
      promotion_id: promotionId,
      promotion_name: promotionName,
    }));
  },

  async trackPromotionClicked(
    promotionId: string,
    promotionName: string,
    creative?: string,
    position?: string,
  ) {
    await analytics.emit(track("Promotion Clicked", {
      creative,
      position,
      promotion_id: promotionId,
      promotion_name: promotionName,
    }));
  },

  // Wishlist events
  async trackProductAddedToWishlist(product: ProductViewedEvent) {
    await analytics.emit(ecommerce.productAddedToWishlist({
      product_id: product.productId,
      product_name: product.productName,
      category: product.category,
      brand: product.brand,
      price: product.price,
      currency: product.currency,
      variant: product.variant,
    }));
  },

  async trackProductRemovedFromWishlist(product: ProductViewedEvent) {
    await analytics.emit(ecommerce.productRemovedFromWishlist({
      product_id: product.productId,
      product_name: product.productName,
      category: product.category,
      brand: product.brand,
      price: product.price,
      currency: product.currency,
      variant: product.variant,
    }));
  },

  // Share events
  async trackProductShared(product: ProductViewedEvent, method: string) {
    await analytics.emit(ecommerce.productShared({
      product_id: product.productId,
      product_name: product.productName,
      category: product.category,
      brand: product.brand,
      price: product.price,
      currency: product.currency,
      variant: product.variant,
      share_method: method,
    }));
  },

  // Review events
  async trackReviewSubmitted(
    productId: string,
    rating: number,
    reviewId: string,
  ) {
    await analytics.emit(track("Product Review Submitted", {
      product_id: productId,
      rating,
      review_id: reviewId,
    }));
  },

  // Filter events
  async trackProductsFiltered(filters: Record<string, any>, results: number) {
    await analytics.emit(track("Products Filtered", {
      filters,
      results,
    }));
  },

  // Sort events
  async trackProductsSorted(sortOrder: string, results: number) {
    await analytics.emit(track("Products Sorted", {
      results,
      sort_order: sortOrder,
    }));
  },

  // Authentication events - Better Auth only tracks to PostHog
  // We need these to ensure events go to all providers (Segment, GA, etc.)
  async trackSignedUp(method: string, guestId?: string) {
    await analytics.emit(track("Signed Up", {
      guest_id: guestId,
      method,
    }));
  },

  async trackSignedIn(method: string, guestId?: string) {
    await analytics.emit(track("Signed In", {
      guest_id: guestId,
      method,
    }));
  },

  async trackSignedOut(guestId?: string) {
    await analytics.emit(track("Signed Out", {
      guest_id: guestId,
    }));
  },

  // Email events
  async trackEmailSignup(listId: string, location: string) {
    await analytics.emit(track("Email List Signup", {
      list_id: listId,
      location,
    }));
  },

  // Coupon events
  async trackCouponEntered(couponId: string, couponName: string) {
    await analytics.emit(ecommerce.couponEntered({
      coupon_id: couponId,
      coupon_name: couponName,
    }));
  },

  async trackCouponApplied(
    couponId: string,
    couponName: string,
    discount: number,
  ) {
    await analytics.emit(ecommerce.couponApplied({
      coupon_id: couponId,
      coupon_name: couponName,
      discount,
    }));
  },

  async trackCouponDenied(
    couponId: string,
    couponName: string,
    reason: string,
  ) {
    await analytics.emit(ecommerce.couponDenied({
      coupon_id: couponId,
      coupon_name: couponName,
      reason,
    }));
  },
};

// Export for use in components
export default analytics;
