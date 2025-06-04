/**
 * Platform-standard ecommerce events
 * 
 * These events follow industry best practices for ecommerce tracking
 * and are designed to work with any analytics provider.
 */

// Export all types
export * from './types';

// Export utilities
export * from './utils';

// Export all event functions
export * from './events/product';
export * from './events/cart-checkout';
export * from './events/order';
export * from './events/coupon';
export * from './events/wishlist-sharing';
export * from './events/marketplace';
export * from './events/registry';
export * from './events/engagement';

// Export tracking functionality
export * from './track-ecommerce';

// Re-export commonly used constants for convenience
export { ECOMMERCE_EVENTS } from './types';