/**
 * Order-related ecommerce events
 */

import { trackEcommerce } from '../track-ecommerce';
import {
  ECOMMERCE_EVENTS,
  type EcommerceEventSpec,
  type OrderProperties,
  type OrderStatusProperties,
  type ReturnProperties,
} from '../types';
import {
  cleanProperties,
  normalizeProducts,
  validateCurrency,
  validateRequiredProperties,
} from '../utils';

import type { EmitterOptions, EmitterTrackPayload } from '../../emitter-types';

/**
 * Track when a user completes an order
 */
export function orderCompleted(
  properties: OrderProperties,
  options?: EmitterOptions,
): EmitterTrackPayload {
  validateRequiredProperties(properties, ['order_id']);

  const normalizedProps: OrderProperties = {
    order_id: properties.order_id,
    affiliation: properties.affiliation,
    coupon: properties.coupon,
    currency: validateCurrency(properties.currency),
    discount: properties.discount,
    products: properties.products ? normalizeProducts(properties.products) : undefined,
    revenue: properties.revenue,
    shipping: properties.shipping,
    tax: properties.tax,
    total: properties.total,
  };

  const eventSpec: EcommerceEventSpec = {
    name: ECOMMERCE_EVENTS.ORDER_COMPLETED,
    category: 'ecommerce',
    properties: cleanProperties(normalizedProps),
    requiredProperties: ['order_id'],
  };

  return trackEcommerce(eventSpec, options);
}

/**
 * Track when an order fails (payment declined, validation error, etc.)
 */
export function orderFailed(
  properties: OrderProperties & {
    failure_reason?: string;
    error_code?: string;
  },
): EcommerceEventSpec {
  validateRequiredProperties(properties, ['order_id']);

  const { error_code, failure_reason, ...orderProps } = properties;
  const normalizedProps = {
    order_id: orderProps.order_id,
    affiliation: orderProps.affiliation,
    coupon: orderProps.coupon,
    currency: validateCurrency(orderProps.currency),
    discount: orderProps.discount,
    error_code,
    failure_reason,
    products: orderProps.products ? normalizeProducts(orderProps.products) : undefined,
    revenue: orderProps.revenue,
    shipping: orderProps.shipping,
    tax: orderProps.tax,
    total: orderProps.total,
  };

  return {
    name: ECOMMERCE_EVENTS.ORDER_FAILED,
    category: 'ecommerce',
    properties: cleanProperties(normalizedProps),
    requiredProperties: ['order_id'],
  };
}

/**
 * Track when an order is refunded
 */
export function orderRefunded(properties: OrderProperties): EcommerceEventSpec {
  validateRequiredProperties(properties, ['order_id']);

  const normalizedProps: OrderProperties = {
    order_id: properties.order_id,
    affiliation: properties.affiliation,
    coupon: properties.coupon,
    currency: validateCurrency(properties.currency),
    discount: properties.discount,
    products: properties.products ? normalizeProducts(properties.products) : undefined,
    revenue: properties.revenue,
    shipping: properties.shipping,
    tax: properties.tax,
    total: properties.total,
  };

  return {
    name: ECOMMERCE_EVENTS.ORDER_REFUNDED,
    category: 'ecommerce',
    properties: cleanProperties(normalizedProps),
    requiredProperties: ['order_id'],
  };
}

/**
 * Track when an order is cancelled
 */
export function orderCancelled(properties: OrderProperties): EcommerceEventSpec {
  validateRequiredProperties(properties, ['order_id']);

  const normalizedProps: OrderProperties = {
    order_id: properties.order_id,
    affiliation: properties.affiliation,
    coupon: properties.coupon,
    currency: validateCurrency(properties.currency),
    discount: properties.discount,
    products: properties.products ? normalizeProducts(properties.products) : undefined,
    revenue: properties.revenue,
    shipping: properties.shipping,
    tax: properties.tax,
    total: properties.total,
  };

  return {
    name: ECOMMERCE_EVENTS.ORDER_CANCELLED,
    category: 'ecommerce',
    properties: cleanProperties(normalizedProps),
    requiredProperties: ['order_id'],
  };
}

/**
 * Track order status changes (shipping, delivery, etc.)
 */
export function orderStatusUpdated(properties: OrderStatusProperties): EcommerceEventSpec {
  validateRequiredProperties(properties, ['order_id', 'status']);

  return {
    name: ECOMMERCE_EVENTS.ORDER_STATUS_UPDATED,
    category: 'ecommerce',
    properties: cleanProperties(properties),
    requiredProperties: ['order_id', 'status'],
  };
}

/**
 * Track when a return is requested
 */
export function returnRequested(properties: ReturnProperties): EcommerceEventSpec {
  validateRequiredProperties(properties, ['order_id', 'reason']);

  const normalizedProps = {
    ...properties,
    products: normalizeProducts(properties.products),
  };

  return {
    name: ECOMMERCE_EVENTS.RETURN_REQUESTED,
    category: 'ecommerce',
    properties: cleanProperties(normalizedProps),
    requiredProperties: ['order_id', 'reason'],
  };
}

/**
 * Track when a return is completed
 */
export function returnCompleted(
  properties: ReturnProperties & {
    completion_date?: string;
    refund_status?: 'pending' | 'completed' | 'failed';
  },
): EcommerceEventSpec {
  validateRequiredProperties(properties, ['order_id', 'return_id']);

  const normalizedProps = {
    ...properties,
    products: normalizeProducts(properties.products),
  };

  return {
    name: ECOMMERCE_EVENTS.RETURN_COMPLETED,
    category: 'ecommerce',
    properties: cleanProperties(normalizedProps),
    requiredProperties: ['order_id', 'return_id'],
  };
}
