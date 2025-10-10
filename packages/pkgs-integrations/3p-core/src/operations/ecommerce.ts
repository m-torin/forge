/**
 * Standard ecommerce operations for 3rd party analytics integrations
 */

import type { AnalyticsEvent } from '../types';

export function trackProductViewed(
  product: {
    id: string;
    name: string;
    category?: string;
    brand?: string;
    variant?: string;
    price: number;
    currency?: string;
    sku?: string;
  },
  context?: any,
): AnalyticsEvent {
  return {
    name: 'Product Viewed',
    properties: {
      product_id: product.id,
      product_name: product.name,
      product_category: product.category,
      product_brand: product.brand,
      product_variant: product.variant,
      product_price: product.price,
      product_currency: product.currency || 'USD',
      product_sku: product.sku,
    },
    context,
  };
}

export function trackProductAdded(
  product: {
    id: string;
    name: string;
    category?: string;
    brand?: string;
    variant?: string;
    price: number;
    currency?: string;
    quantity?: number;
    sku?: string;
  },
  context?: any,
): AnalyticsEvent {
  const quantity = product.quantity || 1;

  return {
    name: 'Product Added',
    properties: {
      product_id: product.id,
      product_name: product.name,
      product_category: product.category,
      product_brand: product.brand,
      product_variant: product.variant,
      product_price: product.price,
      product_currency: product.currency || 'USD',
      product_quantity: quantity,
      product_total: product.price * quantity,
      product_sku: product.sku,
    },
    context,
  };
}

export function trackProductRemoved(
  product: {
    id: string;
    name: string;
    price: number;
    quantity?: number;
    currency?: string;
  },
  context?: any,
): AnalyticsEvent {
  const quantity = product.quantity || 1;

  return {
    name: 'Product Removed',
    properties: {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      product_currency: product.currency || 'USD',
      product_quantity: quantity,
      product_total: product.price * quantity,
    },
    context,
  };
}

export function trackCartViewed(
  cart: {
    id: string;
    items: Array<{
      id: string;
      name: string;
      category?: string;
      price: number;
      quantity: number;
    }>;
    total: number;
    currency: string;
  },
  context?: any,
): AnalyticsEvent {
  return {
    name: 'Cart Viewed',
    properties: {
      cart_id: cart.id,
      cart_total: cart.total,
      cart_currency: cart.currency,
      cart_item_count: cart.items.length,
      cart_quantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      products: cart.items.map(item => ({
        product_id: item.id,
        product_name: item.name,
        product_category: item.category,
        product_price: item.price,
        product_quantity: item.quantity,
      })),
    },
    context,
  };
}

export function trackCheckoutStarted(
  checkout: {
    order_id?: string;
    items: Array<{
      id: string;
      name: string;
      category?: string;
      price: number;
      quantity: number;
    }>;
    total: number;
    currency: string;
    step?: number;
  },
  context?: any,
): AnalyticsEvent {
  return {
    name: 'Checkout Started',
    properties: {
      order_id: checkout.order_id,
      checkout_total: checkout.total,
      checkout_currency: checkout.currency,
      checkout_item_count: checkout.items.length,
      checkout_step: checkout.step || 1,
      products: checkout.items.map(item => ({
        product_id: item.id,
        product_name: item.name,
        product_category: item.category,
        product_price: item.price,
        product_quantity: item.quantity,
      })),
    },
    context,
  };
}

export function trackCheckoutStepCompleted(
  checkout: {
    order_id?: string;
    step: number;
    step_name?: string;
    payment_method?: string;
    shipping_method?: string;
  },
  context?: any,
): AnalyticsEvent {
  return {
    name: 'Checkout Step Completed',
    properties: {
      order_id: checkout.order_id,
      checkout_step: checkout.step,
      checkout_step_name: checkout.step_name,
      payment_method: checkout.payment_method,
      shipping_method: checkout.shipping_method,
    },
    context,
  };
}

export function trackOrderCompleted(
  order: {
    id: string;
    total: number;
    revenue?: number;
    currency: string;
    items: Array<{
      id: string;
      name: string;
      category?: string;
      brand?: string;
      variant?: string;
      price: number;
      quantity: number;
      sku?: string;
    }>;
    shipping?: number;
    tax?: number;
    discount?: number;
    coupon?: string;
    payment_method?: string;
    shipping_method?: string;
  },
  context?: any,
): AnalyticsEvent {
  return {
    name: 'Order Completed',
    properties: {
      order_id: order.id,
      order_total: order.total,
      order_revenue: order.revenue || order.total,
      order_currency: order.currency,
      order_item_count: order.items.length,
      order_quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      order_shipping: order.shipping || 0,
      order_tax: order.tax || 0,
      order_discount: order.discount || 0,
      order_coupon: order.coupon,
      payment_method: order.payment_method,
      shipping_method: order.shipping_method,
      products: order.items.map(item => ({
        product_id: item.id,
        product_name: item.name,
        product_category: item.category,
        product_brand: item.brand,
        product_variant: item.variant,
        product_price: item.price,
        product_quantity: item.quantity,
        product_sku: item.sku,
      })),
    },
    context,
  };
}

export function trackOrderRefunded(
  refund: {
    order_id: string;
    refund_id?: string;
    amount: number;
    currency: string;
    reason?: string;
    items?: Array<{
      id: string;
      quantity: number;
      amount: number;
    }>;
  },
  context?: any,
): AnalyticsEvent {
  return {
    name: 'Order Refunded',
    properties: {
      order_id: refund.order_id,
      refund_id: refund.refund_id,
      refund_amount: refund.amount,
      refund_currency: refund.currency,
      refund_reason: refund.reason,
      refunded_products: refund.items?.map(item => ({
        product_id: item.id,
        refund_quantity: item.quantity,
        refund_amount: item.amount,
      })),
    },
    context,
  };
}

export function trackCouponApplied(
  coupon: {
    code: string;
    discount_amount?: number;
    discount_percentage?: number;
    currency?: string;
    order_id?: string;
  },
  context?: any,
): AnalyticsEvent {
  return {
    name: 'Coupon Applied',
    properties: {
      coupon_code: coupon.code,
      coupon_discount_amount: coupon.discount_amount,
      coupon_discount_percentage: coupon.discount_percentage,
      coupon_currency: coupon.currency,
      order_id: coupon.order_id,
    },
    context,
  };
}

export function trackWishlistProductAdded(
  product: {
    id: string;
    name: string;
    category?: string;
    price: number;
    currency?: string;
  },
  wishlist?: {
    id: string;
    name?: string;
  },
  context?: any,
): AnalyticsEvent {
  return {
    name: 'Wishlist Product Added',
    properties: {
      product_id: product.id,
      product_name: product.name,
      product_category: product.category,
      product_price: product.price,
      product_currency: product.currency || 'USD',
      wishlist_id: wishlist?.id,
      wishlist_name: wishlist?.name,
    },
    context,
  };
}

export function trackProductListViewed(
  list: {
    list_id?: string;
    list_name?: string;
    category?: string;
    products: Array<{
      id: string;
      name: string;
      category?: string;
      brand?: string;
      price: number;
      position?: number;
    }>;
  },
  context?: any,
): AnalyticsEvent {
  return {
    name: 'Product List Viewed',
    properties: {
      list_id: list.list_id,
      list_name: list.list_name,
      list_category: list.category,
      product_count: list.products.length,
      products: list.products.map((product, index) => ({
        product_id: product.id,
        product_name: product.name,
        product_category: product.category,
        product_brand: product.brand,
        product_price: product.price,
        position: product.position ?? index + 1,
      })),
    },
    context,
  };
}

export function trackProductSearched(
  search: {
    query: string;
    results_count?: number;
    category?: string;
    filters?: Record<string, any>;
    sort_order?: string;
  },
  context?: any,
): AnalyticsEvent {
  return {
    name: 'Products Searched',
    properties: {
      search_query: search.query,
      search_results_count: search.results_count,
      search_category: search.category,
      search_filters: search.filters,
      search_sort_order: search.sort_order,
    },
    context,
  };
}
