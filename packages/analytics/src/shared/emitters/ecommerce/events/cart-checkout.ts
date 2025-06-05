/**
 * Cart and checkout-related ecommerce events
 */

import { 
  ECOMMERCE_EVENTS, 
  type CartProperties, 
  type CartUpdateProperties,
  type CartAbandonmentProperties,
  type CheckoutProgressProperties,
  type EcommerceEventSpec 
} from '../types';
import { normalizeProducts, normalizeProductProperties, cleanProperties, validateRequiredProperties } from '../utils';
import { trackEcommerce } from '../track-ecommerce';
import type { EmitterTrackPayload, EmitterOptions } from '../../emitter-types';

/**
 * Track cart updates (add, remove, update) with a single event
 */
export function cartUpdated(properties: CartUpdateProperties, options?: EmitterOptions): EmitterTrackPayload {
  const { action, product, quantity_change, cart_total, cart_id } = properties;
  const normalizedProduct = normalizeProductProperties(product);
  
  validateRequiredProperties(properties, ['action']);
  validateRequiredProperties(normalizedProduct, ['product_id']);

  const eventSpec: EcommerceEventSpec = {
    name: ECOMMERCE_EVENTS.CART_UPDATED,
    category: 'ecommerce',
    requiredProperties: ['action', 'product_id'],
    properties: cleanProperties({
      action,
      ...normalizedProduct,
      quantity_change,
      cart_total,
      cart_id,
    }),
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
    requiredProperties: [],
    properties: cleanProperties(normalizedProps),
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
    requiredProperties: ['cart_id', 'cart_value'],
    properties: cleanProperties(normalizedProps),
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
    requiredProperties: ['step', 'step_name', 'action'],
    properties: cleanProperties(normalizedProps),
  };
}