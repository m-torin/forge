import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  productSearched,
  searchResultsViewed,
  productListViewed,
  productListFiltered,
  productClicked,
  productViewed,
  productCompared,
  productRecommendationViewed,
  productRecommendationClicked,
} from '../../shared/emitters/ecommerce/events/product';
import { ECOMMERCE_EVENTS } from '../../shared/emitters/ecommerce/types';
import type {
  BaseProductProperties,
  ProductListProperties,
  SearchResultsProperties,
  ProductComparisonProperties,
  RecommendationProperties,
} from '../../shared/emitters/ecommerce/types';

// Mock the trackEcommerce function
vi.mock('../../shared/emitters/ecommerce/track-ecommerce', () => ({
  trackEcommerce: vi.fn((eventSpec, options) => ({
    event: eventSpec.name,
    properties: eventSpec.properties,
    context: { category: 'ecommerce' },
    options,
  })),
}));

describe('Product Emitters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('productSearched', () => {
    it('should create a valid product search event', () => {
      const properties = { query: 'running shoes' };
      const result = productSearched(properties);

      expect(result).toEqual({
        event: ECOMMERCE_EVENTS.PRODUCT_SEARCHED,
        properties: { query: 'running shoes' },
        context: { category: 'ecommerce' },
        options: undefined,
      });
    });

    it('should accept emitter options', () => {
      const properties = { query: 'laptops' };
      const options = { userId: 'user123', timestamp: new Date() };
      const result = productSearched(properties, options);

      expect(result.options).toBe(options);
    });

    it('should throw error when query is missing', () => {
      expect(() => {
        productSearched({} as any);
      }).toThrow('Missing required properties: query');
    });

    it('should handle empty query string', () => {
      expect(() => {
        productSearched({ query: '' });
      }).toThrow('Missing required properties: query');
    });

    it('should clean undefined properties', () => {
      const properties = { 
        query: 'test', 
        extraProp: undefined as any 
      };
      const result = productSearched(properties);

      expect(result.properties).toEqual({ query: 'test' });
      expect(result.properties).not.toHaveProperty('extraProp');
    });
  });

  describe('searchResultsViewed', () => {
    it('should create a valid search results viewed event', () => {
      const properties: SearchResultsProperties = {
        query: 'smartphones',
        results_count: 25,
        filters_applied: { brand: 'Apple', price_range: '500-1000' },
        sort_order: 'price_asc',
      };

      const result = searchResultsViewed(properties);

      expect(result).toEqual({
        name: ECOMMERCE_EVENTS.SEARCH_RESULTS_VIEWED,
        category: 'ecommerce',
        requiredProperties: ['query', 'results_count'],
        properties: {
          query: 'smartphones',
          results_count: 25,
          filters_applied: { brand: 'Apple', price_range: '500-1000' },
          sort_order: 'price_asc',
        },
      });
    });

    it('should normalize products when provided', () => {
      const properties: SearchResultsProperties = {
        query: 'test',
        results_count: 2,
        products: [
          { product_id: 'p1', name: 'Product 1', price: '99.99' },
          { productId: 'p2', title: 'Product 2', price: 149.99 },
        ] as any,
      };

      const result = searchResultsViewed(properties);

      expect(result.properties.products).toEqual([
        { product_id: 'p1', name: 'Product 1', price: 99.99 },
        { product_id: 'p2', name: 'Product 2', price: 149.99 },
      ]);
    });

    it('should throw error when required properties are missing', () => {
      expect(() => {
        searchResultsViewed({ query: 'test' } as any);
      }).toThrow('Missing required properties: results_count');

      expect(() => {
        searchResultsViewed({ results_count: 10 } as any);
      }).toThrow('Missing required properties: query');
    });

    it('should handle zero results', () => {
      const properties: SearchResultsProperties = {
        query: 'nonexistent product',
        results_count: 0,
      };

      const result = searchResultsViewed(properties);
      expect(result.properties.results_count).toBe(0);
    });
  });

  describe('productListViewed', () => {
    it('should create a valid product list viewed event', () => {
      const properties: ProductListProperties = {
        list_id: 'category_electronics',
        category: 'Electronics',
      };

      const result = productListViewed(properties);

      expect(result).toEqual({
        name: ECOMMERCE_EVENTS.PRODUCT_LIST_VIEWED,
        category: 'ecommerce',
        requiredProperties: [],
        properties: {
          list_id: 'category_electronics',
          category: 'Electronics',
        },
      });
    });

    it('should normalize products when provided', () => {
      const mockProducts = [
        { product_id: 'p1', name: 'Product 1' },
        { productId: 'p2', title: 'Product 2' },
      ];

      const properties: ProductListProperties = {
        list_id: 'featured',
        products: mockProducts as any,
      };

      const result = productListViewed(properties);

      expect(result.properties.products).toEqual([
        { product_id: 'p1', name: 'Product 1' },
        { product_id: 'p2', name: 'Product 2' },
      ]);
    });

    it('should work with minimal properties', () => {
      const properties: ProductListProperties = {};
      const result = productListViewed(properties);

      expect(result.properties).toEqual({});
      expect(result.requiredProperties).toEqual([]);
    });

    it('should clean undefined properties', () => {
      const properties: ProductListProperties = {
        list_id: 'test',
        category: undefined,
        products: undefined,
      };

      const result = productListViewed(properties);
      expect(result.properties).toEqual({ list_id: 'test' });
    });
  });

  describe('productListFiltered', () => {
    it('should create a valid product list filtered event', () => {
      const properties = {
        list_id: 'category_shoes',
        category: 'Shoes',
        filters: { size: '10', color: 'black', brand: 'Nike' },
      };

      const result = productListFiltered(properties);

      expect(result).toEqual({
        name: ECOMMERCE_EVENTS.PRODUCT_LIST_FILTERED,
        category: 'ecommerce',
        requiredProperties: [],
        properties: {
          list_id: 'category_shoes',
          category: 'Shoes',
          filters: { size: '10', color: 'black', brand: 'Nike' },
        },
      });
    });

    it('should handle complex filter objects', () => {
      const properties = {
        filters: {
          price: { min: 50, max: 200 },
          ratings: [4, 5],
          availability: 'in_stock',
        },
      };

      const result = productListFiltered(properties);
      expect(result.properties.filters).toEqual(properties.filters);
    });

    it('should normalize products when provided', () => {
      const properties = {
        category: 'Electronics',
        products: [{ productId: 'p1', title: 'Product 1' }] as any,
        filters: { brand: 'Apple' },
      };

      const result = productListFiltered(properties);
      expect(result.properties.products).toEqual([
        { product_id: 'p1', name: 'Product 1' },
      ]);
    });
  });

  describe('productClicked', () => {
    it('should create a valid product clicked event', () => {
      const properties: BaseProductProperties = {
        product_id: 'prod123',
        name: 'Wireless Headphones',
        price: 199.99,
        category: 'Electronics',
        position: 3,
      };

      const result = productClicked(properties);

      expect(result).toEqual({
        name: ECOMMERCE_EVENTS.PRODUCT_CLICKED,
        category: 'ecommerce',
        requiredProperties: ['product_id'],
        properties: {
          product_id: 'prod123',
          name: 'Wireless Headphones',
          price: 199.99,
          category: 'Electronics',
          position: 3,
        },
      });
    });

    it('should normalize product properties', () => {
      const properties = {
        productId: 'p456', // Should normalize to product_id
        title: 'Product Title', // Should normalize to name
        manufacturer: 'Brand X', // Should normalize to brand
        price: '299.99', // Should normalize to number
      } as any;

      const result = productClicked(properties);

      expect(result.properties).toEqual({
        product_id: 'p456',
        name: 'Product Title',
        brand: 'Brand X',
        price: 299.99,
      });
    });

    it('should throw error when product_id is missing', () => {
      expect(() => {
        productClicked({ name: 'Product' } as any);
      }).toThrow('Product must have an id');
    });

    it('should accept various product ID field names', () => {
      const testCases = [
        { product_id: 'p1' },
        { productId: 'p2' },
        { id: 'p3' },
      ];

      testCases.forEach((properties, index) => {
        const result = productClicked(properties as any);
        expect(result.properties.product_id).toBe(`p${index + 1}`);
      });
    });

    it('should clean undefined properties', () => {
      const properties: BaseProductProperties = {
        product_id: 'p1',
        name: 'Product',
        category: undefined,
        price: undefined,
      };

      const result = productClicked(properties);
      expect(result.properties).toEqual({
        product_id: 'p1',
        name: 'Product',
      });
    });
  });

  describe('productViewed', () => {
    it('should create a valid product viewed event', () => {
      const properties: BaseProductProperties = {
        product_id: 'prod789',
        name: 'Gaming Laptop',
        price: 1299.99,
        category: 'Computers',
        brand: 'TechBrand',
      };

      const result = productViewed(properties);

      expect(result).toEqual({
        event: ECOMMERCE_EVENTS.PRODUCT_VIEWED,
        properties: {
          product_id: 'prod789',
          name: 'Gaming Laptop',
          price: 1299.99,
          category: 'Computers',
          brand: 'TechBrand',
        },
        context: { category: 'ecommerce' },
        options: undefined,
      });
    });

    it('should accept emitter options', () => {
      const properties: BaseProductProperties = { product_id: 'p1' };
      const options = { userId: 'user456' };
      
      const result = productViewed(properties, options);
      expect(result.options).toBe(options);
    });

    it('should throw error when product_id is missing', () => {
      expect(() => {
        productViewed({ name: 'Product' } as any);
      }).toThrow('Product must have an id');
    });

    it('should normalize all product properties', () => {
      const properties = {
        productId: 'p1',
        title: 'Product Title',
        SKU: 'ABC123',
        manufacturer: 'Brand',
        price: '99.99',
        quantity: '2',
        variation: 'size-large',
        couponCode: 'SAVE10',
        imageUrl: 'https://example.com/image.jpg',
        link: 'https://example.com/product',
      } as any;

      const result = productViewed(properties);

      expect(result.properties).toEqual({
        product_id: 'p1',
        name: 'Product Title',
        sku: 'ABC123',
        brand: 'Brand',
        price: 99.99,
        quantity: 2,
        variant: 'size-large',
        coupon: 'SAVE10',
        image_url: 'https://example.com/image.jpg',
        url: 'https://example.com/product',
      });
    });
  });

  describe('productCompared', () => {
    const baseProduct: BaseProductProperties = {
      product_id: 'p1',
      name: 'Product 1',
      price: 99.99,
    };

    it('should create a valid product comparison event for adding', () => {
      const properties: ProductComparisonProperties = {
        action: 'added',
        product: baseProduct,
      };

      const result = productCompared(properties);

      expect(result).toEqual({
        name: ECOMMERCE_EVENTS.PRODUCT_COMPARED,
        category: 'ecommerce',
        requiredProperties: ['product_id'],
        properties: {
          action: 'added',
          product_id: 'p1',
          name: 'Product 1',
          price: 99.99,
        },
      });
    });

    it('should create a valid product comparison event for viewing', () => {
      const comparisonList = [
        { product_id: 'p2', name: 'Product 2' },
        { product_id: 'p3', name: 'Product 3' },
      ];

      const properties: ProductComparisonProperties = {
        action: 'viewed',
        product: baseProduct,
        comparison_list: comparisonList,
      };

      const result = productCompared(properties);

      expect(result.properties).toMatchObject({
        action: 'viewed',
        product_id: 'p1',
        name: 'Product 1',
        price: 99.99,
        comparison_list: [
          { product_id: 'p2', name: 'Product 2' },
          { product_id: 'p3', name: 'Product 3' },
        ],
      });
    });

    it('should normalize the main product and comparison list', () => {
      const properties: ProductComparisonProperties = {
        action: 'removed',
        product: { productId: 'p1', title: 'Main Product' } as any,
        comparison_list: [
          { productId: 'p2', title: 'Compare Product' },
        ] as any,
      };

      const result = productCompared(properties);

      expect(result.properties).toMatchObject({
        action: 'removed',
        product_id: 'p1',
        name: 'Main Product',
        comparison_list: [
          { product_id: 'p2', name: 'Compare Product' },
        ],
      });
    });

    it('should throw error when product lacks ID', () => {
      expect(() => {
        productCompared({
          action: 'added',
          product: { name: 'Product' } as any,
        });
      }).toThrow('Product must have an id');
    });

    it('should handle empty comparison list', () => {
      const properties: ProductComparisonProperties = {
        action: 'viewed',
        product: baseProduct,
        comparison_list: [],
      };

      const result = productCompared(properties);
      expect(result.properties.comparison_list).toEqual([]);
    });
  });

  describe('productRecommendationViewed', () => {
    const baseRecommendation: RecommendationProperties = {
      recommendation_type: 'similar',
      source: 'product_page',
      products: [
        { product_id: 'r1', name: 'Recommended 1' },
        { product_id: 'r2', name: 'Recommended 2' },
      ],
    };

    it('should create a valid recommendation viewed event', () => {
      const result = productRecommendationViewed(baseRecommendation);

      expect(result).toEqual({
        name: ECOMMERCE_EVENTS.PRODUCT_RECOMMENDATION_VIEWED,
        category: 'ecommerce',
        requiredProperties: ['recommendation_type', 'source'],
        properties: {
          recommendation_type: 'similar',
          source: 'product_page',
          products: [
            { product_id: 'r1', name: 'Recommended 1' },
            { product_id: 'r2', name: 'Recommended 2' },
          ],
        },
      });
    });

    it('should handle different recommendation types', () => {
      const types = ['frequently_bought', 'trending', 'personalized', 'upsell', 'cross_sell'];

      types.forEach((type) => {
        const properties: RecommendationProperties = {
          recommendation_type: type as any,
          source: 'cart',
          products: [{ product_id: 'p1' }],
        };

        const result = productRecommendationViewed(properties);
        expect(result.properties.recommendation_type).toBe(type);
      });
    });

    it('should include optional algorithm information', () => {
      const properties: RecommendationProperties = {
        ...baseRecommendation,
        algorithm: 'collaborative_filtering_v2',
      };

      const result = productRecommendationViewed(properties);
      expect(result.properties.algorithm).toBe('collaborative_filtering_v2');
    });

    it('should normalize recommended products', () => {
      const properties: RecommendationProperties = {
        recommendation_type: 'upsell',
        source: 'checkout',
        products: [
          { productId: 'p1', title: 'Product 1', price: '199.99' },
          { id: 'p2', name: 'Product 2', price: 299.99 },
        ] as any,
      };

      const result = productRecommendationViewed(properties);

      expect(result.properties.products).toEqual([
        { product_id: 'p1', name: 'Product 1', price: 199.99 },
        { product_id: 'p2', name: 'Product 2', price: 299.99 },
      ]);
    });

    it('should throw error when required properties are missing', () => {
      expect(() => {
        productRecommendationViewed({
          source: 'product_page',
          products: [],
        } as any);
      }).toThrow('Missing required properties: recommendation_type');

      expect(() => {
        productRecommendationViewed({
          recommendation_type: 'similar',
          products: [],
        } as any);
      }).toThrow('Missing required properties: source');
    });

    it('should handle empty products array', () => {
      const properties: RecommendationProperties = {
        recommendation_type: 'similar',
        source: 'product_page',
        products: [],
      };

      const result = productRecommendationViewed(properties);
      expect(result.properties.products).toEqual([]);
    });
  });

  describe('productRecommendationClicked', () => {
    const baseProperties = {
      product_id: 'r1',
      name: 'Recommended Product',
      recommendation_type: 'similar',
      source: 'product_page',
    };

    it('should create a valid recommendation clicked event', () => {
      const result = productRecommendationClicked(baseProperties);

      expect(result).toEqual({
        name: ECOMMERCE_EVENTS.PRODUCT_RECOMMENDATION_CLICKED,
        category: 'ecommerce',
        requiredProperties: ['product_id'],
        properties: {
          product_id: 'r1',
          name: 'Recommended Product',
          recommendation_type: 'similar',
          source: 'product_page',
        },
      });
    });

    it('should include position when provided', () => {
      const properties = {
        ...baseProperties,
        position: 2,
      };

      const result = productRecommendationClicked(properties);
      expect(result.properties.position).toBe(2);
    });

    it('should normalize product properties', () => {
      const properties = {
        productId: 'r1', // Should normalize to product_id
        title: 'Product Title', // Should normalize to name
        price: '149.99', // Should normalize to number
        recommendation_type: 'cross_sell',
        source: 'cart',
        position: 1,
      } as any;

      const result = productRecommendationClicked(properties);

      expect(result.properties).toEqual({
        product_id: 'r1',
        name: 'Product Title',
        price: 149.99,
        recommendation_type: 'cross_sell',
        source: 'cart',
        position: 1,
      });
    });

    it('should throw error when product_id is missing', () => {
      expect(() => {
        productRecommendationClicked({
          name: 'Product',
          recommendation_type: 'similar',
          source: 'product_page',
        } as any);
      }).toThrow('Product must have an id');
    });

    it('should separate product properties from recommendation metadata', () => {
      const properties = {
        product_id: 'r1',
        name: 'Product',
        price: 99.99,
        category: 'Electronics',
        recommendation_type: 'trending',
        source: 'homepage',
        position: 3,
        algorithm: 'ml_v2', // This should not be included in final properties
      } as any;

      const result = productRecommendationClicked(properties);

      expect(result.properties).toEqual({
        product_id: 'r1',
        name: 'Product',
        price: 99.99,
        category: 'Electronics',
        recommendation_type: 'trending',
        source: 'homepage',
        position: 3,
      });
      expect(result.properties).not.toHaveProperty('algorithm');
    });

    it('should clean undefined properties', () => {
      const properties = {
        product_id: 'r1',
        name: 'Product',
        recommendation_type: 'similar',
        source: 'product_page',
        position: undefined,
        category: undefined,
      };

      const result = productRecommendationClicked(properties);

      expect(result.properties).toEqual({
        product_id: 'r1',
        name: 'Product',
        recommendation_type: 'similar',
        source: 'product_page',
      });
    });
  });

  // Edge cases and integration tests
  describe('Edge Cases and Integration', () => {
    it('should handle very large product arrays efficiently', () => {
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

      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      expect(result.properties.products).toHaveLength(1000);
      expect(result.properties.products![0].product_id).toBe('p0');
      expect(result.properties.products![999].product_id).toBe('p999');
    });

    it('should handle malformed product data gracefully', () => {
      const malformedProducts = [
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
        productClicked({});
      }).toThrow('Product must have an id');

      // Should handle invalid numeric values gracefully
      const invalidPriceResult = productClicked({ 
        product_id: 'p1', 
        price: 'invalid' 
      } as any);
      expect(invalidPriceResult.properties.price).toBeUndefined();

      const negativeQuantityResult = productClicked({ 
        product_id: 'p2', 
        quantity: -1 
      } as any);
      expect(negativeQuantityResult.properties.quantity).toBeUndefined();

      const invalidPositionResult = productClicked({ 
        product_id: 'p3', 
        position: 'first' 
      } as any);
      expect(invalidPositionResult.properties.position).toBeUndefined();
    });

    it('should maintain type safety across all emitters', () => {
      // This test ensures TypeScript types are working correctly
      // by testing that proper interfaces are enforced

      // productSearched requires query
      const searchProps: Parameters<typeof productSearched>[0] = { 
        query: 'test' 
      };
      expect(() => productSearched(searchProps)).not.toThrow();

      // productViewed requires BaseProductProperties with product_id
      const viewProps: BaseProductProperties = { 
        product_id: 'p1' 
      };
      expect(() => productViewed(viewProps)).not.toThrow();

      // productRecommendationViewed requires specific properties
      const recProps: RecommendationProperties = {
        recommendation_type: 'similar',
        source: 'product_page',
        products: [{ product_id: 'p1' }],
      };
      expect(() => productRecommendationViewed(recProps)).not.toThrow();
    });

    it('should ensure consistent event naming across all product emitters', () => {
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
          source: 'test', 
          products: [] 
        }).name,
        productRecommendationClicked({ 
          product_id: 'p1', 
          recommendation_type: 'similar', 
          source: 'test' 
        }).name,
      ];

      // All event names should be valid ECOMMERCE_EVENTS
      eventNames.forEach((eventName) => {
        expect(Object.values(ECOMMERCE_EVENTS)).toContain(eventName);
      });

      // Event names should be unique
      const uniqueNames = new Set(eventNames);
      expect(uniqueNames.size).toBe(eventNames.length);
    });
  });
});