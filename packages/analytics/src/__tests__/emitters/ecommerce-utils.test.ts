import { describe, it, expect } from 'vitest';
import {
  normalizeProductProperties,
  normalizeProducts,
  validateRequiredProperties,
  cleanProperties,
  mergeEventProperties,
  validateCurrency,
  createEcommerceContext,
} from '../../shared/emitters/ecommerce/utils';
import type { BaseProductProperties, EcommerceEventProperties } from '../../shared/emitters/ecommerce/types';

describe('Ecommerce Utils', () => {
  describe('normalizeProductProperties', () => {
    it('should normalize product with all standard properties', () => {
      const input = {
        product_id: 'p123',
        sku: 'SKU-123',
        category: 'Electronics',
        name: 'Wireless Headphones',
        brand: 'AudioTech',
        variant: 'Noise Cancelling',
        price: 199.99,
        quantity: 2,
        coupon: 'SAVE10',
        position: 3,
        url: 'https://example.com/headphones',
        image_url: 'https://example.com/headphones.jpg',
      };

      const result = normalizeProductProperties(input);

      expect(result).toEqual({
        product_id: 'p123',
        sku: 'SKU-123',
        category: 'Electronics',
        name: 'Wireless Headphones',
        brand: 'AudioTech',
        variant: 'Noise Cancelling',
        price: 199.99,
        quantity: 2,
        coupon: 'SAVE10',
        position: 3,
        url: 'https://example.com/headphones',
        image_url: 'https://example.com/headphones.jpg',
      });
    });

    it('should normalize product ID field variations', () => {
      const testCases = [
        { product_id: 'p1' },
        { productId: 'p2' },
        { id: 'p3' },
      ];

      testCases.forEach((input, index) => {
        const result = normalizeProductProperties(input);
        expect(result.product_id).toBe(`p${index + 1}`);
      });
    });

    it('should normalize name field variations', () => {
      const testCases = [
        { id: 'p1', name: 'Product Name' },
        { id: 'p2', title: 'Product Title' },
        { id: 'p3', productName: 'Product ProductName' },
      ];

      testCases.forEach((input) => {
        const result = normalizeProductProperties(input);
        expect(result.name).toBeTruthy();
      });

      expect(normalizeProductProperties({ id: 'p1', name: 'Product Name' }).name).toBe('Product Name');
      expect(normalizeProductProperties({ id: 'p2', title: 'Product Title' }).name).toBe('Product Title');
      expect(normalizeProductProperties({ id: 'p3', productName: 'Product ProductName' }).name).toBe('Product ProductName');
    });

    it('should normalize brand field variations', () => {
      const brandCases = [
        { id: 'p1', brand: 'Brand Name' },
        { id: 'p2', manufacturer: 'Manufacturer Name' },
      ];

      expect(normalizeProductProperties(brandCases[0]).brand).toBe('Brand Name');
      expect(normalizeProductProperties(brandCases[1]).brand).toBe('Manufacturer Name');
    });

    it('should normalize variant field variations', () => {
      const variantCases = [
        { id: 'p1', variant: 'Size Large' },
        { id: 'p2', variation: 'Color Red' },
      ];

      expect(normalizeProductProperties(variantCases[0]).variant).toBe('Size Large');
      expect(normalizeProductProperties(variantCases[1]).variant).toBe('Color Red');
    });

    it('should normalize price correctly', () => {
      const priceCases = [
        { id: 'p1', price: 99.99 },
        { id: 'p2', price: '149.99' },
        { id: 'p3', price: '0' },
        { id: 'p4', price: 0 },
        { id: 'p5', price: 'invalid' },
        { id: 'p6', price: null },
        { id: 'p7', price: undefined },
      ];

      expect(normalizeProductProperties(priceCases[0]).price).toBe(99.99);
      expect(normalizeProductProperties(priceCases[1]).price).toBe(149.99);
      expect(normalizeProductProperties(priceCases[2]).price).toBe(0);
      expect(normalizeProductProperties(priceCases[3]).price).toBe(0);
      expect(normalizeProductProperties(priceCases[4]).price).toBeUndefined();
      expect(normalizeProductProperties(priceCases[5]).price).toBeUndefined();
      expect(normalizeProductProperties(priceCases[6]).price).toBeUndefined();
    });

    it('should normalize quantity correctly', () => {
      const quantityCases = [
        { id: 'p1', quantity: 5 },
        { id: 'p2', quantity: '3' },
        { id: 'p3', quantity: '0' },
        { id: 'p4', quantity: 0 },
        { id: 'p5', quantity: -1 },
        { id: 'p6', quantity: 'invalid' },
        { id: 'p7', quantity: 3.5 }, // Should truncate to integer
      ];

      expect(normalizeProductProperties(quantityCases[0]).quantity).toBe(5);
      expect(normalizeProductProperties(quantityCases[1]).quantity).toBe(3);
      expect(normalizeProductProperties(quantityCases[2]).quantity).toBe(0);
      expect(normalizeProductProperties(quantityCases[3]).quantity).toBe(0);
      expect(normalizeProductProperties(quantityCases[4]).quantity).toBeUndefined(); // Negative
      expect(normalizeProductProperties(quantityCases[5]).quantity).toBeUndefined(); // Invalid
      expect(normalizeProductProperties(quantityCases[6]).quantity).toBe(3); // Truncated
    });

    it('should normalize position correctly', () => {
      const positionCases = [
        { id: 'p1', position: 1 },
        { id: 'p2', position: '5' },
        { id: 'p3', position: 0 },
        { id: 'p4', position: -1 },
        { id: 'p5', position: 'invalid' },
        { id: 'p6', position: 2.8 }, // Should truncate to integer
      ];

      expect(normalizeProductProperties(positionCases[0]).position).toBe(1);
      expect(normalizeProductProperties(positionCases[1]).position).toBe(5);
      expect(normalizeProductProperties(positionCases[2]).position).toBe(0);
      expect(normalizeProductProperties(positionCases[3]).position).toBeUndefined(); // Negative
      expect(normalizeProductProperties(positionCases[4]).position).toBeUndefined(); // Invalid
      expect(normalizeProductProperties(positionCases[5]).position).toBe(2); // Truncated
    });

    it('should normalize SKU field variations', () => {
      const skuCases = [
        { id: 'p1', sku: 'sku-123' },
        { id: 'p2', SKU: 'SKU-456' },
      ];

      expect(normalizeProductProperties(skuCases[0]).sku).toBe('sku-123');
      expect(normalizeProductProperties(skuCases[1]).sku).toBe('SKU-456');
    });

    it('should normalize coupon field variations', () => {
      const couponCases = [
        { id: 'p1', coupon: 'SAVE10' },
        { id: 'p2', couponCode: 'SAVE20' },
        { id: 'p3', coupon_code: 'SAVE30' },
      ];

      expect(normalizeProductProperties(couponCases[0]).coupon).toBe('SAVE10');
      expect(normalizeProductProperties(couponCases[1]).coupon).toBe('SAVE20');
      expect(normalizeProductProperties(couponCases[2]).coupon).toBe('SAVE30');
    });

    it('should normalize URL field variations', () => {
      const urlCases = [
        { id: 'p1', url: 'https://example.com/product' },
        { id: 'p2', link: 'https://example.com/link' },
        { id: 'p3', product_url: 'https://example.com/product_url' },
      ];

      expect(normalizeProductProperties(urlCases[0]).url).toBe('https://example.com/product');
      expect(normalizeProductProperties(urlCases[1]).url).toBe('https://example.com/link');
      expect(normalizeProductProperties(urlCases[2]).url).toBe('https://example.com/product_url');
    });

    it('should normalize image URL field variations', () => {
      const imageCases = [
        { id: 'p1', image_url: 'https://example.com/image.jpg' },
        { id: 'p2', imageUrl: 'https://example.com/imageUrl.jpg' },
        { id: 'p3', image: 'https://example.com/image_field.jpg' },
      ];

      expect(normalizeProductProperties(imageCases[0]).image_url).toBe('https://example.com/image.jpg');
      expect(normalizeProductProperties(imageCases[1]).image_url).toBe('https://example.com/imageUrl.jpg');
      expect(normalizeProductProperties(imageCases[2]).image_url).toBe('https://example.com/image_field.jpg');
    });

    it('should throw error when product is null or undefined', () => {
      expect(() => normalizeProductProperties(null)).toThrow('Product properties are required');
      expect(() => normalizeProductProperties(undefined)).toThrow('Product properties are required');
    });

    it('should throw error when product ID is missing', () => {
      expect(() => normalizeProductProperties({})).toThrow('Product must have an id');
      expect(() => normalizeProductProperties({ name: 'Product' })).toThrow('Product must have an id');
      expect(() => normalizeProductProperties({ product_id: '' })).toThrow('Product must have an id');
      expect(() => normalizeProductProperties({ productId: null })).toThrow('Product must have an id');
    });

    it('should handle minimal valid product', () => {
      const minimal = { product_id: 'p1' };
      const result = normalizeProductProperties(minimal);

      expect(result).toEqual({ product_id: 'p1' });
    });

    it('should not include undefined values in output', () => {
      const input = {
        product_id: 'p1',
        name: 'Product',
        category: undefined,
        price: undefined,
        sku: null,
      };

      const result = normalizeProductProperties(input);

      expect(result).toEqual({
        product_id: 'p1',
        name: 'Product',
      });
      expect(result).not.toHaveProperty('category');
      expect(result).not.toHaveProperty('price');
      expect(result).not.toHaveProperty('sku');
    });
  });

  describe('normalizeProducts', () => {
    it('should normalize an array of products', () => {
      const products = [
        { product_id: 'p1', name: 'Product 1' },
        { productId: 'p2', title: 'Product 2' },
        { id: 'p3', name: 'Product 3', price: '99.99' },
      ];

      const result = normalizeProducts(products);

      expect(result).toEqual([
        { product_id: 'p1', name: 'Product 1' },
        { product_id: 'p2', name: 'Product 2' },
        { product_id: 'p3', name: 'Product 3', price: 99.99 },
      ]);
    });

    it('should return empty array for non-array input', () => {
      expect(normalizeProducts(null as any)).toEqual([]);
      expect(normalizeProducts(undefined as any)).toEqual([]);
      expect(normalizeProducts('not-array' as any)).toEqual([]);
      expect(normalizeProducts({} as any)).toEqual([]);
    });

    it('should handle empty array', () => {
      expect(normalizeProducts([])).toEqual([]);
    });

    it('should handle mixed valid and invalid products', () => {
      const products = [
        { product_id: 'p1', name: 'Valid Product' },
        null,
        undefined,
        { name: 'No ID Product' },
        { product_id: 'p2', name: 'Another Valid' },
      ];

      // Should throw on the first invalid product (null)
      expect(() => normalizeProducts(products)).toThrow();
    });

    it('should handle large arrays efficiently', () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => ({
        product_id: `p${i}`,
        name: `Product ${i}`,
      }));

      const startTime = performance.now();
      const result = normalizeProducts(largeArray);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      expect(result).toHaveLength(10000);
      expect(result[0].product_id).toBe('p0');
      expect(result[9999].product_id).toBe('p9999');
    });
  });

  describe('validateRequiredProperties', () => {
    it('should pass validation when all required properties are present', () => {
      const properties = {
        product_id: 'p1',
        name: 'Product',
        price: 99.99,
      };

      expect(() => {
        validateRequiredProperties(properties, ['product_id', 'name']);
      }).not.toThrow();
    });

    it('should throw error when required properties are missing', () => {
      const properties = {
        product_id: 'p1',
        price: 99.99,
      };

      expect(() => {
        validateRequiredProperties(properties, ['product_id', 'name']);
      }).toThrow('Missing required properties: name');
    });

    it('should throw error for multiple missing properties', () => {
      const properties = {
        category: 'Electronics',
      };

      expect(() => {
        validateRequiredProperties(properties, ['product_id', 'name', 'price']);
      }).toThrow('Missing required properties: product_id, name, price');
    });

    it('should handle empty required properties array', () => {
      const properties = { anything: 'value' };

      expect(() => {
        validateRequiredProperties(properties, []);
      }).not.toThrow();
    });

    it('should handle falsy values correctly', () => {
      const properties = {
        product_id: 'p1',
        count: 0,
        active: false,
        description: '',
      };

      // These should fail for empty string (description) since it's considered missing
      expect(() => {
        validateRequiredProperties(properties, ['product_id', 'count', 'active', 'description']);
      }).toThrow('Missing required properties: description');

      // These should pass (excluding empty string)
      expect(() => {
        validateRequiredProperties(properties, ['product_id', 'count', 'active']);
      }).not.toThrow();
    });

    it('should fail for null and undefined values', () => {
      const properties = {
        product_id: 'p1',
        name: null,
        price: undefined,
      };

      expect(() => {
        validateRequiredProperties(properties, ['product_id', 'name', 'price']);
      }).toThrow('Missing required properties: name, price');
    });
  });

  describe('cleanProperties', () => {
    it('should remove undefined values', () => {
      const input = {
        product_id: 'p1',
        name: 'Product',
        category: undefined,
        price: 99.99,
        sku: undefined,
      };

      const result = cleanProperties(input);

      expect(result).toEqual({
        product_id: 'p1',
        name: 'Product',
        price: 99.99,
      });
    });

    it('should preserve falsy values that are not undefined', () => {
      const input = {
        product_id: 'p1',
        count: 0,
        active: false,
        description: '',
        optional: null,
        missing: undefined,
      };

      const result = cleanProperties(input);

      expect(result).toEqual({
        product_id: 'p1',
        count: 0,
        active: false,
        description: '',
        optional: null,
      });
      expect(result).not.toHaveProperty('missing');
    });

    it('should handle empty objects', () => {
      expect(cleanProperties({})).toEqual({});
    });

    it('should handle objects with all undefined values', () => {
      const input = {
        a: undefined,
        b: undefined,
        c: undefined,
      };

      expect(cleanProperties(input)).toEqual({});
    });

    it('should handle nested objects (shallow clean only)', () => {
      const input = {
        product_id: 'p1',
        metadata: {
          internal: undefined,
          public: 'value',
        },
        tags: undefined,
      };

      const result = cleanProperties(input);

      expect(result).toEqual({
        product_id: 'p1',
        metadata: {
          internal: undefined, // Nested undefined values are preserved
          public: 'value',
        },
      });
    });
  });

  describe('mergeEventProperties', () => {
    it('should merge specific properties with common properties', () => {
      const specific = {
        product_id: 'p1',
        name: 'Product',
      };

      const common = {
        user_id: 'user123',
        session_id: 'session456',
      };

      const result = mergeEventProperties(specific, common);

      expect(result).toEqual({
        user_id: 'user123',
        session_id: 'session456',
        product_id: 'p1',
        name: 'Product',
      });
    });

    it('should prioritize specific properties over common properties', () => {
      const specific = {
        product_id: 'p1',
        category: 'Specific Category',
      };

      const common = {
        product_id: 'p2', // Should be overridden
        category: 'Common Category', // Should be overridden
        user_id: 'user123',
      };

      const result = mergeEventProperties(specific, common);

      expect(result).toEqual({
        product_id: 'p1',
        category: 'Specific Category',
        user_id: 'user123',
      });
    });

    it('should handle undefined common properties', () => {
      const specific = {
        product_id: 'p1',
        name: 'Product',
      };

      const result = mergeEventProperties(specific, undefined);

      expect(result).toEqual(specific);
    });

    it('should handle empty objects', () => {
      expect(mergeEventProperties({}, {})).toEqual({});
      expect(mergeEventProperties({}, { common: 'value' })).toEqual({ common: 'value' });
      expect(mergeEventProperties({ specific: 'value' }, {})).toEqual({ specific: 'value' });
    });
  });

  describe('validateCurrency', () => {
    it('should validate valid currency codes', () => {
      const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

      validCurrencies.forEach((currency) => {
        expect(validateCurrency(currency)).toBe(currency);
      });
    });

    it('should normalize lowercase currency codes', () => {
      expect(validateCurrency('usd')).toBe('USD');
      expect(validateCurrency('eur')).toBe('EUR');
      expect(validateCurrency('gbp')).toBe('GBP');
    });

    it('should normalize mixed case currency codes', () => {
      expect(validateCurrency('uSd')).toBe('USD');
      expect(validateCurrency('EuR')).toBe('EUR');
      expect(validateCurrency('gBp')).toBe('GBP');
    });

    it('should return undefined for invalid currency codes', () => {
      const invalidCurrencies = [
        'US', // Too short
        'USDA', // Too long
        '123', // Numbers
        'U$D', // Special characters
        '$$$', // Special characters
        '', // Empty string
      ];

      invalidCurrencies.forEach((currency) => {
        expect(validateCurrency(currency)).toBeUndefined();
      });
    });

    it('should return undefined for undefined/null input', () => {
      expect(validateCurrency(undefined)).toBeUndefined();
      expect(validateCurrency(null as any)).toBeUndefined();
    });

    it('should handle non-string input gracefully', () => {
      expect(validateCurrency(123 as any)).toBeUndefined();
      expect(validateCurrency({} as any)).toBeUndefined();
      expect(validateCurrency([] as any)).toBeUndefined();
    });
  });

  describe('createEcommerceContext', () => {
    it('should create basic ecommerce context', () => {
      const result = createEcommerceContext();

      expect(result).toEqual({
        category: 'ecommerce',
      });
    });

    it('should merge additional context', () => {
      const additionalContext = {
        source: 'product_page',
        experiment_id: 'exp123',
      };

      const result = createEcommerceContext(additionalContext);

      expect(result).toEqual({
        category: 'ecommerce',
        source: 'product_page',
        experiment_id: 'exp123',
      });
    });

    it('should prioritize ecommerce category over additional context', () => {
      const additionalContext = {
        category: 'other', // Should be overridden
        source: 'product_page',
      };

      const result = createEcommerceContext(additionalContext);

      expect(result).toEqual({
        category: 'ecommerce',
        source: 'product_page',
      });
    });

    it('should handle empty additional context', () => {
      expect(createEcommerceContext({})).toEqual({
        category: 'ecommerce',
      });
    });

    it('should handle undefined additional context', () => {
      expect(createEcommerceContext(undefined)).toEqual({
        category: 'ecommerce',
      });
    });

    it('should handle complex additional context', () => {
      const complexContext = {
        user: {
          id: 'user123',
          segment: 'premium',
        },
        page: {
          title: 'Product Page',
          url: 'https://example.com/product',
        },
        experiment: {
          id: 'exp123',
          variant: 'control',
        },
      };

      const result = createEcommerceContext(complexContext);

      expect(result).toEqual({
        category: 'ecommerce',
        user: {
          id: 'user123',
          segment: 'premium',
        },
        page: {
          title: 'Product Page',
          url: 'https://example.com/product',
        },
        experiment: {
          id: 'exp123',
          variant: 'control',
        },
      });
    });
  });

  // Integration and performance tests
  describe('Integration Tests', () => {
    it('should work together in a typical product normalization flow', () => {
      const rawProduct = {
        productId: 'p123',
        title: 'Wireless Headphones',
        manufacturer: 'AudioTech',
        price: '199.99',
        quantity: '2',
        couponCode: 'SAVE10',
        imageUrl: 'https://example.com/headphones.jpg',
        extraField: undefined,
      };

      // Step 1: Normalize the product
      const normalized = normalizeProductProperties(rawProduct);

      // Step 2: Validate required properties
      expect(() => {
        validateRequiredProperties(normalized, ['product_id', 'name']);
      }).not.toThrow();

      // Step 3: Clean properties
      const cleaned = cleanProperties(normalized);

      // Step 4: Merge with common properties
      const common = { user_id: 'user123', session_id: 'session456' };
      const merged = mergeEventProperties(cleaned, common);

      // Step 5: Create context
      const context = createEcommerceContext({ page: 'product_detail' });

      expect(normalized.product_id).toBe('p123');
      expect(normalized.name).toBe('Wireless Headphones');
      expect(normalized.brand).toBe('AudioTech');
      expect(normalized.price).toBe(199.99);
      expect(normalized.quantity).toBe(2);
      expect(normalized.coupon).toBe('SAVE10');

      expect(cleaned).not.toHaveProperty('extraField');

      expect(merged).toMatchObject({
        user_id: 'user123',
        session_id: 'session456',
        product_id: 'p123',
        name: 'Wireless Headphones',
      });

      expect(context).toEqual({
        category: 'ecommerce',
        page: 'product_detail',
      });
    });

    it('should handle batch processing efficiently', () => {
      const rawProducts = Array.from({ length: 1000 }, (_, i) => ({
        productId: `p${i}`,
        title: `Product ${i}`,
        price: `${Math.random() * 1000}`,
        quantity: `${Math.floor(Math.random() * 10)}`,
      }));

      const startTime = performance.now();

      const normalized = normalizeProducts(rawProducts);
      const cleaned = normalized.map(cleanProperties);
      const withCommon = cleaned.map(product => 
        mergeEventProperties(product, { user_id: 'user123' })
      );

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should complete in under 200ms
      expect(normalized).toHaveLength(1000);
      expect(withCommon[0]).toHaveProperty('user_id', 'user123');
      expect(withCommon[999]).toHaveProperty('user_id', 'user123');
    });

    it('should maintain data integrity through the entire flow', () => {
      const originalData = {
        productId: 'special-chars-123',
        title: 'Product with "quotes" & symbols',
        price: '99.99',
        category: 'Electronics & Gadgets',
        url: 'https://example.com/product?id=123&ref=homepage',
      };

      const result = cleanProperties(
        mergeEventProperties(
          normalizeProductProperties(originalData),
          { timestamp: new Date().toISOString() }
        )
      );

      expect(result.product_id).toBe('special-chars-123');
      expect(result.name).toBe('Product with "quotes" & symbols');
      expect(result.category).toBe('Electronics & Gadgets');
      expect(result.url).toBe('https://example.com/product?id=123&ref=homepage');
      expect(result.price).toBe(99.99);
      expect(result).toHaveProperty('timestamp');
    });
  });
});