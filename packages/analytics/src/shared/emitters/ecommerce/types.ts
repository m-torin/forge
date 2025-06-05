/**
 * Platform-standard ecommerce event types
 * Based on industry best practices for ecommerce tracking
 */

// Base product properties shared across events
export interface BaseProductProperties {
  product_id: string;
  sku?: string;
  category?: string;
  name?: string;
  brand?: string;
  variant?: string;
  price?: number;
  quantity?: number;
  coupon?: string;
  position?: number;
  url?: string;
  image_url?: string;
  // Marketplace/affiliate properties (optional for any product)
  merchant_id?: string;
  merchant_name?: string;
  merchant_url?: string;
  affiliate_network?: string;
  affiliate_link?: string;
  commission_rate?: number;
  commission_amount?: number;
  original_price?: number;
  sale_price?: number;
  availability?: 'in_stock' | 'out_of_stock' | 'preorder' | 'discontinued';
  condition?: 'new' | 'used' | 'refurbished';
  gtin?: string; // Global Trade Item Number
  mpn?: string; // Manufacturer Part Number
}

// Extended product properties for detailed tracking
export interface ExtendedProductProperties extends BaseProductProperties {
  currency?: string;
  value?: number;
}


// Registry-specific properties
export interface RegistryProperties {
  registry_id: string;
  registry_type?: 'wedding' | 'baby' | 'birthday' | 'universal' | 'custom';
  registry_name?: string;
  registry_url?: string;
  event_date?: string;
  privacy_setting?: 'public' | 'private' | 'unlisted';
  co_registrant_id?: string;
  co_registrant_name?: string;
}

// Registry item properties
export interface RegistryItemProperties extends BaseProductProperties {
  registry_id: string;
  requested_quantity?: number;
  purchased_quantity?: number;
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
  merchant_id?: string;
  merchant_name?: string;
}

// Properties for product list events
export interface ProductListProperties {
  list_id?: string;
  category?: string;
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
  step?: number;
  shipping_method?: string;
  payment_method?: string;
  products?: BaseProductProperties[];
}

// Properties for order events
export interface OrderProperties {
  order_id: string;
  affiliation?: string;
  total?: number;
  revenue?: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  coupon?: string;
  currency?: string;
  products?: BaseProductProperties[];
}

// Properties for coupon events
export interface CouponProperties {
  order_id?: string;
  cart_id?: string;
  coupon_id?: string;
  coupon_name?: string;
  discount?: number;
  reason?: string;
}

// Properties for wishlist events
export interface WishlistProperties extends BaseProductProperties {
  wishlist_id?: string;
  wishlist_name?: string;
}

// Properties for sharing events
export interface SharingProperties {
  share_via?: string;
  share_message?: string;
  recipient?: string;
}

// Properties for review events
export interface ReviewProperties {
  product_id: string;
  review_id?: string;
  review_body?: string;
  rating?: string;
}

// Properties for search results
export interface SearchResultsProperties {
  query: string;
  results_count: number;
  filters_applied?: Record<string, any>;
  sort_order?: string;
  products?: BaseProductProperties[];
}

// Properties for cart updates
export interface CartUpdateProperties {
  action: 'added' | 'removed' | 'updated';
  product: BaseProductProperties;
  quantity_change?: number;
  cart_total?: number;
  cart_id?: string;
}

// Properties for cart abandonment
export interface CartAbandonmentProperties {
  cart_id: string;
  cart_value: number;
  products: BaseProductProperties[];
  abandonment_reason?: 'timeout' | 'navigation' | 'closed';
  time_in_cart?: number; // seconds
}

// Properties for checkout progression
export interface CheckoutProgressProperties {
  step: number;
  step_name: string;
  action: 'viewed' | 'completed' | 'abandoned' | 'error';
  error_message?: string;
  products?: BaseProductProperties[];
  checkout_id?: string;
  payment_method?: string;
  shipping_method?: string;
}

// Properties for order status updates
export interface OrderStatusProperties {
  order_id: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'returned' | 'failed';
  previous_status?: string;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery?: string;
}

// Properties for product comparison
export interface ProductComparisonProperties {
  action: 'added' | 'removed' | 'viewed';
  product: BaseProductProperties;
  comparison_list?: BaseProductProperties[];
}

// Properties for recommendations
export interface RecommendationProperties {
  recommendation_type: 'similar' | 'frequently_bought' | 'trending' | 'personalized' | 'upsell' | 'cross_sell';
  source: string; // e.g., 'product_page', 'cart', 'checkout'
  products: BaseProductProperties[];
  algorithm?: string;
}

// Properties for engagement events
export interface EngagementProperties {
  product_id: string;
  action_type: 'price_alert' | 'back_in_stock' | 'favorite';
  notification_method?: 'email' | 'sms' | 'push';
  threshold_price?: number;
}

// Properties for returns
export interface ReturnProperties {
  order_id: string;
  products: BaseProductProperties[];
  reason: string;
  return_id?: string;
  refund_amount?: number;
  return_method?: 'mail' | 'store' | 'pickup';
}

// Standard ecommerce event names
export const ECOMMERCE_EVENTS = {
  // Search & Discovery events
  PRODUCT_SEARCHED: 'Product Searched',
  SEARCH_RESULTS_VIEWED: 'Search Results Viewed',
  PRODUCT_LIST_VIEWED: 'Product List Viewed',
  PRODUCT_LIST_FILTERED: 'Product List Filtered',
  PRODUCT_CLICKED: 'Product Clicked',
  PRODUCT_VIEWED: 'Product Viewed',
  PRODUCT_COMPARED: 'Product Compared',
  PRODUCT_RECOMMENDATION_VIEWED: 'Product Recommendation Viewed',
  PRODUCT_RECOMMENDATION_CLICKED: 'Product Recommendation Clicked',
  
  // Cart events
  CART_UPDATED: 'Cart Updated',
  CART_VIEWED: 'Cart Viewed',
  CART_ABANDONED: 'Cart Abandoned',
  
  // Checkout events
  CHECKOUT_PROGRESSED: 'Checkout Progressed',
  
  // Order events
  ORDER_COMPLETED: 'Order Completed',
  ORDER_FAILED: 'Order Failed',
  ORDER_REFUNDED: 'Order Refunded',
  ORDER_CANCELLED: 'Order Cancelled',
  ORDER_STATUS_UPDATED: 'Order Status Updated',
  
  // Coupon events
  COUPON_APPLIED: 'Coupon Applied',
  COUPON_REMOVED: 'Coupon Removed',
  
  // Wishlist events
  PRODUCT_ADDED_TO_WISHLIST: 'Product Added to Wishlist',
  PRODUCT_REMOVED_FROM_WISHLIST: 'Product Removed from Wishlist',
  WISHLIST_PRODUCT_ADDED_TO_CART: 'Wishlist Product Added to Cart',
  
  // Sharing events
  PRODUCT_SHARED: 'Product Shared',
  CART_SHARED: 'Cart Shared',
  
  // Review events
  PRODUCT_REVIEWED: 'Product Reviewed',
  
  // Marketplace-specific events
  MERCHANT_SELECTED: 'Merchant Selected',
  PRICE_COMPARISON_VIEWED: 'Price Comparison Viewed',
  AFFILIATE_LINK_CLICKED: 'Affiliate Link Clicked',
  AFFILIATE_CONVERSION_TRACKED: 'Affiliate Conversion Tracked',
  
  // Registry events
  REGISTRY_MANAGED: 'Registry Managed',
  REGISTRY_VIEWED: 'Registry Viewed',
  REGISTRY_SHARED: 'Registry Shared',
  REGISTRY_ITEM_MANAGED: 'Registry Item Managed',
  
  // Post-purchase events
  RETURN_REQUESTED: 'Return Requested',
  RETURN_COMPLETED: 'Return Completed',
  
  // Engagement events
  PRICE_ALERT_SET: 'Price Alert Set',
  BACK_IN_STOCK_REQUESTED: 'Back In Stock Requested',
} as const;

export type EcommerceEventName = typeof ECOMMERCE_EVENTS[keyof typeof ECOMMERCE_EVENTS];

// Event specification interface
export interface EcommerceEventSpec<T = any> {
  name: EcommerceEventName;
  category: 'ecommerce';
  requiredProperties: (keyof T)[];
  properties: T;
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