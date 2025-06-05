/**
 * Customer engagement events for ecommerce
 * Track user interactions that indicate interest but aren't direct purchases
 */

import { ECOMMERCE_EVENTS, type EngagementProperties, type BaseProductProperties, type EcommerceEventSpec } from '../types';
import { normalizeProductProperties, cleanProperties, validateRequiredProperties } from '../utils';

/**
 * Track when a user sets a price alert for a product
 */
export function priceAlertSet(properties: BaseProductProperties & {
  threshold_price: number;
  notification_method?: 'email' | 'sms' | 'push';
  currency?: string;
}): EcommerceEventSpec {
  const { threshold_price, notification_method, currency, ...productProps } = properties;
  const normalizedProduct = normalizeProductProperties(productProps);
  validateRequiredProperties(normalizedProduct, ['product_id']);
  validateRequiredProperties({ threshold_price }, ['threshold_price']);

  return {
    name: ECOMMERCE_EVENTS.PRICE_ALERT_SET,
    category: 'ecommerce',
    requiredProperties: ['product_id', 'threshold_price'],
    properties: cleanProperties({
      ...normalizedProduct,
      action_type: 'price_alert',
      threshold_price,
      notification_method,
      currency,
    }),
  };
}

/**
 * Track when a user requests notification for out-of-stock items
 */
export function backInStockRequested(properties: BaseProductProperties & {
  notification_method?: 'email' | 'sms' | 'push';
}): EcommerceEventSpec {
  const { notification_method, ...productProps } = properties;
  const normalizedProduct = normalizeProductProperties(productProps);
  validateRequiredProperties(normalizedProduct, ['product_id']);

  return {
    name: ECOMMERCE_EVENTS.BACK_IN_STOCK_REQUESTED,
    category: 'ecommerce',
    requiredProperties: ['product_id'],
    properties: cleanProperties({
      ...normalizedProduct,
      action_type: 'back_in_stock',
      notification_method,
    }),
  };
}