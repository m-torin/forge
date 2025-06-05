/**
 * Universal registry events for gift registries, wishlists, and similar features
 * Uses action-based patterns for efficient tracking
 */

import { ECOMMERCE_EVENTS, type RegistryProperties, type RegistryItemProperties, type EcommerceEventSpec } from '../types';
import { normalizeProductProperties, cleanProperties, validateRequiredProperties } from '../utils';

/**
 * Track registry management actions (create, update, delete)
 */
export function registryManaged(properties: RegistryProperties & {
  action: 'created' | 'updated' | 'deleted';
  updated_fields?: string[];
}): EcommerceEventSpec {
  validateRequiredProperties(properties, ['registry_id', 'action']);

  return {
    name: ECOMMERCE_EVENTS.REGISTRY_MANAGED,
    category: 'ecommerce',
    requiredProperties: ['registry_id', 'action'],
    properties: cleanProperties(properties),
  };
}

/**
 * Track when someone views a registry
 */
export function registryViewed(properties: RegistryProperties & {
  viewer_id?: string;
  viewer_relationship?: 'owner' | 'co_owner' | 'friend' | 'family' | 'other';
  items_count?: number;
  items_fulfilled?: number;
}): EcommerceEventSpec {
  validateRequiredProperties(properties, ['registry_id']);

  return {
    name: ECOMMERCE_EVENTS.REGISTRY_VIEWED,
    category: 'ecommerce',
    requiredProperties: ['registry_id'],
    properties: cleanProperties(properties),
  };
}

/**
 * Track when a registry is shared
 */
export function registryShared(properties: RegistryProperties & {
  share_method: 'email' | 'social' | 'link' | 'qr_code' | 'other';
  recipients_count?: number;
  message?: string;
}): EcommerceEventSpec {
  validateRequiredProperties(properties, ['registry_id', 'share_method']);

  return {
    name: ECOMMERCE_EVENTS.REGISTRY_SHARED,
    category: 'ecommerce',
    requiredProperties: ['registry_id', 'share_method'],
    properties: cleanProperties(properties),
  };
}

/**
 * Track registry item management (add, remove, update, purchase)
 */
export function registryItemManaged(properties: RegistryItemProperties & {
  action: 'added' | 'removed' | 'updated' | 'purchased';
  purchaser_id?: string;
  purchaser_name?: string;
  purchase_quantity?: number;
  purchase_message?: string;
  gift_wrap?: boolean;
  anonymous_gift?: boolean;
  updated_fields?: string[];
}): EcommerceEventSpec {
  const { 
    registry_id, 
    action,
    purchaser_id,
    purchaser_name,
    purchase_quantity,
    purchase_message,
    gift_wrap,
    anonymous_gift,
    updated_fields,
    ...productProps 
  } = properties;
  
  const normalizedProduct = normalizeProductProperties(productProps);
  validateRequiredProperties(properties, ['registry_id', 'product_id', 'action']);

  return {
    name: ECOMMERCE_EVENTS.REGISTRY_ITEM_MANAGED,
    category: 'ecommerce',
    requiredProperties: ['registry_id', 'product_id', 'action'],
    properties: cleanProperties({
      registry_id,
      action,
      purchaser_id,
      purchaser_name,
      purchase_quantity,
      purchase_message,
      gift_wrap,
      anonymous_gift,
      updated_fields,
      ...normalizedProduct,
    }),
  };
}