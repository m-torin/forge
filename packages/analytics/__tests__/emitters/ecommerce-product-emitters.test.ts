import { beforeEach, describe, expect, vi } from 'vitest';

import {
  productClicked,
  productCompared,
  productListFiltered,
  productListViewed,
  productRecommendationClicked,
  productRecommendationViewed,
  productSearched,
  productViewed,
  searchResultsViewed,
} from '@/shared/emitters/ecommerce/events/product';
import { ECOMMERCE_EVENTS } from '@/shared/emitters/ecommerce/types';

import type {
  BaseProductProperties,
  ProductComparisonProperties,
  ProductListProperties,
  RecommendationProperties,
  SearchResultsProperties,
} from '@/shared/emitters/ecommerce/types';
import type { EmitterOptions } from '@/shared/emitters/emitter-types';

// Mock the trackEcommerce function
vi.mock('../../shared/emitters/ecommerce/track-ecommerce', () => ({
  trackEcommerce: vi.fn((eventSpec, options) => ({
    type: 'track' as const,
    event: eventSpec.name,
    properties: eventSpec.properties,
    ...(options?.timestamp && { timestamp: options.timestamp }),
    ...(options?.context && { context: options.context }),
  })),
}));

describe('product Emitters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('productSearched', () => {
    test('should create a valid product search event', () => {
      const properties = { query: 'running shoes' };
      const result = productSearched(properties);

      expect(result).toStrictEqual({
        type: 'track',
        event: ECOMMERCE_EVENTS.PRODUCT_SEARCHED,
        context: {
          traits: {
            event_category: 'ecommerce',
          },
        },
        properties: { query: 'running shoes' },
      });
    });

    test('should accept emitter options', () => {
      const properties = { query: 'laptops' };
      const options = {
        context: { traits: { userId: 'user123' } },
        timestamp: new Date(),
      };
      const result = productSearched(properties, options);

      expect(result.timestamp).toBe(options.timestamp);
      expect(result.context?.traits?.userId).toBe('user123');
    });

    test('should throw error when query is missing', () => {
      expect(() => {
        productSearched({} as any);
      }).toThrow('Missing required properties: query');
    });

    test('should handle empty query string', () => {
      expect(() => {
        productSearched({ query: '' });
      }).toThrow('Missing required properties: query');
    });

    test('should clean undefined properties', () => {
      const properties = {
        extraProp: undefined as any,
        query: 'test',
      };
      const result = productSearched(properties);

      expect(result.properties).toStrictEqual({ query: 'test' });
      expect(result.properties).not.toHaveProperty('extraProp');
    });
  });

  describe('searchResultsViewed', () => {
    test('should create a valid search results viewed event', () => {
      const properties: SearchResultsProperties = {
        filters_applied: { brand: 'Apple', price_range: '500-1000' },
        query: 'smartphones',
        results_count: 25,
        sort_order: 'price_asc',
      };

      const result = searchResultsViewed(properties);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.SEARCH_RESULTS_VIEWED,
        category: 'ecommerce',
        properties: {
          filters_applied: { brand: 'Apple', price_range: '500-1000' },
          query: 'smartphones',
          results_count: 25,
          sort_order: 'price_asc',
        },
        requiredProperties: ['query', 'results_count'],
      });
    });

    test('should normalize products when provided', () => {
      const properties: SearchResultsProperties = {
        products: [
          { product_id: 'p1', name: 'Product 1', price: '99.99' },
          { price: 149.99, productId: 'p2', title: 'Product 2' },
        ] as any,
        query: 'test',
        results_count: 2,
      };

      const result = searchResultsViewed(properties);

      expect(result.properties.products).toStrictEqual([
        { product_id: 'p1', name: 'Product 1', price: 99.99 },
        { product_id: 'p2', name: 'Product 2', price: 149.99 },
      ]);
    });

    test('should throw error when required properties are missing', () => {
      expect(() => {
        searchResultsViewed({ query: 'test' } as any);
      }).toThrow('Missing required properties: results_count');

      expect(() => {
        searchResultsViewed({ results_count: 10 } as any);
      }).toThrow('Missing required properties: query');
    });

    test('should handle zero results', () => {
      const properties: SearchResultsProperties = {
        query: 'nonexistent product',
        results_count: 0,
      };

      const result = searchResultsViewed(properties);
      expect(result.properties.results_count).toBe(0);
    });
  });

  describe('productListViewed', () => {
    test('should create a valid product list viewed event', () => {
      const properties: ProductListProperties = {
        list_id: 'category_electronics',
        category: 'Electronics',
      };

      const result = productListViewed(properties);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.PRODUCT_LIST_VIEWED,
        category: 'ecommerce',
        properties: {
          list_id: 'category_electronics',
          category: 'Electronics',
        },
        requiredProperties: [],
      });
    });

    test('should normalize products when provided', () => {
      const mockProducts = [
        { product_id: 'p1', name: 'Product 1' },
        { productId: 'p2', title: 'Product 2' },
      ];

      const properties: ProductListProperties = {
        list_id: 'featured',
        products: mockProducts as any,
      };

      const result = productListViewed(properties);

      expect(result.properties.products).toStrictEqual([
        { product_id: 'p1', name: 'Product 1' },
        { product_id: 'p2', name: 'Product 2' },
      ]);
    });

    test('should work with minimal properties', () => {
      const properties: ProductListProperties = {};
      const result = productListViewed(properties);

      expect(result.properties).toStrictEqual({});
      expect(result.requiredProperties).toStrictEqual([]);
    });

    test('should clean undefined properties', () => {
      const properties: ProductListProperties = {
        list_id: 'test',
        category: undefined,
        products: undefined,
      };

      const result = productListViewed(properties);
      expect(result.properties).toStrictEqual({ list_id: 'test' });
    });
  });

  describe('productListFiltered', () => {
    test('should create a valid product list filtered event', () => {
      const properties = {
        list_id: 'category_shoes',
        category: 'Shoes',
        filters: { brand: 'Nike', color: 'black', size: '10' },
      };

      const result = productListFiltered(properties);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.PRODUCT_LIST_FILTERED,
        category: 'ecommerce',
        properties: {
          list_id: 'category_shoes',
          category: 'Shoes',
          filters: { brand: 'Nike', color: 'black', size: '10' },
        },
        requiredProperties: [],
      });
    });

    test('should handle complex filter objects', () => {
      const properties = {
        filters: {
          availability: 'in_stock',
          price: { max: 200, min: 50 },
          ratings: [4, 5],
        },
      };

      const result = productListFiltered(properties);
      expect(result.properties.filters).toStrictEqual(properties.filters);
    });

    test('should normalize products when provided', () => {
      const properties = {
        category: 'Electronics',
        filters: { brand: 'Apple' },
        products: [{ productId: 'p1', title: 'Product 1' }] as any,
      };

      const result = productListFiltered(properties);
      expect(result.properties.products).toStrictEqual([{ product_id: 'p1', name: 'Product 1' }]);
    });
  });

  describe('productClicked', () => {
    test('should create a valid product clicked event', () => {
      const properties: BaseProductProperties = {
        product_id: 'prod123',
        name: 'Wireless Headphones',
        category: 'Electronics',
        position: 3,
        price: 199.99,
      };

      const result = productClicked(properties);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.PRODUCT_CLICKED,
        category: 'ecommerce',
        properties: {
          product_id: 'prod123',
          name: 'Wireless Headphones',
          category: 'Electronics',
          position: 3,
          price: 199.99,
        },
        requiredProperties: ['product_id'],
      });
    });

    test('should normalize product properties', () => {
      const properties = {
        manufacturer: 'Brand X', // Should normalize to brand
        price: '299.99', // Should normalize to number
        productId: 'p456', // Should normalize to product_id
        title: 'Product Title', // Should normalize to name
      } as any;

      const result = productClicked(properties);

      expect(result.properties).toStrictEqual({
        product_id: 'p456',
        name: 'Product Title',
        brand: 'Brand X',
        price: 299.99,
      });
    });

    test('should throw error when product_id is missing', () => {
      expect(() => {
        productClicked({ name: 'Product' } as any);
      }).toThrow('Product must have an id');
    });

    test('should accept various product ID field names', () => {
      const testCases = [{ product_id: 'p1' }, { productId: 'p2' }, { id: 'p3' }];

      testCases.forEach((properties, index) => {
        const result = productClicked(properties as any);
        expect(result.properties.product_id).toBe(`p${index + 1}`);
      });
    });

    test('should clean undefined properties', () => {
      const properties: BaseProductProperties = {
        product_id: 'p1',
        name: 'Product',
        category: undefined,
        price: undefined,
      };

      const result = productClicked(properties);
      expect(result.properties).toStrictEqual({
        product_id: 'p1',
        name: 'Product',
      });
    });
  });

  describe('productViewed', () => {
    test('should create a valid product viewed event', () => {
      const properties: BaseProductProperties = {
        product_id: 'prod789',
        name: 'Gaming Laptop',
        brand: 'TechBrand',
        category: 'Computers',
        price: 1299.99,
      };

      const result = productViewed(properties);

      expect(result).toStrictEqual({
        type: 'track',
        event: ECOMMERCE_EVENTS.PRODUCT_VIEWED,
        context: {
          traits: {
            event_category: 'ecommerce',
          },
        },
        properties: {
          product_id: 'prod789',
          name: 'Gaming Laptop',
          brand: 'TechBrand',
          category: 'Computers',
          price: 1299.99,
        },
      });
    });

    test('should accept emitter options', () => {
      const properties: BaseProductProperties = { product_id: 'p1' };
      const options: EmitterOptions = { context: { traits: { userId: 'user456' } } };

      const result = productViewed(properties, options);
      expect(result.context?.traits?.userId).toBe('user456');
    });

    test('should throw error when product_id is missing', () => {
      expect(() => {
        productViewed({ name: 'Product' } as any);
      }).toThrow('Product must have an id');
    });

    test('should normalize all product properties', () => {
      const properties = {
        couponCode: 'SAVE10',
        imageUrl: 'https://example.com/image.jpg',
        link: 'https://example.com/product',
        manufacturer: 'Brand',
        price: '99.99',
        productId: 'p1',
        quantity: '2',
        title: 'Product Title',
        variation: 'size-large',
      } as any;

      const result = productViewed(properties);

      expect(result.properties).toStrictEqual({
        product_id: 'p1',
        name: 'Product Title',
        image_url: 'https://example.com/image.jpg',
        url: 'https://example.com/product',
        brand: 'Brand',
        coupon: 'SAVE10',
        price: 99.99,
        quantity: 2,
        variant: 'size-large',
      });
    });
  });

  describe('productCompared', () => {
    const baseProduct: BaseProductProperties = {
      product_id: 'p1',
      name: 'Product 1',
      price: 99.99,
    };

    test('should create a valid product comparison event for adding', () => {
      const properties: ProductComparisonProperties = {
        action: 'added',
        product: baseProduct,
      };

      const result = productCompared(properties);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.PRODUCT_COMPARED,
        category: 'ecommerce',
        properties: {
          product_id: 'p1',
          name: 'Product 1',
          action: 'added',
          price: 99.99,
        },
        requiredProperties: ['product_id'],
      });
    });

    test('should create a valid product comparison event for viewing', () => {
      const comparisonList = [
        { product_id: 'p2', name: 'Product 2' },
        { product_id: 'p3', name: 'Product 3' },
      ];

      const properties: ProductComparisonProperties = {
        action: 'viewed',
        comparison_list: comparisonList,
        product: baseProduct,
      };

      const result = productCompared(properties);

      expect(result.properties).toStrictEqual({
        product_id: 'p1',
        name: 'Product 1',
        action: 'viewed',
        comparison_list: [
          { product_id: 'p2', name: 'Product 2' },
          { product_id: 'p3', name: 'Product 3' },
        ],
        price: 99.99,
      });
    });

    test('should normalize the main product and comparison list', () => {
      const properties: ProductComparisonProperties = {
        action: 'removed',
        comparison_list: [{ productId: 'p2', title: 'Compare Product' }] as any,
        product: { productId: 'p1', title: 'Main Product' } as any,
      };

      const result = productCompared(properties);

      expect(result.properties).toStrictEqual({
        product_id: 'p1',
        name: 'Main Product',
        action: 'removed',
        comparison_list: [{ product_id: 'p2', name: 'Compare Product' }],
      });
    });

    test('should throw error when product lacks ID', () => {
      expect(() => {
        productCompared({
          action: 'added',
          product: { name: 'Product' } as any,
        });
      }).toThrow('Product must have an id');
    });

    test('should handle empty comparison list', () => {
      const properties: ProductComparisonProperties = {
        action: 'viewed',
        comparison_list: [],
        product: baseProduct,
      };

      const result = productCompared(properties);
      expect(result.properties.comparison_list).toStrictEqual([]);
    });
  });

  describe('productRecommendationViewed', () => {
    const baseRecommendation: RecommendationProperties = {
      recommendation_type: 'similar',
      products: [
        { product_id: 'r1', name: 'Recommended 1' },
        { product_id: 'r2', name: 'Recommended 2' },
      ],
      source: 'product_page',
    };

    test('should create a valid recommendation viewed event', () => {
      const result = productRecommendationViewed(baseRecommendation);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.PRODUCT_RECOMMENDATION_VIEWED,
        category: 'ecommerce',
        properties: {
          recommendation_type: 'similar',
          products: [
            { product_id: 'r1', name: 'Recommended 1' },
            { product_id: 'r2', name: 'Recommended 2' },
          ],
          source: 'product_page',
        },
        requiredProperties: ['recommendation_type', 'source'],
      });
    });

    test('should handle different recommendation types', () => {
      const types = ['frequently_bought', 'trending', 'personalized', 'upsell', 'cross_sell'];

      types.forEach(type => {
        const properties: RecommendationProperties = {
          recommendation_type: type as any,
          products: [{ product_id: 'p1' }],
          source: 'cart',
        };

        const result = productRecommendationViewed(properties);
        expect(result.properties.recommendation_type).toBe(type);
      });
    });

    test('should include optional algorithm information', () => {
      const properties: RecommendationProperties = {
        ...baseRecommendation,
        algorithm: 'collaborative_filtering_v2',
      };

      const result = productRecommendationViewed(properties);
      expect(result.properties.algorithm).toBe('collaborative_filtering_v2');
    });

    test('should normalize recommended products', () => {
      const properties: RecommendationProperties = {
        recommendation_type: 'upsell',
        products: [
          { price: '199.99', productId: 'p1', title: 'Product 1' },
          { id: 'p2', name: 'Product 2', price: 299.99 },
        ] as any,
        source: 'checkout',
      };

      const result = productRecommendationViewed(properties);

      expect(result.properties.products).toStrictEqual([
        { product_id: 'p1', name: 'Product 1', price: 199.99 },
        { product_id: 'p2', name: 'Product 2', price: 299.99 },
      ]);
    });

    test('should throw error when required properties are missing', () => {
      expect(() => {
        productRecommendationViewed({
          products: [],
          source: 'product_page',
        } as any);
      }).toThrow('Missing required properties: recommendation_type');

      expect(() => {
        productRecommendationViewed({
          recommendation_type: 'similar',
          products: [],
        } as any);
      }).toThrow('Missing required properties: source');
    });

    test('should handle empty products array', () => {
      const properties: RecommendationProperties = {
        recommendation_type: 'similar',
        products: [],
        source: 'product_page',
      };

      const result = productRecommendationViewed(properties);
      expect(result.properties.products).toStrictEqual([]);
    });
  });

  describe('productRecommendationClicked', () => {
    const baseProperties = {
      product_id: 'r1',
      name: 'Recommended Product',
      recommendation_type: 'similar',
      source: 'product_page',
    };

    test('should create a valid recommendation clicked event', () => {
      const result = productRecommendationClicked(baseProperties);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.PRODUCT_RECOMMENDATION_CLICKED,
        category: 'ecommerce',
        properties: {
          product_id: 'r1',
          name: 'Recommended Product',
          recommendation_type: 'similar',
          source: 'product_page',
        },
        requiredProperties: ['product_id'],
      });
    });

    test('should include position when provided', () => {
      const properties = {
        ...baseProperties,
        position: 2,
      };

      const result = productRecommendationClicked(properties);
      expect(result.properties.position).toBe(2);
    });

    test('should normalize product properties', () => {
      const properties = {
        recommendation_type: 'cross_sell',
        position: 1,
        price: '149.99', // Should normalize to number
        productId: 'r1', // Should normalize to product_id
        source: 'cart',
        title: 'Product Title', // Should normalize to name
      } as any;

      const result = productRecommendationClicked(properties);

      expect(result.properties).toStrictEqual({
        product_id: 'r1',
        name: 'Product Title',
        recommendation_type: 'cross_sell',
        position: 1,
        price: 149.99,
        source: 'cart',
      });
    });

    test('should throw error when product_id is missing', () => {
      expect(() => {
        productRecommendationClicked({
          name: 'Product',
          recommendation_type: 'similar',
          source: 'product_page',
        } as any);
      }).toThrow('Product must have an id');
    });

    test('should separate product properties from recommendation metadata', () => {
      const properties = {
        product_id: 'r1',
        name: 'Product',
        recommendation_type: 'trending',
        category: 'Electronics',
        position: 3,
        price: 99.99,
        source: 'homepage',
      } as any;

      const result = productRecommendationClicked(properties);

      expect(result.properties).toStrictEqual({
        product_id: 'r1',
        name: 'Product',
        recommendation_type: 'trending',
        category: 'Electronics',
        position: 3,
        price: 99.99,
        source: 'homepage',
      });
    });

    test('should clean undefined properties', () => {
      const properties = {
        product_id: 'r1',
        name: 'Product',
        recommendation_type: 'similar',
        category: undefined,
        position: undefined,
        source: 'product_page',
      };

      const result = productRecommendationClicked(properties);

      expect(result.properties).toStrictEqual({
        product_id: 'r1',
        name: 'Product',
        recommendation_type: 'similar',
        source: 'product_page',
      });
    });
  });

  // Edge cases and integration tests
  describe('edge Cases and Integration', () => {
    test('should handle very large product arrays efficiently', () => {
      const largeProductList = Array.from({ length: 1000 }, (_, i) => ({
        product_id: `p${i}`,
        name: `Product ${i}`,
        price: Math.random() * 1000,
      }));

      const properties: ProductListProperties = {
        list_id: 'large_list',
        products: largeProductList,
      };

      const startTime = performance.now();
      const result = productListViewed(properties);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should complete in under 200ms
      expect(result.properties.products).toHaveLength(1000);
      expect(result.properties.products![0].product_id).toBe('p0');
      expect(result.properties.products![999].product_id).toBe('p999');
    });

    test('should handle malformed product data gracefully', () => {
      const _malformedProducts = [
        null,
        undefined,
        {},
        { name: 'No ID' },
        { product_id: 'p1', price: 'invalid' },
        { product_id: 'p2', quantity: -1 },
        { product_id: 'p3', position: 'first' },
      ];

      // Should throw for null/undefined products
      expect(() => {
        productClicked(null as any);
      }).toThrow('Product properties are required');

      expect(() => {
        productClicked(undefined as any);
      }).toThrow('Product properties are required');

      // Should throw for missing ID
      expect(() => {
        productClicked({} as any);
      }).toThrow('Product must have an id');

      // Should handle invalid numeric values gracefully
      const invalidPriceResult = productClicked({
        product_id: 'p1',
        price: 'invalid',
      } as any);
      expect(invalidPriceResult.properties.price).toBeUndefined();

      const negativeQuantityResult = productClicked({
        product_id: 'p2',
        quantity: -1,
      } as any);
      expect(negativeQuantityResult.properties.quantity).toBeUndefined();

      const invalidPositionResult = productClicked({
        product_id: 'p3',
        position: 'first',
      } as any);
      expect(invalidPositionResult.properties.position).toBeUndefined();
    });

    test('should maintain type safety across all emitters', () => {
      // This test ensures TypeScript types are working correctly
      // by testing that proper interfaces are enforced

      // productSearched requires query
      const searchProps: Parameters<typeof productSearched>[0] = {
        query: 'test',
      };
      expect(() => productSearched(searchProps)).not.toThrow();

      // productViewed requires BaseProductProperties with product_id
      const viewProps: BaseProductProperties = {
        product_id: 'p1',
      };
      expect(() => productViewed(viewProps)).not.toThrow();

      // productRecommendationViewed requires specific properties
      const recProps: RecommendationProperties = {
        recommendation_type: 'similar',
        products: [{ product_id: 'p1' }],
        source: 'product_page',
      };
      expect(() => productRecommendationViewed(recProps)).not.toThrow();
    });

    test('should ensure consistent event naming across all product emitters', () => {
      const eventNames = [
        productSearched({ query: 'test' }).event,
        searchResultsViewed({ query: 'test', results_count: 1 }).name,
        productListViewed({}).name,
        productListFiltered({}).name,
        productClicked({ product_id: 'p1' }).name,
        productViewed({ product_id: 'p1' }).event,
        productCompared({ action: 'added', product: { product_id: 'p1' } }).name,
        productRecommendationViewed({
          recommendation_type: 'similar',
          products: [],
          source: 'test',
        }).name,
        productRecommendationClicked({
          product_id: 'p1',
          recommendation_type: 'similar',
          source: 'test',
        }).name,
      ];

      // All event names should be valid ECOMMERCE_EVENTS
      eventNames.forEach(eventName => {
        expect(Object.values(ECOMMERCE_EVENTS)).toContain(eventName);
      });

      // Event names should be unique
      const uniqueNames = new Set(eventNames);
      expect(uniqueNames.size).toBe(eventNames.length);
    });
  });
});
