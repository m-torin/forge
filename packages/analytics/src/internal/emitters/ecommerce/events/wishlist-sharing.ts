/**
 * Wishlist, sharing, and review-related ecommerce events
 */

import { ECOMMERCE_EVENTS, type WishlistProperties, type SharingProperties, type BaseProductProperties, type CartProperties, type ReviewProperties, type EcommerceEventSpec } from '../types';
import { normalizeProductProperties, normalizeProducts, cleanProperties, validateRequiredProperties } from '../utils';

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
    requiredProperties: ['product_id'],
    properties: cleanProperties({
      wishlist_id,
      wishlist_name,
      ...normalizedProduct,
    }),
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
    requiredProperties: ['product_id'],
    properties: cleanProperties({
      wishlist_id,
      wishlist_name,
      ...normalizedProduct,
    }),
  };
}

/**
 * Track when a wishlist product is added to cart
 */
export function wishlistProductAddedToCart(properties: WishlistProperties & { cart_id?: string }): EcommerceEventSpec {
  const { wishlist_id, wishlist_name, cart_id, ...productProps } = properties;
  const normalizedProduct = normalizeProductProperties(productProps);
  validateRequiredProperties(normalizedProduct, ['product_id']);

  return {
    name: ECOMMERCE_EVENTS.WISHLIST_PRODUCT_ADDED_TO_CART,
    category: 'ecommerce',
    requiredProperties: ['product_id'],
    properties: cleanProperties({
      wishlist_id,
      wishlist_name,
      cart_id,
      ...normalizedProduct,
    }),
  };
}

/**
 * Track when a product is shared
 */
export function productShared(properties: BaseProductProperties & SharingProperties): EcommerceEventSpec {
  const { share_via, share_message, recipient, ...productProps } = properties;
  const normalizedProduct = normalizeProductProperties(productProps);
  validateRequiredProperties(normalizedProduct, ['product_id']);

  return {
    name: ECOMMERCE_EVENTS.PRODUCT_SHARED,
    category: 'ecommerce',
    requiredProperties: ['product_id'],
    properties: cleanProperties({
      share_via,
      share_message,
      recipient,
      ...normalizedProduct,
    }),
  };
}

/**
 * Track when a cart is shared
 */
export function cartShared(properties: CartProperties & SharingProperties): EcommerceEventSpec {
  const { share_via, share_message, recipient, cart_id, products } = properties;

  return {
    name: ECOMMERCE_EVENTS.CART_SHARED,
    category: 'ecommerce',
    requiredProperties: [],
    properties: cleanProperties({
      share_via,
      share_message,
      recipient,
      cart_id,
      products: products ? normalizeProducts(products) : undefined,
    }),
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
    requiredProperties: ['product_id'],
    properties: cleanProperties(properties),
  };
}