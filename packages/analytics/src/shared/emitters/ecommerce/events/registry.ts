/**
 * Universal registry events for gift registries, wishlists, and similar features
 * Uses action-based patterns for efficient tracking
 */

import {
  ECOMMERCE_EVENTS,
  type EcommerceEventSpec,
  type RegistryItemProperties,
  type RegistryProperties,
} from '../types';
import { cleanProperties, normalizeProductProperties, validateRequiredProperties } from '../utils';

/**
 * Track registry management actions (create, update, delete)
 */
export function registryManaged(
  properties: RegistryProperties & {
    action: 'created' | 'updated' | 'deleted';
    updated_fields?: string[];
  },
): EcommerceEventSpec {
  validateRequiredProperties(properties, ['registry_id', 'action']);

  return {
    name: ECOMMERCE_EVENTS.REGISTRY_MANAGED,
    category: 'ecommerce',
    properties: cleanProperties(properties),
    requiredProperties: ['registry_id', 'action'],
  };
}

/**
 * Track when someone views a registry
 */
export function registryViewed(
  properties: RegistryProperties & {
    viewer_id?: string;
    viewer_relationship?: 'owner' | 'co_owner' | 'friend' | 'family' | 'other';
    items_count?: number;
    items_fulfilled?: number;
  },
): EcommerceEventSpec {
  validateRequiredProperties(properties, ['registry_id']);

  return {
    name: ECOMMERCE_EVENTS.REGISTRY_VIEWED,
    category: 'ecommerce',
    properties: cleanProperties(properties),
    requiredProperties: ['registry_id'],
  };
}

/**
 * Track when a registry is shared
 */
export function registryShared(
  properties: RegistryProperties & {
    share_method: 'email' | 'social' | 'link' | 'qr_code' | 'other';
    recipients_count?: number;
    message?: string;
  },
): EcommerceEventSpec {
  validateRequiredProperties(properties, ['registry_id', 'share_method']);

  return {
    name: ECOMMERCE_EVENTS.REGISTRY_SHARED,
    category: 'ecommerce',
    properties: cleanProperties(properties),
    requiredProperties: ['registry_id', 'share_method'],
  };
}

/**
 * Track registry item management (add, remove, update, purchase)
 */
export function registryItemManaged(
  properties: RegistryItemProperties & {
    action: 'added' | 'removed' | 'updated' | 'purchased';
    purchaser_id?: string;
    purchaser_name?: string;
    purchase_quantity?: number;
    purchase_message?: string;
    gift_wrap?: boolean;
    anonymous_gift?: boolean;
    updated_fields?: string[];
  },
): EcommerceEventSpec {
  const {
    purchaser_id,
    registry_id,
    purchaser_name,
    action,
    anonymous_gift,
    gift_wrap,
    purchase_message,
    purchase_quantity,
    updated_fields,
    ...productProps
  } = properties;

  const normalizedProduct = normalizeProductProperties(productProps);
  validateRequiredProperties(properties, ['registry_id', 'product_id', 'action']);

  return {
    name: ECOMMERCE_EVENTS.REGISTRY_ITEM_MANAGED,
    category: 'ecommerce',
    properties: cleanProperties({
      purchaser_id,
      registry_id,
      purchaser_name,
      action,
      anonymous_gift,
      gift_wrap,
      purchase_message,
      purchase_quantity,
      updated_fields,
      ...normalizedProduct,
    }),
    requiredProperties: ['registry_id', 'product_id', 'action'],
  };
}
