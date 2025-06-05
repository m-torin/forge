/**
 * Marketplace and affiliate-specific ecommerce events
 * These events track user interactions unique to marketplace/affiliate models
 */

import { type BaseProductProperties, ECOMMERCE_EVENTS, type EcommerceEventSpec } from '../types';
import { cleanProperties, normalizeProductProperties, validateRequiredProperties } from '../utils';

/**
 * Track when a user views price comparisons across multiple merchants
 */
export function priceComparisonViewed(properties: {
  product_id: string;
  merchants: {
    merchant_id: string;
    merchant_name: string;
    price: number;
    shipping?: number;
    total_price?: number;
    availability?: string;
    rating?: number;
  }[];
  lowest_price?: number;
  highest_price?: number;
  average_price?: number;
}): EcommerceEventSpec {
  validateRequiredProperties(properties, ['product_id', 'merchants']);

  return {
    name: ECOMMERCE_EVENTS.PRICE_COMPARISON_VIEWED,
    category: 'ecommerce',
    properties: cleanProperties(properties),
    requiredProperties: ['product_id', 'merchants'],
  };
}

/**
 * Track when a user selects a specific merchant from multiple options
 */
export function merchantSelected(
  properties: BaseProductProperties & {
    selected_merchant_id: string;
    selected_merchant_name: string;
    selection_reason?: 'lowest_price' | 'fastest_shipping' | 'best_rating' | 'in_stock' | 'other';
    compared_merchants?: string[];
  },
): EcommerceEventSpec {
  const normalizedProps = normalizeProductProperties(properties);
  validateRequiredProperties(properties, ['product_id', 'selected_merchant_id']);

  return {
    name: ECOMMERCE_EVENTS.MERCHANT_SELECTED,
    category: 'ecommerce',
    properties: cleanProperties({
      ...normalizedProps,
      selected_merchant_id: properties.selected_merchant_id,
      selected_merchant_name: properties.selected_merchant_name,
      compared_merchants: properties.compared_merchants,
      selection_reason: properties.selection_reason,
    }),
    requiredProperties: ['product_id', 'selected_merchant_id'],
  };
}

/**
 * Track when a user clicks an affiliate link to visit merchant site
 */
export function affiliateLinkClicked(
  properties: BaseProductProperties & {
    destination_url: string;
    affiliate_network?: string;
    commission_rate?: number;
    tracking_code?: string;
    deep_link?: boolean;
  },
): EcommerceEventSpec {
  const normalizedProps = normalizeProductProperties(properties);
  validateRequiredProperties(properties, ['product_id', 'destination_url']);

  return {
    name: ECOMMERCE_EVENTS.AFFILIATE_LINK_CLICKED,
    category: 'ecommerce',
    properties: cleanProperties({
      ...normalizedProps,
      destination_url: properties.destination_url,
      deep_link: properties.deep_link,
      tracking_code: properties.tracking_code,
    }),
    requiredProperties: ['product_id', 'destination_url'],
  };
}

/**
 * Track when an affiliate conversion is confirmed
 * This is typically fired via webhook or after confirmation from affiliate network
 */
export function affiliateConversionTracked(properties: {
  product_id: string;
  order_id: string;
  merchant_id: string;
  merchant_name?: string;
  affiliate_network?: string;
  commission_amount?: number;
  commission_rate?: number;
  conversion_value?: number;
  currency?: string;
  conversion_type?: 'sale' | 'lead' | 'click' | 'other';
  tracking_code?: string;
}): EcommerceEventSpec {
  validateRequiredProperties(properties, ['product_id', 'order_id', 'merchant_id']);

  return {
    name: ECOMMERCE_EVENTS.AFFILIATE_CONVERSION_TRACKED,
    category: 'ecommerce',
    properties: cleanProperties(properties),
    requiredProperties: ['product_id', 'order_id', 'merchant_id'],
  };
}
