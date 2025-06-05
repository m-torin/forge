/**
 * Product-related ecommerce events
 */

import { trackEcommerce } from '../track-ecommerce';
import {
  type BaseProductProperties,
  ECOMMERCE_EVENTS,
  type EcommerceEventSpec,
  type ProductComparisonProperties,
  type ProductListProperties,
  type RecommendationProperties,
  type SearchResultsProperties,
} from '../types';
import {
  cleanProperties,
  normalizeProductProperties,
  normalizeProducts,
  validateRequiredProperties,
} from '../utils';

import type { EmitterOptions, EmitterTrackPayload } from '../../emitter-types';

/**
 * Track when a user searches for products
 */
export function productSearched(
  properties: { query: string },
  options?: EmitterOptions,
): EmitterTrackPayload {
  validateRequiredProperties(properties, ['query']);

  const eventSpec: EcommerceEventSpec = {
    name: ECOMMERCE_EVENTS.PRODUCT_SEARCHED,
    category: 'ecommerce',
    properties: cleanProperties(properties),
    requiredProperties: ['query'],
  };

  return trackEcommerce(eventSpec, options);
}

/**
 * Track when search results are displayed
 */
export function searchResultsViewed(properties: SearchResultsProperties): EcommerceEventSpec {
  validateRequiredProperties(properties, ['query', 'results_count']);

  const normalizedProps = {
    ...properties,
    products: properties.products ? normalizeProducts(properties.products) : undefined,
  };

  return {
    name: ECOMMERCE_EVENTS.SEARCH_RESULTS_VIEWED,
    category: 'ecommerce',
    properties: cleanProperties(normalizedProps),
    requiredProperties: ['query', 'results_count'],
  };
}

/**
 * Track when a user views a product list or category
 */
export function productListViewed(
  properties: ProductListProperties,
): EcommerceEventSpec<ProductListProperties> {
  const normalizedProps: ProductListProperties = {
    list_id: properties.list_id,
    category: properties.category,
    products: properties.products ? normalizeProducts(properties.products) : undefined,
  };

  return {
    name: ECOMMERCE_EVENTS.PRODUCT_LIST_VIEWED,
    category: 'ecommerce',
    properties: cleanProperties(normalizedProps),
    requiredProperties: [],
  };
}

/**
 * Track when a user filters a product list
 */
export function productListFiltered(
  properties: ProductListProperties & { filters?: Record<string, any> },
): EcommerceEventSpec {
  const normalizedProps = {
    list_id: properties.list_id,
    category: properties.category,
    filters: properties.filters,
    products: properties.products ? normalizeProducts(properties.products) : undefined,
  };

  return {
    name: ECOMMERCE_EVENTS.PRODUCT_LIST_FILTERED,
    category: 'ecommerce',
    properties: cleanProperties(normalizedProps),
    requiredProperties: [],
  };
}

/**
 * Track when a user clicks on a product
 */
export function productClicked(properties: BaseProductProperties): EcommerceEventSpec {
  const normalizedProps = normalizeProductProperties(properties);
  validateRequiredProperties(normalizedProps, ['product_id']);

  return {
    name: ECOMMERCE_EVENTS.PRODUCT_CLICKED,
    category: 'ecommerce',
    properties: cleanProperties(normalizedProps),
    requiredProperties: ['product_id'],
  };
}

/**
 * Track when a user views a product detail page
 */
export function productViewed(
  properties: BaseProductProperties,
  options?: EmitterOptions,
): EmitterTrackPayload {
  const normalizedProps = normalizeProductProperties(properties);
  validateRequiredProperties(normalizedProps, ['product_id']);

  const eventSpec: EcommerceEventSpec = {
    name: ECOMMERCE_EVENTS.PRODUCT_VIEWED,
    category: 'ecommerce',
    properties: cleanProperties(normalizedProps),
    requiredProperties: ['product_id'],
  };

  return trackEcommerce(eventSpec, options);
}

/**
 * Track when a user compares products
 */
export function productCompared(properties: ProductComparisonProperties): EcommerceEventSpec {
  const { action, comparison_list, product } = properties;
  const normalizedProduct = normalizeProductProperties(product);
  validateRequiredProperties(normalizedProduct, ['product_id']);

  return {
    name: ECOMMERCE_EVENTS.PRODUCT_COMPARED,
    category: 'ecommerce',
    properties: cleanProperties({
      action,
      ...normalizedProduct,
      comparison_list: comparison_list ? normalizeProducts(comparison_list) : undefined,
    }),
    requiredProperties: ['product_id'],
  };
}

/**
 * Track when product recommendations are viewed
 */
export function productRecommendationViewed(
  properties: RecommendationProperties,
): EcommerceEventSpec {
  validateRequiredProperties(properties, ['recommendation_type', 'source']);

  const normalizedProps = {
    ...properties,
    products: normalizeProducts(properties.products),
  };

  return {
    name: ECOMMERCE_EVENTS.PRODUCT_RECOMMENDATION_VIEWED,
    category: 'ecommerce',
    properties: cleanProperties(normalizedProps),
    requiredProperties: ['recommendation_type', 'source'],
  };
}

/**
 * Track when a recommended product is clicked
 */
export function productRecommendationClicked(
  properties: BaseProductProperties & {
    recommendation_type: string;
    source: string;
    position?: number;
  },
): EcommerceEventSpec {
  const { recommendation_type, position, source, ...productProps } = properties;
  const normalizedProduct = normalizeProductProperties(productProps);
  validateRequiredProperties(normalizedProduct, ['product_id']);

  return {
    name: ECOMMERCE_EVENTS.PRODUCT_RECOMMENDATION_CLICKED,
    category: 'ecommerce',
    properties: cleanProperties({
      ...normalizedProduct,
      recommendation_type,
      position,
      source,
    }),
    requiredProperties: ['product_id'],
  };
}
