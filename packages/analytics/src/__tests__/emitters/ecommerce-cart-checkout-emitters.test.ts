import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  cartUpdated,
  cartViewed,
  cartAbandoned,
  checkoutProgressed,
} from '../../shared/emitters/ecommerce/events/cart-checkout';
import { ECOMMERCE_EVENTS } from '../../shared/emitters/ecommerce/types';
import type {
  CartProperties,
  CartUpdateProperties,
  CartAbandonmentProperties,
  CheckoutProgressProperties,
  BaseProductProperties,
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

describe('Cart and Checkout Emitters', () => {
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

    it('should create a valid cart update event for adding a product', () => {
      const properties: CartUpdateProperties = {
        action: 'added',
        product: baseProduct,
        quantity_change: 2,
        cart_total: 199.98,
        cart_id: 'cart123',
      };

      const result = cartUpdated(properties);

      expect(result).toEqual({
        event: ECOMMERCE_EVENTS.CART_UPDATED,
        properties: {
          action: 'added',
          product_id: 'p123',
          name: 'Test Product',
          price: 99.99,
          quantity: 2,
          quantity_change: 2,
          cart_total: 199.98,
          cart_id: 'cart123',
        },
        context: { category: 'ecommerce' },
        options: undefined,
      });
    });

    it('should create a valid cart update event for removing a product', () => {
      const properties: CartUpdateProperties = {
        action: 'removed',
        product: baseProduct,
        quantity_change: -1,
        cart_total: 99.99,
        cart_id: 'cart123',
      };

      const result = cartUpdated(properties);

      expect(result.properties).toMatchObject({
        action: 'removed',
        product_id: 'p123',
        quantity_change: -1,
        cart_total: 99.99,
      });
    });

    it('should create a valid cart update event for updating a product', () => {
      const properties: CartUpdateProperties = {
        action: 'updated',
        product: baseProduct,
        quantity_change: 1,
        cart_total: 299.97,
      };

      const result = cartUpdated(properties);

      expect(result.properties).toMatchObject({
        action: 'updated',
        product_id: 'p123',
        quantity_change: 1,
        cart_total: 299.97,
      });
    });

    it('should accept emitter options', () => {
      const properties: CartUpdateProperties = {
        action: 'added',
        product: baseProduct,
      };
      const options = { userId: 'user123', timestamp: new Date() };

      const result = cartUpdated(properties, options);

      expect(result.options).toBe(options);
    });

    it('should normalize product properties', () => {
      const rawProduct = {
        productId: 'p456', // Should normalize to product_id
        title: 'Raw Product', // Should normalize to name
        price: '149.99', // Should normalize to number
        manufacturer: 'Brand X', // Should normalize to brand
      };

      const properties: CartUpdateProperties = {
        action: 'added',
        product: rawProduct as any,
      };

      const result = cartUpdated(properties);

      expect(result.properties).toMatchObject({
        action: 'added',
        product_id: 'p456',
        name: 'Raw Product',
        price: 149.99,
        brand: 'Brand X',
      });
    });

    it('should handle minimal properties', () => {
      const properties: CartUpdateProperties = {
        action: 'added',
        product: { product_id: 'p1' },
      };

      const result = cartUpdated(properties);

      expect(result.properties).toEqual({
        action: 'added',
        product_id: 'p1',
      });
    });

    it('should clean undefined properties', () => {
      const properties: CartUpdateProperties = {
        action: 'added',
        product: baseProduct,
        quantity_change: undefined,
        cart_total: undefined,
        cart_id: undefined,
      };

      const result = cartUpdated(properties);

      expect(result.properties).not.toHaveProperty('quantity_change');
      expect(result.properties).not.toHaveProperty('cart_total');
      expect(result.properties).not.toHaveProperty('cart_id');
    });

    it('should throw error when action is missing', () => {
      expect(() => {
        cartUpdated({ product: baseProduct } as any);
      }).toThrow('Missing required properties: action');
    });

    it('should throw error when product ID is missing', () => {
      expect(() => {
        cartUpdated({
          action: 'added',
          product: { name: 'No ID Product' },
        } as any);
      }).toThrow('Product must have an id');
    });

    it('should handle different action types', () => {
      const actions = ['added', 'removed', 'updated'] as const;

      actions.forEach((action) => {
        const properties: CartUpdateProperties = {
          action,
          product: baseProduct,
        };

        const result = cartUpdated(properties);
        expect(result.properties.action).toBe(action);
      });
    });

    it('should handle zero cart total', () => {
      const properties: CartUpdateProperties = {
        action: 'removed',
        product: baseProduct,
        cart_total: 0,
      };

      const result = cartUpdated(properties);
      expect(result.properties.cart_total).toBe(0);
    });

    it('should handle negative quantity changes', () => {
      const properties: CartUpdateProperties = {
        action: 'removed',
        product: baseProduct,
        quantity_change: -5,
      };

      const result = cartUpdated(properties);
      expect(result.properties.quantity_change).toBe(-5);
    });
  });

  describe('cartViewed', () => {
    it('should create a valid cart viewed event with minimal properties', () => {
      const properties: CartProperties = {};

      const result = cartViewed(properties);

      expect(result).toEqual({
        name: ECOMMERCE_EVENTS.CART_VIEWED,
        category: 'ecommerce',
        requiredProperties: [],
        properties: {},
      });
    });

    it('should create a valid cart viewed event with cart ID', () => {
      const properties: CartProperties = {
        cart_id: 'cart123',
      };

      const result = cartViewed(properties);

      expect(result).toEqual({
        name: ECOMMERCE_EVENTS.CART_VIEWED,
        category: 'ecommerce',
        requiredProperties: [],
        properties: {
          cart_id: 'cart123',
        },
      });
    });

    it('should create a valid cart viewed event with products', () => {
      const products = [
        { product_id: 'p1', name: 'Product 1', price: 99.99 },
        { product_id: 'p2', name: 'Product 2', price: 149.99 },
      ];

      const properties: CartProperties = {
        cart_id: 'cart123',
        products,
      };

      const result = cartViewed(properties);

      expect(result.properties).toEqual({
        cart_id: 'cart123',
        products,
      });
    });

    it('should normalize products when provided', () => {
      const rawProducts = [
        { productId: 'p1', title: 'Product 1', price: '99.99' },
        { id: 'p2', name: 'Product 2', price: 149.99 },
      ];

      const properties: CartProperties = {
        cart_id: 'cart123',
        products: rawProducts as any,
      };

      const result = cartViewed(properties);

      expect(result.properties.products).toEqual([
        { product_id: 'p1', name: 'Product 1', price: 99.99 },
        { product_id: 'p2', name: 'Product 2', price: 149.99 },
      ]);
    });

    it('should handle empty products array', () => {
      const properties: CartProperties = {
        cart_id: 'cart123',
        products: [],
      };

      const result = cartViewed(properties);

      expect(result.properties.products).toEqual([]);
    });

    it('should clean undefined properties', () => {
      const properties: CartProperties = {
        cart_id: 'cart123',
        products: undefined,
      };

      const result = cartViewed(properties);

      expect(result.properties).toEqual({
        cart_id: 'cart123',
      });
      expect(result.properties).not.toHaveProperty('products');
    });

    it('should handle large product arrays efficiently', () => {
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

    it('should create a valid cart abandoned event', () => {
      const properties: CartAbandonmentProperties = {
        cart_id: 'cart123',
        cart_value: 349.97,
        products: baseProducts,
        abandonment_reason: 'timeout',
        time_in_cart: 1800, // 30 minutes
      };

      const result = cartAbandoned(properties);

      expect(result).toEqual({
        name: ECOMMERCE_EVENTS.CART_ABANDONED,
        category: 'ecommerce',
        requiredProperties: ['cart_id', 'cart_value'],
        properties: {
          cart_id: 'cart123',
          cart_value: 349.97,
          products: baseProducts,
          abandonment_reason: 'timeout',
          time_in_cart: 1800,
        },
      });
    });

    it('should create a valid cart abandoned event with minimal properties', () => {
      const properties: CartAbandonmentProperties = {
        cart_id: 'cart456',
        cart_value: 199.99,
        products: baseProducts,
      };

      const result = cartAbandoned(properties);

      expect(result.properties).toEqual({
        cart_id: 'cart456',
        cart_value: 199.99,
        products: baseProducts,
      });
    });

    it('should handle different abandonment reasons', () => {
      const reasons = ['timeout', 'navigation', 'closed'] as const;

      reasons.forEach((reason) => {
        const properties: CartAbandonmentProperties = {
          cart_id: 'cart123',
          cart_value: 100,
          products: baseProducts,
          abandonment_reason: reason,
        };

        const result = cartAbandoned(properties);
        expect(result.properties.abandonment_reason).toBe(reason);
      });
    });

    it('should normalize products', () => {
      const rawProducts = [
        { productId: 'p1', title: 'Product 1', price: '99.99' },
        { id: 'p2', name: 'Product 2', price: 149.99 },
      ];

      const properties: CartAbandonmentProperties = {
        cart_id: 'cart123',
        cart_value: 249.98,
        products: rawProducts as any,
      };

      const result = cartAbandoned(properties);

      expect(result.properties.products).toEqual([
        { product_id: 'p1', name: 'Product 1', price: 99.99 },
        { product_id: 'p2', name: 'Product 2', price: 149.99 },
      ]);
    });

    it('should throw error when cart_id is missing', () => {
      expect(() => {
        cartAbandoned({
          cart_value: 100,
          products: baseProducts,
        } as any);
      }).toThrow('Missing required properties: cart_id');
    });

    it('should throw error when cart_value is missing', () => {
      expect(() => {
        cartAbandoned({
          cart_id: 'cart123',
          products: baseProducts,
        } as any);
      }).toThrow('Missing required properties: cart_value');
    });

    it('should throw error when both required properties are missing', () => {
      expect(() => {
        cartAbandoned({
          products: baseProducts,
        } as any);
      }).toThrow('Missing required properties: cart_id, cart_value');
    });

    it('should handle zero cart value', () => {
      const properties: CartAbandonmentProperties = {
        cart_id: 'cart123',
        cart_value: 0,
        products: [],
      };

      const result = cartAbandoned(properties);
      expect(result.properties.cart_value).toBe(0);
    });

    it('should handle empty products array', () => {
      const properties: CartAbandonmentProperties = {
        cart_id: 'cart123',
        cart_value: 0,
        products: [],
      };

      const result = cartAbandoned(properties);
      expect(result.properties.products).toEqual([]);
    });

    it('should handle zero time in cart', () => {
      const properties: CartAbandonmentProperties = {
        cart_id: 'cart123',
        cart_value: 100,
        products: baseProducts,
        time_in_cart: 0,
      };

      const result = cartAbandoned(properties);
      expect(result.properties.time_in_cart).toBe(0);
    });

    it('should clean undefined properties', () => {
      const properties: CartAbandonmentProperties = {
        cart_id: 'cart123',
        cart_value: 100,
        products: baseProducts,
        abandonment_reason: undefined,
        time_in_cart: undefined,
      };

      const result = cartAbandoned(properties);

      expect(result.properties).toEqual({
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

    it('should create a valid checkout progress event', () => {
      const properties: CheckoutProgressProperties = {
        step: 1,
        step_name: 'Shipping Information',
        action: 'viewed',
        products: baseProducts,
        checkout_id: 'checkout123',
        payment_method: 'credit_card',
        shipping_method: 'standard',
      };

      const result = checkoutProgressed(properties);

      expect(result).toEqual({
        name: ECOMMERCE_EVENTS.CHECKOUT_PROGRESSED,
        category: 'ecommerce',
        requiredProperties: ['step', 'step_name', 'action'],
        properties: {
          step: 1,
          step_name: 'Shipping Information',
          action: 'viewed',
          products: baseProducts,
          checkout_id: 'checkout123',
          payment_method: 'credit_card',
          shipping_method: 'standard',
        },
      });
    });

    it('should create a valid checkout progress event with minimal properties', () => {
      const properties: CheckoutProgressProperties = {
        step: 2,
        step_name: 'Payment Information',
        action: 'completed',
      };

      const result = checkoutProgressed(properties);

      expect(result.properties).toEqual({
        step: 2,
        step_name: 'Payment Information',
        action: 'completed',
      });
    });

    it('should handle different step actions', () => {
      const actions = ['viewed', 'completed', 'abandoned', 'error'] as const;

      actions.forEach((action, index) => {
        const properties: CheckoutProgressProperties = {
          step: index + 1,
          step_name: `Step ${index + 1}`,
          action,
        };

        const result = checkoutProgressed(properties);
        expect(result.properties.action).toBe(action);
      });
    });

    it('should handle checkout error with error message', () => {
      const properties: CheckoutProgressProperties = {
        step: 3,
        step_name: 'Payment Processing',
        action: 'error',
        error_message: 'Credit card declined',
        checkout_id: 'checkout123',
      };

      const result = checkoutProgressed(properties);

      expect(result.properties).toMatchObject({
        step: 3,
        step_name: 'Payment Processing',
        action: 'error',
        error_message: 'Credit card declined',
        checkout_id: 'checkout123',
      });
    });

    it('should normalize products when provided', () => {
      const rawProducts = [
        { productId: 'p1', title: 'Product 1', price: '99.99' },
        { id: 'p2', name: 'Product 2', price: 149.99 },
      ];

      const properties: CheckoutProgressProperties = {
        step: 1,
        step_name: 'Review Order',
        action: 'viewed',
        products: rawProducts as any,
      };

      const result = checkoutProgressed(properties);

      expect(result.properties.products).toEqual([
        { product_id: 'p1', name: 'Product 1', price: 99.99 },
        { product_id: 'p2', name: 'Product 2', price: 149.99 },
      ]);
    });

    it('should handle different payment methods', () => {
      const paymentMethods = ['credit_card', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer'];

      paymentMethods.forEach((method) => {
        const properties: CheckoutProgressProperties = {
          step: 2,
          step_name: 'Payment',
          action: 'viewed',
          payment_method: method,
        };

        const result = checkoutProgressed(properties);
        expect(result.properties.payment_method).toBe(method);
      });
    });

    it('should handle different shipping methods', () => {
      const shippingMethods = ['standard', 'express', 'overnight', 'pickup', 'digital'];

      shippingMethods.forEach((method) => {
        const properties: CheckoutProgressProperties = {
          step: 1,
          step_name: 'Shipping',
          action: 'viewed',
          shipping_method: method,
        };

        const result = checkoutProgressed(properties);
        expect(result.properties.shipping_method).toBe(method);
      });
    });

    it('should throw error when step is missing', () => {
      expect(() => {
        checkoutProgressed({
          step_name: 'Step Name',
          action: 'viewed',
        } as any);
      }).toThrow('Missing required properties: step');
    });

    it('should throw error when step_name is missing', () => {
      expect(() => {
        checkoutProgressed({
          step: 1,
          action: 'viewed',
        } as any);
      }).toThrow('Missing required properties: step_name');
    });

    it('should throw error when action is missing', () => {
      expect(() => {
        checkoutProgressed({
          step: 1,
          step_name: 'Step Name',
        } as any);
      }).toThrow('Missing required properties: action');
    });

    it('should throw error when multiple required properties are missing', () => {
      expect(() => {
        checkoutProgressed({} as any);
      }).toThrow('Missing required properties: step, step_name, action');
    });

    it('should handle step 0', () => {
      const properties: CheckoutProgressProperties = {
        step: 0,
        step_name: 'Cart Review',
        action: 'viewed',
      };

      const result = checkoutProgressed(properties);
      expect(result.properties.step).toBe(0);
    });

    it('should handle empty products array', () => {
      const properties: CheckoutProgressProperties = {
        step: 1,
        step_name: 'Empty Cart',
        action: 'viewed',
        products: [],
      };

      const result = checkoutProgressed(properties);
      expect(result.properties.products).toEqual([]);
    });

    it('should clean undefined properties', () => {
      const properties: CheckoutProgressProperties = {
        step: 1,
        step_name: 'Shipping',
        action: 'viewed',
        error_message: undefined,
        products: undefined,
        checkout_id: undefined,
        payment_method: undefined,
        shipping_method: undefined,
      };

      const result = checkoutProgressed(properties);

      expect(result.properties).toEqual({
        step: 1,
        step_name: 'Shipping',
        action: 'viewed',
      });
    });

    it('should handle complex checkout flow scenario', () => {
      const checkoutSteps = [
        { step: 1, step_name: 'Shipping Info', action: 'viewed' as const },
        { step: 1, step_name: 'Shipping Info', action: 'completed' as const },
        { step: 2, step_name: 'Payment Info', action: 'viewed' as const },
        { step: 2, step_name: 'Payment Info', action: 'error' as const, error_message: 'Invalid card' },
        { step: 2, step_name: 'Payment Info', action: 'viewed' as const },
        { step: 2, step_name: 'Payment Info', action: 'completed' as const },
        { step: 3, step_name: 'Review Order', action: 'viewed' as const },
        { step: 3, step_name: 'Review Order', action: 'completed' as const },
      ];

      checkoutSteps.forEach((stepData) => {
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

        if (stepData.error_message) {
          expect(result.properties.error_message).toBe(stepData.error_message);
        }
      });
    });
  });

  // Edge cases and integration tests
  describe('Edge Cases and Integration', () => {
    it('should handle very large product arrays in cart operations efficiently', () => {
      const largeProductList = Array.from({ length: 5000 }, (_, i) => ({
        product_id: `p${i}`,
        name: `Product ${i}`,
        price: Math.random() * 1000,
        quantity: Math.floor(Math.random() * 10) + 1,
      }));

      const cartValue = largeProductList.reduce((sum, product) => 
        sum + (product.price * product.quantity), 0
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

    it('should maintain data consistency across cart lifecycle', () => {
      const product = { product_id: 'p1', name: 'Lifecycle Product', price: 99.99 };

      // 1. Add to cart
      const addResult = cartUpdated({
        action: 'added',
        product,
        quantity_change: 1,
        cart_total: 99.99,
        cart_id: 'lifecycle_cart',
      });

      // 2. View cart
      const viewResult = cartViewed({
        cart_id: 'lifecycle_cart',
        products: [product],
      });

      // 3. Update cart
      const updateResult = cartUpdated({
        action: 'updated',
        product: { ...product, quantity: 2 },
        quantity_change: 1,
        cart_total: 199.98,
        cart_id: 'lifecycle_cart',
      });

      // 4. Start checkout
      const checkoutResult = checkoutProgressed({
        step: 1,
        step_name: 'Shipping',
        action: 'viewed',
        products: [{ ...product, quantity: 2 }],
        checkout_id: 'checkout_lifecycle',
      });

      // All operations should maintain consistent cart_id
      expect(addResult.properties.cart_id).toBe('lifecycle_cart');
      expect(viewResult.properties.cart_id).toBe('lifecycle_cart');
      expect(updateResult.properties.cart_id).toBe('lifecycle_cart');
      expect(checkoutResult.properties.checkout_id).toBe('checkout_lifecycle');

      // Product data should be consistent
      expect(addResult.properties.product_id).toBe('p1');
      expect(viewResult.properties.products![0].product_id).toBe('p1');
      expect(updateResult.properties.product_id).toBe('p1');
      expect(checkoutResult.properties.products![0].product_id).toBe('p1');
    });

    it('should ensure consistent event naming across all cart emitters', () => {
      const eventNames = [
        cartUpdated({ action: 'added', product: { product_id: 'p1' } }).event,
        cartViewed({}).name,
        cartAbandoned({ cart_id: 'c1', cart_value: 100, products: [] }).name,
        checkoutProgressed({ step: 1, step_name: 'test', action: 'viewed' }).name,
      ];

      // All event names should be valid ECOMMERCE_EVENTS
      eventNames.forEach((eventName) => {
        expect(Object.values(ECOMMERCE_EVENTS)).toContain(eventName);
      });

      // Event names should be unique
      const uniqueNames = new Set(eventNames);
      expect(uniqueNames.size).toBe(eventNames.length);
    });

    it('should handle malformed data gracefully', () => {
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
        step: -1,
        step_name: 'Invalid Step',
        action: 'viewed',
      });
      expect(result.properties.step).toBe(-1); // Should preserve the value, validation is up to the application
    });

    it('should handle floating point precision in cart calculations', () => {
      const product = {
        product_id: 'p1',
        name: 'Precision Product',
        price: 99.99,
        quantity: 3,
      };

      const expectedTotal = 299.97; // 99.99 * 3

      const result = cartUpdated({
        action: 'updated',
        product,
        cart_total: expectedTotal,
      });

      expect(result.properties.cart_total).toBe(expectedTotal);
      expect(result.properties.price).toBe(99.99);
    });

    it('should maintain type safety across all cart emitters', () => {
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
        step: 1,
        step_name: 'test',
        action: 'viewed',
      };
      expect(() => checkoutProgressed(checkoutProps)).not.toThrow();
    });
  });
});