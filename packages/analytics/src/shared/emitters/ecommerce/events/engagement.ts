/**
 * Customer engagement events for ecommerce
 * Track user interactions that indicate interest but aren't direct purchases
 */

import { type BaseProductProperties, ECOMMERCE_EVENTS, type EcommerceEventSpec } from '../types';
import { cleanProperties, normalizeProductProperties, validateRequiredProperties } from '../utils';

/**
 * Track when a user sets a price alert for a product
 */
export function priceAlertSet(
  properties: BaseProductProperties & {
    threshold_price: number;
    notification_method?: 'email' | 'sms' | 'push';
    currency?: string;
  },
): EcommerceEventSpec {
  const { currency, notification_method, threshold_price, ...productProps } = properties;
  const normalizedProduct = normalizeProductProperties(productProps);
  validateRequiredProperties(normalizedProduct, ['product_id']);
  validateRequiredProperties({ threshold_price }, ['threshold_price']);

  return {
    name: ECOMMERCE_EVENTS.PRICE_ALERT_SET,
    category: 'ecommerce',
    properties: cleanProperties({
      ...normalizedProduct,
      action_type: 'price_alert',
      currency,
      notification_method,
      threshold_price,
    }),
    requiredProperties: ['product_id', 'threshold_price'],
  };
}

/**
 * Track when a user requests notification for out-of-stock items
 */
export function backInStockRequested(
  properties: BaseProductProperties & {
    notification_method?: 'email' | 'sms' | 'push';
  },
): EcommerceEventSpec {
  const { notification_method, ...productProps } = properties;
  const normalizedProduct = normalizeProductProperties(productProps);
  validateRequiredProperties(normalizedProduct, ['product_id']);

  return {
    name: ECOMMERCE_EVENTS.BACK_IN_STOCK_REQUESTED,
    category: 'ecommerce',
    properties: cleanProperties({
      ...normalizedProduct,
      action_type: 'back_in_stock',
      notification_method,
    }),
    requiredProperties: ['product_id'],
  };
}
