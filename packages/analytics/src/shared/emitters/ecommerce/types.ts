/**
 * Platform-standard ecommerce event types
 * Based on industry best practices for ecommerce tracking
 */

// Base product properties shared across events
export interface BaseProductProperties {
  affiliate_link?: string;
  affiliate_network?: string;
  availability?: 'in_stock' | 'out_of_stock' | 'preorder' | 'discontinued';
  brand?: string;
  category?: string;
  commission_amount?: number;
  commission_rate?: number;
  condition?: 'new' | 'used' | 'refurbished';
  coupon?: string;
  gtin?: string;
  image_url?: string;
  // Marketplace/affiliate properties (optional for any product)
  merchant_id?: string;
  merchant_name?: string;
  merchant_url?: string;
  mpn?: string;
  name?: string;
  original_price?: number;
  position?: number;
  price?: number;
  product_id: string;
  quantity?: number;
  sale_price?: number;
  url?: string;
  variant?: string;
}

// Extended product properties for detailed tracking
export interface ExtendedProductProperties extends BaseProductProperties {
  currency?: string;
  value?: number;
}

// Registry-specific properties
export interface RegistryProperties {
  co_registrant_id?: string;
  co_registrant_name?: string;
  event_date?: string;
  privacy_setting?: 'public' | 'private' | 'unlisted';
  registry_id: string;
  registry_name?: string;
  registry_type?: 'wedding' | 'baby' | 'birthday' | 'universal' | 'custom';
  registry_url?: string;
}

// Registry item properties
export interface RegistryItemProperties extends BaseProductProperties {
  merchant_id?: string;
  merchant_name?: string;
  notes?: string;
  priority?: 'high' | 'medium' | 'low';
  purchased_quantity?: number;
  registry_id: string;
  requested_quantity?: number;
}

// Properties for product list events
export interface ProductListProperties {
  category?: string;
  list_id?: string;
  products?: BaseProductProperties[];
}

// Properties for cart events
export interface CartProperties {
  cart_id?: string;
  products?: BaseProductProperties[];
}

// Properties for checkout events
export interface CheckoutProperties {
  checkout_id?: string;
  payment_method?: string;
  products?: BaseProductProperties[];
  shipping_method?: string;
  step?: number;
}

// Properties for order events
export interface OrderProperties {
  affiliation?: string;
  coupon?: string;
  currency?: string;
  discount?: number;
  order_id: string;
  products?: BaseProductProperties[];
  revenue?: number;
  shipping?: number;
  tax?: number;
  total?: number;
}

// Properties for coupon events
export interface CouponProperties {
  cart_id?: string;
  coupon_id?: string;
  coupon_name?: string;
  discount?: number;
  order_id?: string;
  reason?: string;
}

// Properties for wishlist events
export interface WishlistProperties extends BaseProductProperties {
  wishlist_id?: string;
  wishlist_name?: string;
}

// Properties for sharing events
export interface SharingProperties {
  recipient?: string;
  share_message?: string;
  share_via?: string;
}

// Properties for review events
export interface ReviewProperties {
  product_id: string;
  rating?: string;
  review_body?: string;
  review_id?: string;
}

// Properties for search results
export interface SearchResultsProperties {
  filters_applied?: Record<string, any>;
  products?: BaseProductProperties[];
  query: string;
  results_count: number;
  sort_order?: string;
}

// Properties for cart updates
export interface CartUpdateProperties {
  action: 'added' | 'removed' | 'updated';
  cart_id?: string;
  cart_total?: number;
  product: BaseProductProperties;
  quantity_change?: number;
}

// Properties for cart abandonment
export interface CartAbandonmentProperties {
  abandonment_reason?: 'timeout' | 'navigation' | 'closed';
  cart_id: string;
  cart_value: number;
  products: BaseProductProperties[];
  time_in_cart?: number;
}

// Properties for checkout progression
export interface CheckoutProgressProperties {
  action: 'viewed' | 'completed' | 'abandoned' | 'error';
  checkout_id?: string;
  error_message?: string;
  payment_method?: string;
  products?: BaseProductProperties[];
  shipping_method?: string;
  step: number;
  step_name: string;
}

// Properties for order status updates
export interface OrderStatusProperties {
  carrier?: string;
  estimated_delivery?: string;
  order_id: string;
  previous_status?: string;
  status:
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'out_for_delivery'
    | 'delivered'
    | 'returned'
    | 'failed';
  tracking_number?: string;
}

// Properties for product comparison
export interface ProductComparisonProperties {
  action: 'added' | 'removed' | 'viewed';
  comparison_list?: BaseProductProperties[];
  product: BaseProductProperties;
}

// Properties for recommendations
export interface RecommendationProperties {
  algorithm?: string;
  products: BaseProductProperties[];
  recommendation_type:
    | 'similar'
    | 'frequently_bought'
    | 'trending'
    | 'personalized'
    | 'upsell'
    | 'cross_sell';
  source: string; // e.g., 'product_page', 'cart', 'checkout'
}

// Properties for engagement events
export interface EngagementProperties {
  action_type: 'price_alert' | 'back_in_stock' | 'favorite';
  notification_method?: 'email' | 'sms' | 'push';
  product_id: string;
  threshold_price?: number;
}

// Properties for returns
export interface ReturnProperties {
  order_id: string;
  products: BaseProductProperties[];
  reason: string;
  refund_amount?: number;
  return_id?: string;
  return_method?: 'mail' | 'store' | 'pickup';
}

// Standard ecommerce event names
export const ECOMMERCE_EVENTS = {
  PRODUCT_CLICKED: 'Product Clicked',
  PRODUCT_COMPARED: 'Product Compared',
  PRODUCT_LIST_FILTERED: 'Product List Filtered',
  PRODUCT_LIST_VIEWED: 'Product List Viewed',
  PRODUCT_RECOMMENDATION_CLICKED: 'Product Recommendation Clicked',
  PRODUCT_RECOMMENDATION_VIEWED: 'Product Recommendation Viewed',
  // Search & Discovery events
  PRODUCT_SEARCHED: 'Product Searched',
  PRODUCT_VIEWED: 'Product Viewed',
  SEARCH_RESULTS_VIEWED: 'Search Results Viewed',

  CART_ABANDONED: 'Cart Abandoned',
  // Cart events
  CART_UPDATED: 'Cart Updated',
  CART_VIEWED: 'Cart Viewed',

  // Checkout events
  CHECKOUT_PROGRESSED: 'Checkout Progressed',

  ORDER_CANCELLED: 'Order Cancelled',
  // Order events
  ORDER_COMPLETED: 'Order Completed',
  ORDER_FAILED: 'Order Failed',
  ORDER_REFUNDED: 'Order Refunded',
  ORDER_STATUS_UPDATED: 'Order Status Updated',

  // Coupon events
  COUPON_APPLIED: 'Coupon Applied',
  COUPON_REMOVED: 'Coupon Removed',

  // Wishlist events
  PRODUCT_ADDED_TO_WISHLIST: 'Product Added to Wishlist',
  PRODUCT_REMOVED_FROM_WISHLIST: 'Product Removed from Wishlist',
  WISHLIST_PRODUCT_ADDED_TO_CART: 'Wishlist Product Added to Cart',

  CART_SHARED: 'Cart Shared',
  // Sharing events
  PRODUCT_SHARED: 'Product Shared',

  // Review events
  PRODUCT_REVIEWED: 'Product Reviewed',

  AFFILIATE_CONVERSION_TRACKED: 'Affiliate Conversion Tracked',
  AFFILIATE_LINK_CLICKED: 'Affiliate Link Clicked',
  // Marketplace-specific events
  MERCHANT_SELECTED: 'Merchant Selected',
  PRICE_COMPARISON_VIEWED: 'Price Comparison Viewed',

  REGISTRY_ITEM_MANAGED: 'Registry Item Managed',
  // Registry events
  REGISTRY_MANAGED: 'Registry Managed',
  REGISTRY_SHARED: 'Registry Shared',
  REGISTRY_VIEWED: 'Registry Viewed',

  RETURN_COMPLETED: 'Return Completed',
  // Post-purchase events
  RETURN_REQUESTED: 'Return Requested',

  BACK_IN_STOCK_REQUESTED: 'Back In Stock Requested',
  // Engagement events
  PRICE_ALERT_SET: 'Price Alert Set',
} as const;

export type EcommerceEventName = (typeof ECOMMERCE_EVENTS)[keyof typeof ECOMMERCE_EVENTS];

// Event specification interface
export interface EcommerceEventSpec<T = any> {
  category: 'ecommerce';
  name: EcommerceEventName;
  properties: T;
  requiredProperties: (keyof T)[];
}

// Union type for all ecommerce event properties
export type EcommerceEventProperties =
  | BaseProductProperties
  | ExtendedProductProperties
  | ProductListProperties
  | CartProperties
  | CheckoutProperties
  | OrderProperties
  | CouponProperties
  | WishlistProperties
  | (BaseProductProperties & SharingProperties)
  | (CartProperties & SharingProperties)
  | ReviewProperties;
