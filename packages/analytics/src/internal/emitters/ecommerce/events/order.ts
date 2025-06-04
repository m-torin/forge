/**
 * Order-related ecommerce events
 */

import { 
  ECOMMERCE_EVENTS, 
  type OrderProperties, 
  type OrderStatusProperties,
  type ReturnProperties,
  type EcommerceEventSpec 
} from '../types';
import { normalizeProducts, cleanProperties, validateRequiredProperties, validateCurrency } from '../utils';

/**
 * Track when a user completes an order
 */
export function orderCompleted(properties: OrderProperties): EcommerceEventSpec<OrderProperties> {
  validateRequiredProperties(properties, ['order_id']);

  const normalizedProps: OrderProperties = {
    order_id: properties.order_id,
    affiliation: properties.affiliation,
    total: properties.total,
    revenue: properties.revenue,
    shipping: properties.shipping,
    tax: properties.tax,
    discount: properties.discount,
    coupon: properties.coupon,
    currency: validateCurrency(properties.currency),
    products: properties.products ? normalizeProducts(properties.products) : undefined,
  };

  return {
    name: ECOMMERCE_EVENTS.ORDER_COMPLETED,
    category: 'ecommerce',
    requiredProperties: ['order_id'],
    properties: cleanProperties(normalizedProps),
  };
}

/**
 * Track when an order fails (payment declined, validation error, etc.)
 */
export function orderFailed(properties: OrderProperties & { 
  failure_reason?: string;
  error_code?: string;
}): EcommerceEventSpec {
  validateRequiredProperties(properties, ['order_id']);

  const { failure_reason, error_code, ...orderProps } = properties;
  const normalizedProps = {
    order_id: orderProps.order_id,
    affiliation: orderProps.affiliation,
    total: orderProps.total,
    revenue: orderProps.revenue,
    shipping: orderProps.shipping,
    tax: orderProps.tax,
    discount: orderProps.discount,
    coupon: orderProps.coupon,
    currency: validateCurrency(orderProps.currency),
    products: orderProps.products ? normalizeProducts(orderProps.products) : undefined,
    failure_reason,
    error_code,
  };

  return {
    name: ECOMMERCE_EVENTS.ORDER_FAILED,
    category: 'ecommerce',
    requiredProperties: ['order_id'],
    properties: cleanProperties(normalizedProps),
  };
}

/**
 * Track when an order is refunded
 */
export function orderRefunded(properties: OrderProperties): EcommerceEventSpec<OrderProperties> {
  validateRequiredProperties(properties, ['order_id']);

  const normalizedProps: OrderProperties = {
    order_id: properties.order_id,
    affiliation: properties.affiliation,
    total: properties.total,
    revenue: properties.revenue,
    shipping: properties.shipping,
    tax: properties.tax,
    discount: properties.discount,
    coupon: properties.coupon,
    currency: validateCurrency(properties.currency),
    products: properties.products ? normalizeProducts(properties.products) : undefined,
  };

  return {
    name: ECOMMERCE_EVENTS.ORDER_REFUNDED,
    category: 'ecommerce',
    requiredProperties: ['order_id'],
    properties: cleanProperties(normalizedProps),
  };
}

/**
 * Track when an order is cancelled
 */
export function orderCancelled(properties: OrderProperties): EcommerceEventSpec<OrderProperties> {
  validateRequiredProperties(properties, ['order_id']);

  const normalizedProps: OrderProperties = {
    order_id: properties.order_id,
    affiliation: properties.affiliation,
    total: properties.total,
    revenue: properties.revenue,
    shipping: properties.shipping,
    tax: properties.tax,
    discount: properties.discount,
    coupon: properties.coupon,
    currency: validateCurrency(properties.currency),
    products: properties.products ? normalizeProducts(properties.products) : undefined,
  };

  return {
    name: ECOMMERCE_EVENTS.ORDER_CANCELLED,
    category: 'ecommerce',
    requiredProperties: ['order_id'],
    properties: cleanProperties(normalizedProps),
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
    requiredProperties: ['order_id', 'status'],
    properties: cleanProperties(properties),
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
    requiredProperties: ['order_id', 'reason'],
    properties: cleanProperties(normalizedProps),
  };
}

/**
 * Track when a return is completed
 */
export function returnCompleted(properties: ReturnProperties & {
  completion_date?: string;
  refund_status?: 'pending' | 'completed' | 'failed';
}): EcommerceEventSpec {
  validateRequiredProperties(properties, ['order_id', 'return_id']);

  const normalizedProps = {
    ...properties,
    products: normalizeProducts(properties.products),
  };

  return {
    name: ECOMMERCE_EVENTS.RETURN_COMPLETED,
    category: 'ecommerce',
    requiredProperties: ['order_id', 'return_id'],
    properties: cleanProperties(normalizedProps),
  };
}