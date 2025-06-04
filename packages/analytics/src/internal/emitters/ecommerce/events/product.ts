/**
 * Product-related ecommerce events
 */

import { 
  ECOMMERCE_EVENTS, 
  type BaseProductProperties, 
  type ProductListProperties, 
  type SearchResultsProperties,
  type ProductComparisonProperties,
  type RecommendationProperties,
  type EngagementProperties,
  type EcommerceEventSpec 
} from '../types';
import { normalizeProductProperties, normalizeProducts, cleanProperties, createEcommerceContext, validateRequiredProperties } from '../utils';

/**
 * Track when a user searches for products
 */
export function productSearched(properties: { query: string }): EcommerceEventSpec {
  validateRequiredProperties(properties, ['query']);

  return {
    name: ECOMMERCE_EVENTS.PRODUCT_SEARCHED,
    category: 'ecommerce',
    requiredProperties: ['query'],
    properties: cleanProperties(properties),
  };
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
    requiredProperties: ['query', 'results_count'],
    properties: cleanProperties(normalizedProps),
  };
}

/**
 * Track when a user views a product list or category
 */
export function productListViewed(properties: ProductListProperties): EcommerceEventSpec<ProductListProperties> {
  const normalizedProps: ProductListProperties = {
    list_id: properties.list_id,
    category: properties.category,
    products: properties.products ? normalizeProducts(properties.products) : undefined,
  };

  return {
    name: ECOMMERCE_EVENTS.PRODUCT_LIST_VIEWED,
    category: 'ecommerce',
    requiredProperties: [],
    properties: cleanProperties(normalizedProps),
  };
}

/**
 * Track when a user filters a product list
 */
export function productListFiltered(properties: ProductListProperties & { filters?: Record<string, any> }): EcommerceEventSpec {
  const normalizedProps = {
    list_id: properties.list_id,
    category: properties.category,
    products: properties.products ? normalizeProducts(properties.products) : undefined,
    filters: properties.filters,
  };

  return {
    name: ECOMMERCE_EVENTS.PRODUCT_LIST_FILTERED,
    category: 'ecommerce',
    requiredProperties: [],
    properties: cleanProperties(normalizedProps),
  };
}

/**
 * Track when a user clicks on a product
 */
export function productClicked(properties: BaseProductProperties): EcommerceEventSpec<BaseProductProperties> {
  const normalizedProps = normalizeProductProperties(properties);
  validateRequiredProperties(normalizedProps, ['product_id']);

  return {
    name: ECOMMERCE_EVENTS.PRODUCT_CLICKED,
    category: 'ecommerce',
    requiredProperties: ['product_id'],
    properties: cleanProperties(normalizedProps),
  };
}

/**
 * Track when a user views a product detail page
 */
export function productViewed(properties: BaseProductProperties): EcommerceEventSpec<BaseProductProperties> {
  const normalizedProps = normalizeProductProperties(properties);
  validateRequiredProperties(normalizedProps, ['product_id']);

  return {
    name: ECOMMERCE_EVENTS.PRODUCT_VIEWED,
    category: 'ecommerce',
    requiredProperties: ['product_id'],
    properties: cleanProperties(normalizedProps),
  };
}

/**
 * Track when a user compares products
 */
export function productCompared(properties: ProductComparisonProperties): EcommerceEventSpec {
  const { action, product, comparison_list } = properties;
  const normalizedProduct = normalizeProductProperties(product);
  validateRequiredProperties(normalizedProduct, ['product_id']);

  return {
    name: ECOMMERCE_EVENTS.PRODUCT_COMPARED,
    category: 'ecommerce',
    requiredProperties: ['product_id'],
    properties: cleanProperties({
      action,
      ...normalizedProduct,
      comparison_list: comparison_list ? normalizeProducts(comparison_list) : undefined,
    }),
  };
}

/**
 * Track when product recommendations are viewed
 */
export function productRecommendationViewed(properties: RecommendationProperties): EcommerceEventSpec {
  validateRequiredProperties(properties, ['recommendation_type', 'source']);

  const normalizedProps = {
    ...properties,
    products: normalizeProducts(properties.products),
  };

  return {
    name: ECOMMERCE_EVENTS.PRODUCT_RECOMMENDATION_VIEWED,
    category: 'ecommerce',
    requiredProperties: ['recommendation_type', 'source'],
    properties: cleanProperties(normalizedProps),
  };
}

/**
 * Track when a recommended product is clicked
 */
export function productRecommendationClicked(properties: BaseProductProperties & {
  recommendation_type: string;
  source: string;
  position?: number;
}): EcommerceEventSpec {
  const { recommendation_type, source, position, ...productProps } = properties;
  const normalizedProduct = normalizeProductProperties(productProps);
  validateRequiredProperties(normalizedProduct, ['product_id']);

  return {
    name: ECOMMERCE_EVENTS.PRODUCT_RECOMMENDATION_CLICKED,
    category: 'ecommerce',
    requiredProperties: ['product_id'],
    properties: cleanProperties({
      ...normalizedProduct,
      recommendation_type,
      source,
      position,
    }),
  };
}