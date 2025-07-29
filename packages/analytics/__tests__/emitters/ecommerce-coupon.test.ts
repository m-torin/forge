import { beforeEach, describe, expect } from 'vitest';

import { couponApplied, couponRemoved } from '@/shared/emitters/ecommerce/events/coupon';
import { ECOMMERCE_EVENTS } from '@/shared/emitters/ecommerce/types';

import type { CouponProperties } from '@/shared/emitters/ecommerce/types';

describe('coupon Emitters', () => {
  beforeEach(() => {
    // Clear any mocks if needed
  });

  describe('couponApplied', () => {
    test('should create a valid coupon applied event with all properties', () => {
      const properties: CouponProperties = {
        cart_id: 'cart_456',
        coupon_id: 'COUPON123',
        order_id: 'order_123',
        coupon_name: 'Summer Sale 20% Off',
        discount: 25.99,
        reason: 'First time customer discount',
      };

      const result = couponApplied(properties);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.COUPON_APPLIED,
        category: 'ecommerce',
        properties: {
          cart_id: 'cart_456',
          coupon_id: 'COUPON123',
          order_id: 'order_123',
          coupon_name: 'Summer Sale 20% Off',
          discount: 25.99,
          reason: 'First time customer discount',
        },
        requiredProperties: [],
      });
    });

    test('should create coupon applied event with minimal properties', () => {
      const properties: CouponProperties = {};

      const result = couponApplied(properties);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.COUPON_APPLIED,
        category: 'ecommerce',
        properties: {},
        requiredProperties: [],
      });
    });

    test('should create coupon applied event for cart', () => {
      const properties: CouponProperties = {
        cart_id: 'cart_789',
        coupon_id: 'CART10',
        coupon_name: '10% Off Cart',
        discount: 15.5,
      };

      const result = couponApplied(properties);

      expect(result.properties).toStrictEqual({
        cart_id: 'cart_789',
        coupon_id: 'CART10',
        coupon_name: '10% Off Cart',
        discount: 15.5,
      });
    });

    test('should create coupon applied event for order', () => {
      const properties: CouponProperties = {
        coupon_id: 'ORDER20',
        order_id: 'order_456',
        coupon_name: '20% Off Order',
        discount: 40.0,
      };

      const result = couponApplied(properties);

      expect(result.properties).toStrictEqual({
        coupon_id: 'ORDER20',
        order_id: 'order_456',
        coupon_name: '20% Off Order',
        discount: 40.0,
      });
    });

    test('should handle different discount amounts', () => {
      const discountAmounts = [5.99, 10.0, 25.5, 100.0, 0];

      discountAmounts.forEach(discount => {
        const properties: CouponProperties = {
          coupon_id: 'TEST_COUPON',
          discount,
        };

        const result = couponApplied(properties);
        expect(result.properties.discount).toBe(discount);
      });
    });

    test('should handle various coupon types and names', () => {
      const coupons = [
        { coupon_id: 'PERCENT20', coupon_name: '20% Off Everything' },
        { coupon_id: 'FIXED10', coupon_name: '$10 Off Your Order' },
        { coupon_id: 'FREESHIP', coupon_name: 'Free Shipping' },
        { coupon_id: 'BOGO50', coupon_name: 'Buy One Get One 50% Off' },
        { coupon_id: 'NEWUSER', coupon_name: 'New Customer 15% Off' },
      ];

      coupons.forEach(coupon => {
        const properties: CouponProperties = {
          ...coupon,
          cart_id: 'test_cart',
        };

        const result = couponApplied(properties);
        expect(result.properties.coupon_id).toBe(coupon.coupon_id);
        expect(result.properties.coupon_name).toBe(coupon.coupon_name);
      });
    });

    test('should clean undefined properties', () => {
      const properties: CouponProperties = {
        cart_id: undefined,
        coupon_id: 'TEST123',
        order_id: undefined,
        coupon_name: 'Test Coupon',
        discount: 10.0,
        reason: undefined,
      };

      const result = couponApplied(properties);

      expect(result.properties).toStrictEqual({
        coupon_id: 'TEST123',
        coupon_name: 'Test Coupon',
        discount: 10.0,
      });
      expect(result.properties).not.toHaveProperty('order_id');
      expect(result.properties).not.toHaveProperty('cart_id');
      expect(result.properties).not.toHaveProperty('reason');
    });

    test('should handle zero discount coupon', () => {
      const properties: CouponProperties = {
        coupon_id: 'FREE_ITEM',
        coupon_name: 'Free Gift with Purchase',
        discount: 0,
      };

      const result = couponApplied(properties);
      expect(result.properties.discount).toBe(0);
    });

    test('should handle coupon with reason/description', () => {
      const properties: CouponProperties = {
        coupon_id: 'LOYALTY10',
        coupon_name: 'Loyalty Member Discount',
        discount: 12.5,
        reason: 'Reward for customer loyalty',
      };

      const result = couponApplied(properties);

      expect(result.properties.reason).toBe('Reward for customer loyalty');
    });

    test('should handle both cart_id and order_id simultaneously', () => {
      const properties: CouponProperties = {
        cart_id: 'cart_123',
        coupon_id: 'CHECKOUT10',
        order_id: 'order_456', // Might happen during checkout conversion
        discount: 15.0,
      };

      const result = couponApplied(properties);

      expect(result.properties).toStrictEqual({
        cart_id: 'cart_123',
        coupon_id: 'CHECKOUT10',
        order_id: 'order_456',
        discount: 15.0,
      });
    });

    test('should handle special characters in coupon codes', () => {
      const properties: CouponProperties = {
        coupon_id: 'SAVE-20%_OFF!',
        coupon_name: 'Special Characters Coupon',
        discount: 20.0,
      };

      const result = couponApplied(properties);

      expect(result.properties.coupon_id).toBe('SAVE-20%_OFF!');
      expect(result.properties.coupon_name).toBe('Special Characters Coupon');
    });
  });

  describe('couponRemoved', () => {
    test('should create a valid coupon removed event with all properties', () => {
      const properties: CouponProperties = {
        cart_id: 'cart_456',
        coupon_id: 'REMOVE123',
        order_id: 'order_123',
        coupon_name: 'Removed Coupon',
        discount: 15.99,
        reason: 'Customer removed coupon',
      };

      const result = couponRemoved(properties);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.COUPON_REMOVED,
        category: 'ecommerce',
        properties: {
          cart_id: 'cart_456',
          coupon_id: 'REMOVE123',
          order_id: 'order_123',
          coupon_name: 'Removed Coupon',
          discount: 15.99,
          reason: 'Customer removed coupon',
        },
        requiredProperties: [],
      });
    });

    test('should create coupon removed event with minimal properties', () => {
      const properties: CouponProperties = {};

      const result = couponRemoved(properties);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.COUPON_REMOVED,
        category: 'ecommerce',
        properties: {},
        requiredProperties: [],
      });
    });

    test('should handle coupon removal from cart', () => {
      const properties: CouponProperties = {
        cart_id: 'cart_789',
        coupon_id: 'CART15',
        coupon_name: '15% Off Cart',
        discount: 22.5,
      };

      const result = couponRemoved(properties);

      expect(result.properties).toStrictEqual({
        cart_id: 'cart_789',
        coupon_id: 'CART15',
        coupon_name: '15% Off Cart',
        discount: 22.5,
      });
    });

    test('should handle coupon removal from order', () => {
      const properties: CouponProperties = {
        coupon_id: 'ORDER25',
        order_id: 'order_456',
        coupon_name: '25% Off Order',
        discount: 50.0,
      };

      const result = couponRemoved(properties);

      expect(result.properties).toStrictEqual({
        coupon_id: 'ORDER25',
        order_id: 'order_456',
        coupon_name: '25% Off Order',
        discount: 50.0,
      });
    });

    test('should handle different removal reasons', () => {
      const reasons = [
        'Customer manually removed',
        'Coupon expired during checkout',
        'Items no longer eligible',
        'Minimum order not met',
        'Better coupon applied',
        'System error',
      ];

      reasons.forEach(reason => {
        const properties: CouponProperties = {
          coupon_id: 'TEST_REMOVE',
          reason,
        };

        const result = couponRemoved(properties);
        expect(result.properties.reason).toBe(reason);
      });
    });

    test('should handle coupon removal with lost discount amount', () => {
      const properties: CouponProperties = {
        cart_id: 'cart_123',
        coupon_id: 'LOST_SAVINGS',
        coupon_name: 'Missed Opportunity Coupon',
        discount: 75.0, // Large discount that was lost
        reason: 'Coupon expired before checkout',
      };

      const result = couponRemoved(properties);

      expect(result.properties).toStrictEqual({
        cart_id: 'cart_123',
        coupon_id: 'LOST_SAVINGS',
        coupon_name: 'Missed Opportunity Coupon',
        discount: 75.0,
        reason: 'Coupon expired before checkout',
      });
    });

    test('should clean undefined properties', () => {
      const properties: CouponProperties = {
        cart_id: undefined,
        coupon_id: 'REMOVE_TEST',
        order_id: undefined,
        coupon_name: 'Removal Test Coupon',
        discount: 5.0,
        reason: undefined,
      };

      const result = couponRemoved(properties);

      expect(result.properties).toStrictEqual({
        coupon_id: 'REMOVE_TEST',
        coupon_name: 'Removal Test Coupon',
        discount: 5.0,
      });
      expect(result.properties).not.toHaveProperty('order_id');
      expect(result.properties).not.toHaveProperty('cart_id');
      expect(result.properties).not.toHaveProperty('reason');
    });

    test('should handle removal of zero-value coupon', () => {
      const properties: CouponProperties = {
        coupon_id: 'FREE_GIFT_REMOVED',
        coupon_name: 'Free Gift Coupon',
        discount: 0,
        reason: 'Free gift item out of stock',
      };

      const result = couponRemoved(properties);

      expect(result.properties.discount).toBe(0);
      expect(result.properties.reason).toBe('Free gift item out of stock');
    });

    test('should handle simultaneous cart and order context', () => {
      const properties: CouponProperties = {
        cart_id: 'cart_123',
        coupon_id: 'DUAL_CONTEXT',
        order_id: 'order_456',
        discount: 30.0,
        reason: 'Checkout conversion removed coupon',
      };

      const result = couponRemoved(properties);

      expect(result.properties).toStrictEqual({
        cart_id: 'cart_123',
        coupon_id: 'DUAL_CONTEXT',
        order_id: 'order_456',
        discount: 30.0,
        reason: 'Checkout conversion removed coupon',
      });
    });
  });

  // Integration and edge case tests
  describe('integration and Edge Cases', () => {
    test('should handle coupon lifecycle from apply to remove', () => {
      const couponData: CouponProperties = {
        cart_id: 'lifecycle_cart',
        coupon_id: 'LIFECYCLE_COUPON',
        coupon_name: 'Lifecycle Test Coupon',
        discount: 25.0,
      };

      // Apply coupon
      const appliedResult = couponApplied(couponData);

      // Remove same coupon (with reason)
      const removedResult = couponRemoved({
        ...couponData,
        reason: 'Customer changed mind',
      });

      // Both events should have consistent data
      expect(appliedResult.properties.cart_id).toBe(removedResult.properties.cart_id);
      expect(appliedResult.properties.coupon_id).toBe(removedResult.properties.coupon_id);
      expect(appliedResult.properties.discount).toBe(removedResult.properties.discount);

      // Events should be different types
      expect(appliedResult.name).toBe(ECOMMERCE_EVENTS.COUPON_APPLIED);
      expect(removedResult.name).toBe(ECOMMERCE_EVENTS.COUPON_REMOVED);
    });

    test('should handle multiple coupon operations in sequence', () => {
      const coupons = [
        { coupon_id: 'FIRST10', discount: 10.0 },
        { coupon_id: 'SECOND15', discount: 15.0 },
        { coupon_id: 'THIRD20', discount: 20.0 },
      ];

      const cartId = 'multi_coupon_cart';
      const results: any[] = [];

      // Apply multiple coupons
      coupons.forEach(coupon => {
        const applied = couponApplied({
          cart_id: cartId,
          ...coupon,
        });
        results.push(applied);
      });

      // Remove some coupons
      const removed = couponRemoved({
        cart_id: cartId,
        coupon_id: 'SECOND15',
        discount: 15.0,
        reason: 'Better coupon available',
      });
      results.push(removed);

      // All operations should reference the same cart
      results.forEach(result => {
        expect(result.properties.cart_id).toBe(cartId);
      });

      // Should have 4 total operations (3 applies + 1 remove)
      expect(results).toHaveLength(4);
    });

    test('should ensure consistent event naming', () => {
      const appliedEvent = couponApplied({ coupon_id: 'test' });
      const removedEvent = couponRemoved({ coupon_id: 'test' });

      // Event names should be valid ECOMMERCE_EVENTS
      expect(Object.values(ECOMMERCE_EVENTS)).toContain(appliedEvent.name);
      expect(Object.values(ECOMMERCE_EVENTS)).toContain(removedEvent.name);

      // Event names should be different
      expect(appliedEvent.name).not.toBe(removedEvent.name);
      expect(appliedEvent.name).toBe(ECOMMERCE_EVENTS.COUPON_APPLIED);
      expect(removedEvent.name).toBe(ECOMMERCE_EVENTS.COUPON_REMOVED);
    });

    test('should handle edge cases with special characters and formatting', () => {
      const edgeCaseProperties: CouponProperties = {
        coupon_id: 'SPECIAL-chars_123!@#',
        coupon_name: 'Coupon with "quotes" & ampersands',
        discount: 99.99,
        reason: 'Edge case testing with special characters: <>&"\'',
      };

      const appliedResult = couponApplied(edgeCaseProperties);
      const removedResult = couponRemoved(edgeCaseProperties);

      // Both should handle special characters correctly
      expect(appliedResult.properties.coupon_id).toBe('SPECIAL-chars_123!@#');
      expect(appliedResult.properties.coupon_name).toBe('Coupon with "quotes" & ampersands');
      expect(removedResult.properties.reason).toBe(
        'Edge case testing with special characters: <>&"\'',
      );
    });

    test('should handle very large discount values', () => {
      const largeDiscountProperties: CouponProperties = {
        coupon_id: 'MASSIVE_DISCOUNT',
        coupon_name: 'Huge Sale Coupon',
        discount: 9999.99,
      };

      const appliedResult = couponApplied(largeDiscountProperties);
      const removedResult = couponRemoved(largeDiscountProperties);

      expect(appliedResult.properties.discount).toBe(9999.99);
      expect(removedResult.properties.discount).toBe(9999.99);
    });

    test('should handle floating point precision correctly', () => {
      const precisionTest: CouponProperties = {
        coupon_id: 'PRECISION_TEST',
        discount: 12.345, // Floating point with decimals
      };

      const appliedResult = couponApplied(precisionTest);
      const removedResult = couponRemoved(precisionTest);

      expect(appliedResult.properties.discount).toBe(12.345);
      expect(removedResult.properties.discount).toBe(12.345);
    });

    test('should maintain type safety across both emitters', () => {
      // This test ensures TypeScript types are working correctly

      // Both emitters accept CouponProperties
      const validProps: CouponProperties = {
        coupon_id: 'TYPE_SAFE',
        coupon_name: 'Type Safety Test',
        discount: 10.0,
      };

      expect(() => couponApplied(validProps)).not.toThrow();
      expect(() => couponRemoved(validProps)).not.toThrow();

      // Both emitters accept empty properties
      expect(() => couponApplied({})).not.toThrow();
      expect(() => couponRemoved({})).not.toThrow();
    });

    test('should handle performance with rapid coupon operations', () => {
      const operations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < operations; i++) {
        const properties: CouponProperties = {
          cart_id: `cart_${i}`,
          coupon_id: `PERF_TEST_${i}`,
          discount: Math.random() * 100,
        };

        // Alternate between apply and remove
        if (i % 2 === 0) {
          couponApplied(properties);
        } else {
          couponRemoved(properties);
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete 1000 operations in under 100ms
      expect(duration).toBeLessThan(100);
    });

    test('should validate required properties structure', () => {
      // Both emitters should have empty required properties arrays
      const appliedEvent = couponApplied({});
      const removedEvent = couponRemoved({});

      expect(appliedEvent.requiredProperties).toStrictEqual([]);
      expect(removedEvent.requiredProperties).toStrictEqual([]);

      // Both should have ecommerce category
      expect(appliedEvent.category).toBe('ecommerce');
      expect(removedEvent.category).toBe('ecommerce');
    });

    test('should handle cart-to-order conversion scenario', () => {
      const couponData = {
        coupon_id: 'CONVERSION_COUPON',
        coupon_name: 'Cart to Order Coupon',
        discount: 35.0,
      };

      // 1. Apply to cart
      const cartApplied = couponApplied({
        ...couponData,
        cart_id: 'conversion_cart',
      });

      // 2. Remove from cart during checkout
      const cartRemoved = couponRemoved({
        ...couponData,
        cart_id: 'conversion_cart',
        reason: 'Converting to order',
      });

      // 3. Apply to order
      const orderApplied = couponApplied({
        ...couponData,
        order_id: 'conversion_order',
      });

      // All should maintain consistent coupon data
      expect(cartApplied.properties.coupon_id).toBe(couponData.coupon_id);
      expect(cartRemoved.properties.coupon_id).toBe(couponData.coupon_id);
      expect(orderApplied.properties.coupon_id).toBe(couponData.coupon_id);

      // Contexts should be different
      expect(cartApplied.properties.cart_id).toBe('conversion_cart');
      expect(cartRemoved.properties.cart_id).toBe('conversion_cart');
      expect(orderApplied.properties.order_id).toBe('conversion_order');
    });
  });
});
