/**
 * Wishlist, sharing, and review-related ecommerce events
 */

import {
  type BaseProductProperties,
  type CartProperties,
  ECOMMERCE_EVENTS,
  type EcommerceEventSpec,
  type ReviewProperties,
  type SharingProperties,
  type WishlistProperties,
} from '../types';
import {
  cleanProperties,
  normalizeProductProperties,
  normalizeProducts,
  validateRequiredProperties,
} from '../utils';

/**
 * Track when a product is added to wishlist
 */
export function productAddedToWishlist(properties: WishlistProperties): EcommerceEventSpec {
  const { wishlist_id, wishlist_name, ...productProps } = properties;
  const normalizedProduct = normalizeProductProperties(productProps);
  validateRequiredProperties(normalizedProduct, ['product_id']);

  return {
    name: ECOMMERCE_EVENTS.PRODUCT_ADDED_TO_WISHLIST,
    category: 'ecommerce',
    properties: cleanProperties({
      wishlist_id,
      wishlist_name,
      ...normalizedProduct,
    }),
    requiredProperties: ['product_id'],
  };
}

/**
 * Track when a product is removed from wishlist
 */
export function productRemovedFromWishlist(properties: WishlistProperties): EcommerceEventSpec {
  const { wishlist_id, wishlist_name, ...productProps } = properties;
  const normalizedProduct = normalizeProductProperties(productProps);
  validateRequiredProperties(normalizedProduct, ['product_id']);

  return {
    name: ECOMMERCE_EVENTS.PRODUCT_REMOVED_FROM_WISHLIST,
    category: 'ecommerce',
    properties: cleanProperties({
      wishlist_id,
      wishlist_name,
      ...normalizedProduct,
    }),
    requiredProperties: ['product_id'],
  };
}

/**
 * Track when a wishlist product is added to cart
 */
export function wishlistProductAddedToCart(
  properties: WishlistProperties & { cart_id?: string },
): EcommerceEventSpec {
  const { cart_id, wishlist_id, wishlist_name, ...productProps } = properties;
  const normalizedProduct = normalizeProductProperties(productProps);
  validateRequiredProperties(normalizedProduct, ['product_id']);

  return {
    name: ECOMMERCE_EVENTS.WISHLIST_PRODUCT_ADDED_TO_CART,
    category: 'ecommerce',
    properties: cleanProperties({
      cart_id,
      wishlist_id,
      wishlist_name,
      ...normalizedProduct,
    }),
    requiredProperties: ['product_id'],
  };
}

/**
 * Track when a product is shared
 */
export function productShared(
  properties: BaseProductProperties & SharingProperties,
): EcommerceEventSpec {
  const { recipient, share_message, share_via, ...productProps } = properties;
  const normalizedProduct = normalizeProductProperties(productProps);
  validateRequiredProperties(normalizedProduct, ['product_id']);

  return {
    name: ECOMMERCE_EVENTS.PRODUCT_SHARED,
    category: 'ecommerce',
    properties: cleanProperties({
      recipient,
      share_message,
      share_via,
      ...normalizedProduct,
    }),
    requiredProperties: ['product_id'],
  };
}

/**
 * Track when a cart is shared
 */
export function cartShared(properties: CartProperties & SharingProperties): EcommerceEventSpec {
  const { cart_id, products, recipient, share_message, share_via } = properties;

  return {
    name: ECOMMERCE_EVENTS.CART_SHARED,
    category: 'ecommerce',
    properties: cleanProperties({
      cart_id,
      products: products ? normalizeProducts(products) : undefined,
      recipient,
      share_message,
      share_via,
    }),
    requiredProperties: [],
  };
}

/**
 * Track when a product is reviewed
 */
export function productReviewed(properties: ReviewProperties): EcommerceEventSpec {
  validateRequiredProperties(properties, ['product_id']);

  return {
    name: ECOMMERCE_EVENTS.PRODUCT_REVIEWED,
    category: 'ecommerce',
    properties: cleanProperties(properties),
    requiredProperties: ['product_id'],
  };
}
