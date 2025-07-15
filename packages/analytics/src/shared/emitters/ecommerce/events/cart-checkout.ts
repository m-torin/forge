/**
 * Cart and checkout-related ecommerce events
 */

import { trackEcommerce } from '../track-ecommerce';
import {
  type CartAbandonmentProperties,
  type CartProperties,
  type CartUpdateProperties,
  type CheckoutProgressProperties,
  ECOMMERCE_EVENTS,
  type EcommerceEventSpec,
} from '../types';
import {
  cleanProperties,
  normalizeProductProperties,
  normalizeProducts,
  validateRequiredProperties,
} from '../utils';

import type { EmitterOptions, EmitterTrackPayload } from '../../emitter-types';

/**
 * Track cart updates (add, remove, update) with a single event
 */
export function cartUpdated(
  properties: CartUpdateProperties,
  options?: EmitterOptions,
): EmitterTrackPayload {
  const { cart_id, action, cart_total, product, quantity_change } = properties;
  const normalizedProduct = normalizeProductProperties(product);

  validateRequiredProperties(properties, ['action']);
  validateRequiredProperties(normalizedProduct, ['product_id']);

  const eventSpec: EcommerceEventSpec = {
    name: ECOMMERCE_EVENTS.CART_UPDATED,
    category: 'ecommerce',
    properties: cleanProperties({
      action,
      ...normalizedProduct,
      cart_id,
      cart_total,
      quantity_change,
    }),
    requiredProperties: ['action', 'product_id'],
  };

  return trackEcommerce(eventSpec, options);
}

/**
 * Track when a user views their shopping cart
 */
export function cartViewed(properties: CartProperties): EcommerceEventSpec<CartProperties> {
  const normalizedProps: CartProperties = {
    cart_id: properties.cart_id,
    products: properties.products ? normalizeProducts(properties.products) : undefined,
  };

  return {
    name: ECOMMERCE_EVENTS.CART_VIEWED,
    category: 'ecommerce',
    properties: cleanProperties(normalizedProps),
    requiredProperties: [],
  };
}

/**
 * Track when a cart is abandoned
 */
export function cartAbandoned(properties: CartAbandonmentProperties): EcommerceEventSpec {
  validateRequiredProperties(properties, ['cart_id', 'cart_value']);

  const normalizedProps = {
    ...properties,
    products: normalizeProducts(properties.products),
  };

  return {
    name: ECOMMERCE_EVENTS.CART_ABANDONED,
    category: 'ecommerce',
    properties: cleanProperties(normalizedProps),
    requiredProperties: ['cart_id', 'cart_value'],
  };
}

/**
 * Track checkout progression with a single event
 */
export function checkoutProgressed(properties: CheckoutProgressProperties): EcommerceEventSpec {
  validateRequiredProperties(properties, ['step', 'step_name', 'action']);

  const normalizedProps = {
    ...properties,
    products: properties.products ? normalizeProducts(properties.products) : undefined,
  };

  return {
    name: ECOMMERCE_EVENTS.CHECKOUT_PROGRESSED,
    category: 'ecommerce',
    properties: cleanProperties(normalizedProps),
    requiredProperties: ['step', 'step_name', 'action'],
  };
}
