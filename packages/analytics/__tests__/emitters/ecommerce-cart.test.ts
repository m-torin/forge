import { beforeEach, describe, expect, vi } from 'vitest';

import {
  cartAbandoned,
  cartUpdated,
  cartViewed,
  checkoutProgressed,
} from '#/shared/emitters/ecommerce/events/cart-checkout';
import { ECOMMERCE_EVENTS } from '#/shared/emitters/ecommerce/types';

import type {
  BaseProductProperties,
  CartAbandonmentProperties,
  CartProperties,
  CartUpdateProperties,
  CheckoutProgressProperties,
} from '#/shared/emitters/ecommerce/types';

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

describe('cart and Checkout Emitters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('cartUpdated', () => {
    const baseProduct: BaseProductProperties = {
      product_id: 'p123',
      name: 'Test Product',
      price: 99.99,
      quantity: 2,
    };

    test('should create a valid cart update event for adding a product', () => {
      const properties: CartUpdateProperties = {
        cart_id: 'cart123',
        action: 'added',
        cart_total: 199.98,
        product: baseProduct,
        quantity_change: 2,
      };

      const result = cartUpdated(properties);

      expect(result).toStrictEqual({
        type: 'track',
        event: ECOMMERCE_EVENTS.CART_UPDATED,
        context: {
          traits: {
            event_category: 'ecommerce',
          },
        },
        properties: {
          cart_id: 'cart123',
          product_id: 'p123',
          name: 'Test Product',
          action: 'added',
          cart_total: 199.98,
          price: 99.99,
          quantity: 2,
          quantity_change: 2,
        },
      });
    });

    test('should create a valid cart update event for removing a product', () => {
      const properties: CartUpdateProperties = {
        cart_id: 'cart123',
        action: 'removed',
        cart_total: 99.99,
        product: baseProduct,
        quantity_change: -1,
      };

      const result = cartUpdated(properties);

      expect(result.properties).toMatchObject({
        product_id: 'p123',
        action: 'removed',
        cart_total: 99.99,
        quantity_change: -1,
      });
    });

    test('should create a valid cart update event for updating a product', () => {
      const properties: CartUpdateProperties = {
        action: 'updated',
        cart_total: 299.97,
        product: baseProduct,
        quantity_change: 1,
      };

      const result = cartUpdated(properties);

      expect(result.properties).toMatchObject({
        product_id: 'p123',
        action: 'updated',
        cart_total: 299.97,
        quantity_change: 1,
      });
    });

    test('should accept emitter options', () => {
      const properties: CartUpdateProperties = {
        action: 'added',
        product: baseProduct,
      };
      const options = { context: { traits: { userId: 'user123' } }, timestamp: new Date() };

      const result = cartUpdated(properties, options);

      expect(result.timestamp).toBe(options.timestamp);
      expect(result.context?.traits?.userId).toBe('user123');
    });

    test('should normalize product properties', () => {
      const rawProduct = {
        manufacturer: 'Brand X', // Should normalize to brand
        price: '149.99', // Should normalize to number
        productId: 'p456', // Should normalize to product_id
        title: 'Raw Product', // Should normalize to name
      };

      const properties: CartUpdateProperties = {
        action: 'added',
        product: rawProduct as any,
      };

      const result = cartUpdated(properties);

      expect(result.properties).toMatchObject({
        product_id: 'p456',
        name: 'Raw Product',
        action: 'added',
        brand: 'Brand X',
        price: 149.99,
      });
    });

    test('should handle minimal properties', () => {
      const properties: CartUpdateProperties = {
        action: 'added',
        product: { product_id: 'p1' },
      };

      const result = cartUpdated(properties);

      expect(result.properties).toStrictEqual({
        product_id: 'p1',
        action: 'added',
      });
    });

    test('should clean undefined properties', () => {
      const properties: CartUpdateProperties = {
        cart_id: undefined,
        action: 'added',
        cart_total: undefined,
        product: baseProduct,
        quantity_change: undefined,
      };

      const result = cartUpdated(properties);

      expect(result.properties).not.toHaveProperty('quantity_change');
      expect(result.properties).not.toHaveProperty('cart_total');
      expect(result.properties).not.toHaveProperty('cart_id');
    });

    test('should throw error when action is missing', () => {
      expect(() => {
        cartUpdated({ product: baseProduct } as any);
      }).toThrow('Missing required properties: action');
    });

    test('should throw error when product ID is missing', () => {
      expect(() => {
        cartUpdated({
          action: 'added',
          product: { name: 'No ID Product' },
        } as any);
      }).toThrow('Product must have an id');
    });

    test('should handle different action types', () => {
      const actions = ['added', 'removed', 'updated'] as const;

      actions.forEach(action => {
        const properties: CartUpdateProperties = {
          action,
          product: baseProduct,
        };

        const result = cartUpdated(properties);
        expect(result.properties?.action).toBe(action);
      });
    });

    test('should handle zero cart total', () => {
      const properties: CartUpdateProperties = {
        action: 'removed',
        cart_total: 0,
        product: baseProduct,
      };

      const result = cartUpdated(properties);
      expect(result.properties?.cart_total).toBe(0);
    });

    test('should handle negative quantity changes', () => {
      const properties: CartUpdateProperties = {
        action: 'removed',
        product: baseProduct,
        quantity_change: -5,
      };

      const result = cartUpdated(properties);
      expect(result.properties?.quantity_change).toBe(-5);
    });
  });

  describe('cartViewed', () => {
    test('should create a valid cart viewed event with minimal properties', () => {
      const properties: CartProperties = {};

      const result = cartViewed(properties);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.CART_VIEWED,
        category: 'ecommerce',
        properties: {},
        requiredProperties: [],
      });
    });

    test('should create a valid cart viewed event with cart ID', () => {
      const properties: CartProperties = {
        cart_id: 'cart123',
      };

      const result = cartViewed(properties);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.CART_VIEWED,
        category: 'ecommerce',
        properties: {
          cart_id: 'cart123',
        },
        requiredProperties: [],
      });
    });

    test('should create a valid cart viewed event with products', () => {
      const products = [
        { product_id: 'p1', name: 'Product 1', price: 99.99 },
        { product_id: 'p2', name: 'Product 2', price: 149.99 },
      ];

      const properties: CartProperties = {
        cart_id: 'cart123',
        products,
      };

      const result = cartViewed(properties);

      expect(result.properties).toStrictEqual({
        cart_id: 'cart123',
        products,
      });
    });

    test('should normalize products when provided', () => {
      const rawProducts = [
        { price: '99.99', productId: 'p1', title: 'Product 1' },
        { id: 'p2', name: 'Product 2', price: 149.99 },
      ];

      const properties: CartProperties = {
        cart_id: 'cart123',
        products: rawProducts as any,
      };

      const result = cartViewed(properties);

      expect(result.properties.products).toStrictEqual([
        { product_id: 'p1', name: 'Product 1', price: 99.99 },
        { product_id: 'p2', name: 'Product 2', price: 149.99 },
      ]);
    });

    test('should handle empty products array', () => {
      const properties: CartProperties = {
        cart_id: 'cart123',
        products: [],
      };

      const result = cartViewed(properties);

      expect(result.properties.products).toStrictEqual([]);
    });

    test('should clean undefined properties', () => {
      const properties: CartProperties = {
        cart_id: 'cart123',
        products: undefined,
      };

      const result = cartViewed(properties);

      expect(result.properties).toStrictEqual({
        cart_id: 'cart123',
      });
      expect(result.properties).not.toHaveProperty('products');
    });

    test('should handle large product arrays efficiently', () => {
      const largeProductArray = Array.from({ length: 1000 }, (_, i) => ({
        product_id: `p${i}`,
        name: `Product ${i}`,
        price: Math.random() * 1000,
      }));

      const properties: CartProperties = {
        cart_id: 'cart123',
        products: largeProductArray,
      };

      const startTime = performance.now();
      const result = cartViewed(properties);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      expect(result.properties.products).toHaveLength(1000);
    });
  });

  describe('cartAbandoned', () => {
    const baseProducts = [
      { product_id: 'p1', name: 'Product 1', price: 99.99, quantity: 2 },
      { product_id: 'p2', name: 'Product 2', price: 149.99, quantity: 1 },
    ];

    test('should create a valid cart abandoned event', () => {
      const properties: CartAbandonmentProperties = {
        cart_id: 'cart123',
        abandonment_reason: 'timeout',
        cart_value: 349.97,
        products: baseProducts,
        time_in_cart: 1800, // 30 minutes
      };

      const result = cartAbandoned(properties);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.CART_ABANDONED,
        category: 'ecommerce',
        properties: {
          cart_id: 'cart123',
          abandonment_reason: 'timeout',
          cart_value: 349.97,
          products: baseProducts,
          time_in_cart: 1800,
        },
        requiredProperties: ['cart_id', 'cart_value'],
      });
    });

    test('should create a valid cart abandoned event with minimal properties', () => {
      const properties: CartAbandonmentProperties = {
        cart_id: 'cart456',
        cart_value: 199.99,
        products: baseProducts,
      };

      const result = cartAbandoned(properties);

      expect(result.properties).toStrictEqual({
        cart_id: 'cart456',
        cart_value: 199.99,
        products: baseProducts,
      });
    });

    test('should handle different abandonment reasons', () => {
      const reasons = ['timeout', 'navigation', 'closed'] as const;

      reasons.forEach(reason => {
        const properties: CartAbandonmentProperties = {
          cart_id: 'cart123',
          abandonment_reason: reason,
          cart_value: 100,
          products: baseProducts,
        };

        const result = cartAbandoned(properties);
        expect(result.properties.abandonment_reason).toBe(reason);
      });
    });

    test('should normalize products', () => {
      const rawProducts = [
        { price: '99.99', productId: 'p1', title: 'Product 1' },
        { id: 'p2', name: 'Product 2', price: 149.99 },
      ];

      const properties: CartAbandonmentProperties = {
        cart_id: 'cart123',
        cart_value: 249.98,
        products: rawProducts as any,
      };

      const result = cartAbandoned(properties);

      expect(result.properties.products).toStrictEqual([
        { product_id: 'p1', name: 'Product 1', price: 99.99 },
        { product_id: 'p2', name: 'Product 2', price: 149.99 },
      ]);
    });

    test('should throw error when cart_id is missing', () => {
      expect(() => {
        cartAbandoned({
          cart_value: 100,
          products: baseProducts,
        } as any);
      }).toThrow('Missing required properties: cart_id');
    });

    test('should throw error when cart_value is missing', () => {
      expect(() => {
        cartAbandoned({
          cart_id: 'cart123',
          products: baseProducts,
        } as any);
      }).toThrow('Missing required properties: cart_value');
    });

    test('should throw error when both required properties are missing', () => {
      expect(() => {
        cartAbandoned({
          products: baseProducts,
        } as any);
      }).toThrow('Missing required properties: cart_id, cart_value');
    });

    test('should handle zero cart value', () => {
      const properties: CartAbandonmentProperties = {
        cart_id: 'cart123',
        cart_value: 0,
        products: [],
      };

      const result = cartAbandoned(properties);
      expect(result.properties.cart_value).toBe(0);
    });

    test('should handle empty products array', () => {
      const properties: CartAbandonmentProperties = {
        cart_id: 'cart123',
        cart_value: 0,
        products: [],
      };

      const result = cartAbandoned(properties);
      expect(result.properties.products).toStrictEqual([]);
    });

    test('should handle zero time in cart', () => {
      const properties: CartAbandonmentProperties = {
        cart_id: 'cart123',
        cart_value: 100,
        products: baseProducts,
        time_in_cart: 0,
      };

      const result = cartAbandoned(properties);
      expect(result.properties.time_in_cart).toBe(0);
    });

    test('should clean undefined properties', () => {
      const properties: CartAbandonmentProperties = {
        cart_id: 'cart123',
        abandonment_reason: undefined,
        cart_value: 100,
        products: baseProducts,
        time_in_cart: undefined,
      };

      const result = cartAbandoned(properties);

      expect(result.properties).toStrictEqual({
        cart_id: 'cart123',
        cart_value: 100,
        products: baseProducts,
      });
    });
  });

  describe('checkoutProgressed', () => {
    const baseProducts = [
      { product_id: 'p1', name: 'Product 1', price: 99.99 },
      { product_id: 'p2', name: 'Product 2', price: 149.99 },
    ];

    test('should create a valid checkout progress event', () => {
      const properties: CheckoutProgressProperties = {
        checkout_id: 'checkout123',
        step_name: 'Shipping Information',
        action: 'viewed',
        payment_method: 'credit_card',
        products: baseProducts,
        shipping_method: 'standard',
        step: 1,
      };

      const result = checkoutProgressed(properties);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.CHECKOUT_PROGRESSED,
        category: 'ecommerce',
        properties: {
          checkout_id: 'checkout123',
          step_name: 'Shipping Information',
          action: 'viewed',
          payment_method: 'credit_card',
          products: baseProducts,
          shipping_method: 'standard',
          step: 1,
        },
        requiredProperties: ['step', 'step_name', 'action'],
      });
    });

    test('should create a valid checkout progress event with minimal properties', () => {
      const properties: CheckoutProgressProperties = {
        step_name: 'Payment Information',
        action: 'completed',
        step: 2,
      };

      const result = checkoutProgressed(properties);

      expect(result.properties).toStrictEqual({
        step_name: 'Payment Information',
        action: 'completed',
        step: 2,
      });
    });

    test('should handle different step actions', () => {
      const actions = ['viewed', 'completed', 'abandoned', 'error'] as const;

      actions.forEach((action, index) => {
        const properties: CheckoutProgressProperties = {
          step_name: `Step ${index + 1}`,
          action,
          step: index + 1,
        };

        const result = checkoutProgressed(properties);
        expect(result.properties.action).toBe(action);
      });
    });

    test('should handle checkout error with error message', () => {
      const properties: CheckoutProgressProperties = {
        checkout_id: 'checkout123',
        step_name: 'Payment Processing',
        action: 'error',
        error_message: 'Credit card declined',
        step: 3,
      };

      const result = checkoutProgressed(properties);

      expect(result.properties).toMatchObject({
        checkout_id: 'checkout123',
        step_name: 'Payment Processing',
        action: 'error',
        error_message: 'Credit card declined',
        step: 3,
      });
    });

    test('should normalize products when provided', () => {
      const rawProducts = [
        { price: '99.99', productId: 'p1', title: 'Product 1' },
        { id: 'p2', name: 'Product 2', price: 149.99 },
      ];

      const properties: CheckoutProgressProperties = {
        step_name: 'Review Order',
        action: 'viewed',
        products: rawProducts as any,
        step: 1,
      };

      const result = checkoutProgressed(properties);

      expect(result.properties.products).toStrictEqual([
        { product_id: 'p1', name: 'Product 1', price: 99.99 },
        { product_id: 'p2', name: 'Product 2', price: 149.99 },
      ]);
    });

    test('should handle different payment methods', () => {
      const paymentMethods = ['credit_card', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer'];

      paymentMethods.forEach(method => {
        const properties: CheckoutProgressProperties = {
          step_name: 'Payment',
          action: 'viewed',
          payment_method: method,
          step: 2,
        };

        const result = checkoutProgressed(properties);
        expect(result.properties.payment_method).toBe(method);
      });
    });

    test('should handle different shipping methods', () => {
      const shippingMethods = ['standard', 'express', 'overnight', 'pickup', 'digital'];

      shippingMethods.forEach(method => {
        const properties: CheckoutProgressProperties = {
          step_name: 'Shipping',
          action: 'viewed',
          shipping_method: method,
          step: 1,
        };

        const result = checkoutProgressed(properties);
        expect(result.properties.shipping_method).toBe(method);
      });
    });

    test('should throw error when step is missing', () => {
      expect(() => {
        checkoutProgressed({
          step_name: 'Step Name',
          action: 'viewed',
        } as any);
      }).toThrow('Missing required properties: step');
    });

    test('should throw error when step_name is missing', () => {
      expect(() => {
        checkoutProgressed({
          action: 'viewed',
          step: 1,
        } as any);
      }).toThrow('Missing required properties: step_name');
    });

    test('should throw error when action is missing', () => {
      expect(() => {
        checkoutProgressed({
          step_name: 'Step Name',
          step: 1,
        } as any);
      }).toThrow('Missing required properties: action');
    });

    test('should throw error when multiple required properties are missing', () => {
      expect(() => {
        checkoutProgressed({} as any);
      }).toThrow('Missing required properties: step, step_name, action');
    });

    test('should handle step 0', () => {
      const properties: CheckoutProgressProperties = {
        step_name: 'Cart Review',
        action: 'viewed',
        step: 0,
      };

      const result = checkoutProgressed(properties);
      expect(result.properties.step).toBe(0);
    });

    test('should handle empty products array', () => {
      const properties: CheckoutProgressProperties = {
        step_name: 'Empty Cart',
        action: 'viewed',
        products: [],
        step: 1,
      };

      const result = checkoutProgressed(properties);
      expect(result.properties.products).toStrictEqual([]);
    });

    test('should clean undefined properties', () => {
      const properties: CheckoutProgressProperties = {
        checkout_id: undefined,
        step_name: 'Shipping',
        action: 'viewed',
        error_message: undefined,
        payment_method: undefined,
        products: undefined,
        shipping_method: undefined,
        step: 1,
      };

      const result = checkoutProgressed(properties);

      expect(result.properties).toStrictEqual({
        step_name: 'Shipping',
        action: 'viewed',
        step: 1,
      });
    });

    test('should handle complex checkout flow scenario', () => {
      const checkoutSteps = [
        { step_name: 'Shipping Info', action: 'viewed' as const, step: 1 },
        { step_name: 'Shipping Info', action: 'completed' as const, step: 1 },
        { step_name: 'Payment Info', action: 'viewed' as const, step: 2 },
        {
          step_name: 'Payment Info',
          action: 'error' as const,
          error_message: 'Invalid card',
          step: 2,
        },
        { step_name: 'Payment Info', action: 'viewed' as const, step: 2 },
        { step_name: 'Payment Info', action: 'completed' as const, step: 2 },
        { step_name: 'Review Order', action: 'viewed' as const, step: 3 },
        { step_name: 'Review Order', action: 'completed' as const, step: 3 },
      ];

      checkoutSteps.forEach(stepData => {
        const properties: CheckoutProgressProperties = {
          ...stepData,
          checkout_id: 'checkout123',
          products: baseProducts,
        };

        const result = checkoutProgressed(properties);

        expect(result.properties.step).toBe(stepData.step);
        expect(result.properties.step_name).toBe(stepData.step_name);
        expect(result.properties.action).toBe(stepData.action);
        expect(result.properties.checkout_id).toBe('checkout123');

        // Check error message if present
        const expectedError = stepData.error_message;
        expect(result.properties.error_message).toBe(expectedError);
      });
    });
  });

  // Edge cases and integration tests
  describe('edge Cases and Integration', () => {
    test('should handle very large product arrays in cart operations efficiently', () => {
      const largeProductList = Array.from({ length: 5000 }, (_, i) => ({
        product_id: `p${i}`,
        name: `Product ${i}`,
        price: Math.random() * 1000,
        quantity: Math.floor(Math.random() * 10) + 1,
      }));

      const cartValue = largeProductList.reduce(
        (sum, product) => sum + product.price * product.quantity,
        0,
      );

      const properties: CartAbandonmentProperties = {
        cart_id: 'large_cart',
        cart_value: cartValue,
        products: largeProductList,
      };

      const startTime = performance.now();
      const result = cartAbandoned(properties);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should complete in under 200ms
      expect(result.properties.products).toHaveLength(5000);
      expect(result.properties.cart_value).toBe(cartValue);
    });

    test('should maintain data consistency across cart lifecycle', () => {
      const product = { product_id: 'p1', name: 'Lifecycle Product', price: 99.99 };

      // 1. Add to cart
      const addResult = cartUpdated({
        cart_id: 'lifecycle_cart',
        action: 'added',
        cart_total: 99.99,
        product,
        quantity_change: 1,
      });

      // 2. View cart
      const viewResult = cartViewed({
        cart_id: 'lifecycle_cart',
        products: [product],
      });

      // 3. Update cart
      const updateResult = cartUpdated({
        cart_id: 'lifecycle_cart',
        action: 'updated',
        cart_total: 199.98,
        product: { ...product, quantity: 2 },
        quantity_change: 1,
      });

      // 4. Start checkout
      const checkoutResult = checkoutProgressed({
        checkout_id: 'checkout_lifecycle',
        step_name: 'Shipping',
        action: 'viewed',
        products: [{ ...product, quantity: 2 }],
        step: 1,
      });

      // All operations should maintain consistent cart_id
      expect(addResult.properties!.cart_id).toBe('lifecycle_cart');
      expect(viewResult.properties!.cart_id).toBe('lifecycle_cart');
      expect(updateResult.properties!.cart_id).toBe('lifecycle_cart');
      expect(checkoutResult.properties!.checkout_id).toBe('checkout_lifecycle');

      // Product data should be consistent
      expect(addResult.properties!.product_id).toBe('p1');
      expect(viewResult.properties!.products![0].product_id).toBe('p1');
      expect(updateResult.properties!.product_id).toBe('p1');
      expect(checkoutResult.properties!.products![0].product_id).toBe('p1');
    });

    test('should ensure consistent event naming across all cart emitters', () => {
      const eventNames = [
        cartUpdated({ action: 'added', product: { product_id: 'p1' } }).event,
        cartViewed({}).name,
        cartAbandoned({ cart_id: 'c1', cart_value: 100, products: [] }).name,
        checkoutProgressed({ step_name: 'test', action: 'viewed', step: 1 }).name,
      ];

      // All event names should be valid ECOMMERCE_EVENTS
      eventNames.forEach(eventName => {
        expect(Object.values(ECOMMERCE_EVENTS)).toContain(eventName);
      });

      // Event names should be unique
      const uniqueNames = new Set(eventNames);
      expect(uniqueNames.size).toBe(eventNames.length);
    });

    test('should handle malformed data gracefully', () => {
      // Test with malformed product in cart update
      expect(() => {
        cartUpdated({
          action: 'added',
          product: null as any,
        });
      }).toThrow('Product properties are required');

      // Test with empty cart abandonment
      expect(() => {
        cartAbandoned({
          cart_id: '',
          cart_value: 100,
          products: [],
        });
      }).toThrow('Missing required properties: cart_id');

      // Test with negative step in checkout
      const result = checkoutProgressed({
        step_name: 'Invalid Step',
        action: 'viewed',
        step: -1,
      });
      expect(result.properties.step).toBe(-1); // Should preserve the value, validation is up to the application
    });

    test('should handle floating point precision in cart calculations', () => {
      const product = {
        product_id: 'p1',
        name: 'Precision Product',
        price: 99.99,
        quantity: 3,
      };

      const expectedTotal = 299.97; // 99.99 * 3

      const result = cartUpdated({
        action: 'updated',
        cart_total: expectedTotal,
        product,
      });

      expect(result.properties?.cart_total).toBe(expectedTotal);
      expect(result.properties?.price).toBe(99.99);
    });

    test('should maintain type safety across all cart emitters', () => {
      // This test ensures TypeScript types are working correctly

      // cartUpdated requires action and product
      const updateProps: CartUpdateProperties = {
        action: 'added',
        product: { product_id: 'p1' },
      };
      expect(() => cartUpdated(updateProps)).not.toThrow();

      // cartViewed accepts optional properties
      const viewProps: CartProperties = {};
      expect(() => cartViewed(viewProps)).not.toThrow();

      // cartAbandoned requires specific properties
      const abandonProps: CartAbandonmentProperties = {
        cart_id: 'c1',
        cart_value: 100,
        products: [],
      };
      expect(() => cartAbandoned(abandonProps)).not.toThrow();

      // checkoutProgressed requires specific properties
      const checkoutProps: CheckoutProgressProperties = {
        step_name: 'test',
        action: 'viewed',
        step: 1,
      };
      expect(() => checkoutProgressed(checkoutProps)).not.toThrow();
    });
  });
});
