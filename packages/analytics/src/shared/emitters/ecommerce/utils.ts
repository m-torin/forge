/**
 * Utilities for normalizing and validating ecommerce event properties
 */

import type { BaseProductProperties, EcommerceEventProperties } from './types';

/**
 * Normalizes product properties to ensure consistent naming
 * Handles common variations like productId vs product_id
 */
export function normalizeProductProperties(product: any): BaseProductProperties {
  if (!product) {
    throw new Error('Product properties are required');
  }

  // Normalize product ID (required) - using ES2022 nullish coalescing
  const product_id = product.product_id ?? product.productId ?? product.id;
  if (!product_id) {
    throw new Error('Product must have an id (product_id, productId, or id)');
  }

  const normalized = {
    product_id,
    name: product.name ?? product.title ?? product.productName,
    image_url: product.image_url ?? product.imageUrl ?? product.image,
    url: product.url ?? product.link ?? product.product_url,
    brand: product.brand ?? product.manufacturer,
    category: product.category,
    coupon: product.coupon ?? product.couponCode ?? product.coupon_code,
    position: normalizePosition(product.position),
    price: normalizePrice(product.price),
    quantity: normalizeQuantity(product.quantity),
    variant: product.variant ?? product.variation,
  };

  // Remove undefined and null values - using ES2022 Object.hasOwn
  const result: BaseProductProperties = { product_id };
  Object.entries(normalized).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      Object.hasOwn(normalized, key) &&
      key !== 'product_id'
    ) {
      (result as any)[key] = value;
    }
  });

  return result;
}

/**
 * Normalizes an array of products
 */
export function normalizeProducts(products: any[]): BaseProductProperties[] {
  if (!Array.isArray(products)) {
    return [];
  }
  return products.map(normalizeProductProperties);
}

/**
 * ES2022 enhanced product validation with Error.cause
 */
export function validateProductWithContext(product: any, context?: string): void {
  try {
    normalizeProductProperties(product);
  } catch (error) {
    throw new Error(`Product validation failed${context ? ` in ${context}` : ''}`, {
      cause: error,
    });
  }
}

/**
 * Normalizes price to a number
 */
function normalizePrice(price: any): number | undefined {
  if (price === undefined || price === null) {
    return undefined;
  }
  const normalized = typeof price === 'string' ? parseFloat(price) : Number(price);
  return isNaN(normalized) ? undefined : normalized;
}

/**
 * Normalizes quantity to a positive integer
 */
function normalizeQuantity(quantity: any): number | undefined {
  if (quantity === undefined || quantity === null) {
    return undefined;
  }
  const normalized = parseInt(String(quantity), 10);
  return isNaN(normalized) || normalized < 0 ? undefined : normalized;
}

/**
 * Normalizes position to a positive integer
 */
function normalizePosition(position: any): number | undefined {
  if (position === undefined || position === null) {
    return undefined;
  }
  const normalized = parseInt(String(position), 10);
  return isNaN(normalized) || normalized < 0 ? undefined : normalized;
}

/**
 * Validates required properties for an event
 */
export function validateRequiredProperties<T extends Record<string, any>>(
  properties: T,
  required: (keyof T)[],
): void {
  const missing = required.filter(prop => {
    const value = properties[prop];
    return value === undefined || value === null || value === '';
  });
  if (missing.length > 0) {
    throw new Error(`Missing required properties: ${missing.join(', ')}`);
  }
}

/**
 * Removes undefined values from an object
 */
export function cleanProperties<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key as keyof T] = value;
    }
  }
  return cleaned;
}

/**
 * Merges common fields with event-specific properties
 */
export function mergeEventProperties(
  specific: EcommerceEventProperties,
  common?: Record<string, any>,
): EcommerceEventProperties {
  return {
    ...common,
    ...specific,
  };
}

/**
 * Validates currency code (ISO 4217)
 */
export function validateCurrency(currency?: string): string | undefined {
  if (!currency || typeof currency !== 'string') return undefined;

  // Basic validation - should be 3 uppercase letters
  const normalized = currency.toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    // Invalid currency code - return undefined
    return undefined;
  }

  return normalized;
}

/**
 * Creates a consistent context object for ecommerce events
 */
export function createEcommerceContext(additionalContext?: Record<string, any>) {
  return {
    ...additionalContext,
    category: 'ecommerce',
  };
}
