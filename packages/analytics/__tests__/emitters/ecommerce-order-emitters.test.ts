import { beforeEach, describe, expect, vi } from 'vitest';

import {
  orderCancelled,
  orderCompleted,
  orderFailed,
  orderRefunded,
  orderStatusUpdated,
  returnCompleted,
  returnRequested,
} from '@/shared/emitters/ecommerce/events/order';
import { ECOMMERCE_EVENTS } from '@/shared/emitters/ecommerce/types';

import type {
  BaseProductProperties,
  OrderProperties,
  OrderStatusProperties,
  ReturnProperties,
} from '@/shared/emitters/ecommerce/types';

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

describe('order Emitters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('orderCompleted', () => {
    const baseOrderProperties: OrderProperties = {
      order_id: 'order_123',
      affiliation: 'Online Store',
      coupon: 'SAVE10',
      currency: 'USD',
      discount: 10.0,
      revenue: 259.99,
      shipping: 15.0,
      tax: 25.0,
      total: 299.99,
    };

    test('should create a valid order completed event', () => {
      const result = orderCompleted(baseOrderProperties);

      expect(result).toStrictEqual({
        type: 'track',
        event: ECOMMERCE_EVENTS.ORDER_COMPLETED,
        context: {
          traits: {
            event_category: 'ecommerce',
          },
        },
        properties: {
          order_id: 'order_123',
          affiliation: 'Online Store',
          coupon: 'SAVE10',
          currency: 'USD',
          discount: 10.0,
          revenue: 259.99,
          shipping: 15.0,
          tax: 25.0,
          total: 299.99,
        },
      });
    });

    test('should create order completed event with products', () => {
      const products: BaseProductProperties[] = [
        { product_id: 'p1', name: 'Product 1', price: 99.99, quantity: 2 },
        { product_id: 'p2', name: 'Product 2', price: 149.99, quantity: 1 },
      ];

      const properties: OrderProperties = {
        ...baseOrderProperties,
        products,
      };

      const result = orderCompleted(properties);

      expect(result.properties!.products).toStrictEqual(products);
    });

    test('should normalize products when provided', () => {
      const rawProducts = [
        { price: '99.99', productId: 'p1', title: 'Product 1' },
        { id: 'p2', name: 'Product 2', price: 149.99 },
      ];

      const properties: OrderProperties = {
        ...baseOrderProperties,
        products: rawProducts as any,
      };

      const result = orderCompleted(properties);

      expect(result.properties!.products).toStrictEqual([
        { product_id: 'p1', name: 'Product 1', price: 99.99 },
        { product_id: 'p2', name: 'Product 2', price: 149.99 },
      ]);
    });

    test('should validate and normalize currency', () => {
      const properties: OrderProperties = {
        ...baseOrderProperties,
        currency: 'eur',
      };

      const result = orderCompleted(properties);
      expect(result.properties!.currency).toBe('EUR');
    });

    test('should handle invalid currency gracefully', () => {
      const properties: OrderProperties = {
        ...baseOrderProperties,
        currency: 'invalid',
      };

      const result = orderCompleted(properties);
      expect(result.properties!.currency).toBeUndefined();
    });

    test('should accept emitter options', () => {
      const options = { context: { traits: { userId: 'user123' } }, timestamp: new Date() };
      const result = orderCompleted(baseOrderProperties, options);

      expect(result.timestamp).toBe(options.timestamp);
      expect(result.context?.traits?.userId).toBe('user123');
    });

    test('should handle minimal order properties', () => {
      const minimal: OrderProperties = { order_id: 'order_456' };
      const result = orderCompleted(minimal);

      expect(result.properties).toStrictEqual({ order_id: 'order_456' });
    });

    test('should clean undefined properties', () => {
      const properties: OrderProperties = {
        order_id: 'order_123',
        coupon: undefined,
        currency: undefined,
        discount: undefined,
        products: undefined,
        revenue: undefined,
        shipping: undefined,
        tax: undefined,
        total: 100.0,
      };

      const result = orderCompleted(properties);

      expect(result.properties).toStrictEqual({
        order_id: 'order_123',
        total: 100.0,
      });
    });

    test('should throw error when order_id is missing', () => {
      expect(() => {
        orderCompleted({ total: 100 } as any);
      }).toThrow('Missing required properties: order_id');
    });

    test('should handle zero values correctly', () => {
      const properties: OrderProperties = {
        order_id: 'order_123',
        discount: 0,
        revenue: 0,
        shipping: 0,
        tax: 0,
        total: 0,
      };

      const result = orderCompleted(properties);

      expect(result.properties).toMatchObject({
        order_id: 'order_123',
        discount: 0,
        revenue: 0,
        shipping: 0,
        tax: 0,
        total: 0,
      });
    });
  });

  describe('orderFailed', () => {
    const baseOrderProperties: OrderProperties = {
      order_id: 'order_failed_123',
      currency: 'USD',
      total: 199.99,
    };

    test('should create a valid order failed event', () => {
      const properties = {
        ...baseOrderProperties,
        error_code: 'CARD_DECLINED',
        failure_reason: 'Credit card declined',
      };

      const result = orderFailed(properties);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.ORDER_FAILED,
        category: 'ecommerce',
        properties: {
          order_id: 'order_failed_123',
          currency: 'USD',
          error_code: 'CARD_DECLINED',
          failure_reason: 'Credit card declined',
          total: 199.99,
        },
        requiredProperties: ['order_id'],
      });
    });

    test('should handle order failure without error details', () => {
      const result = orderFailed(baseOrderProperties);

      expect(result.properties).toStrictEqual({
        order_id: 'order_failed_123',
        currency: 'USD',
        total: 199.99,
      });
    });

    test('should handle different failure reasons', () => {
      const failureReasons = [
        'Payment declined',
        'Insufficient funds',
        'Address verification failed',
        'Fraud detection triggered',
        'System timeout',
      ];

      failureReasons.forEach(reason => {
        const properties = {
          ...baseOrderProperties,
          failure_reason: reason,
        };

        const result = orderFailed(properties);
        expect(result.properties!.failure_reason).toBe(reason);
      });
    });

    test('should handle different error codes', () => {
      const errorCodes = [
        'CARD_DECLINED',
        'INSUFFICIENT_FUNDS',
        'EXPIRED_CARD',
        'CVC_FAILED',
        'FRAUD_DETECTED',
        'SYSTEM_ERROR',
      ];

      errorCodes.forEach(code => {
        const properties = {
          ...baseOrderProperties,
          error_code: code,
        };

        const result = orderFailed(properties);
        expect(result.properties!.error_code).toBe(code);
      });
    });

    test('should normalize products in failed order', () => {
      const products = [{ price: '99.99', productId: 'p1', title: 'Failed Product' }];

      const properties = {
        ...baseOrderProperties,
        failure_reason: 'Payment failed',
        products: products as any,
      };

      const result = orderFailed(properties);

      expect(result.properties!.products).toStrictEqual([
        { product_id: 'p1', name: 'Failed Product', price: 99.99 },
      ]);
    });

    test('should throw error when order_id is missing', () => {
      expect(() => {
        orderFailed({ failure_reason: 'test', total: 100 } as any);
      }).toThrow('Missing required properties: order_id');
    });

    test('should clean undefined properties', () => {
      const properties = {
        order_id: 'order_123',
        error_code: undefined,
        failure_reason: 'Payment failed',
        revenue: undefined,
        total: 100,
      };

      const result = orderFailed(properties);

      expect(result.properties).toStrictEqual({
        order_id: 'order_123',
        failure_reason: 'Payment failed',
        total: 100,
      });
    });
  });

  describe('orderRefunded', () => {
    const baseOrderProperties: OrderProperties = {
      order_id: 'order_refund_123',
      currency: 'USD',
      revenue: 259.99,
      total: 299.99,
    };

    test('should create a valid order refunded event', () => {
      const result = orderRefunded(baseOrderProperties);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.ORDER_REFUNDED,
        category: 'ecommerce',
        properties: {
          order_id: 'order_refund_123',
          currency: 'USD',
          revenue: 259.99,
          total: 299.99,
        },
        requiredProperties: ['order_id'],
      });
    });

    test('should handle partial refund with products', () => {
      const products: BaseProductProperties[] = [
        { product_id: 'p1', name: 'Refunded Product', price: 99.99, quantity: 1 },
      ];

      const properties: OrderProperties = {
        ...baseOrderProperties,
        products,
        total: 99.99, // Partial refund amount
      };

      const result = orderRefunded(properties);

      expect(result.properties!.products).toStrictEqual(products);
      expect(result.properties!.total).toBe(99.99);
    });

    test('should normalize currency', () => {
      const properties: OrderProperties = {
        ...baseOrderProperties,
        currency: 'gbp',
      };

      const result = orderRefunded(properties);
      expect(result.properties!.currency).toBe('GBP');
    });

    test('should handle full refund', () => {
      const properties: OrderProperties = {
        order_id: 'order_123',
        revenue: 299.99, // Full refund
        shipping: 15.0,
        tax: 25.0,
        total: 299.99,
      };

      const result = orderRefunded(properties);

      expect(result.properties).toMatchObject({
        order_id: 'order_123',
        revenue: 299.99,
        shipping: 15.0,
        tax: 25.0,
        total: 299.99,
      });
    });

    test('should throw error when order_id is missing', () => {
      expect(() => {
        orderRefunded({ total: 100 } as any);
      }).toThrow('Missing required properties: order_id');
    });

    test('should clean undefined properties', () => {
      const properties: OrderProperties = {
        order_id: 'order_123',
        revenue: undefined,
        shipping: undefined,
        total: 100,
      };

      const result = orderRefunded(properties);

      expect(result.properties).toStrictEqual({
        order_id: 'order_123',
        total: 100,
      });
    });
  });

  describe('orderCancelled', () => {
    const baseOrderProperties: OrderProperties = {
      order_id: 'order_cancel_123',
      currency: 'USD',
      total: 199.99,
    };

    test('should create a valid order cancelled event', () => {
      const result = orderCancelled(baseOrderProperties);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.ORDER_CANCELLED,
        category: 'ecommerce',
        properties: {
          order_id: 'order_cancel_123',
          currency: 'USD',
          total: 199.99,
        },
        requiredProperties: ['order_id'],
      });
    });

    test('should handle cancellation with products', () => {
      const products: BaseProductProperties[] = [
        { product_id: 'p1', name: 'Cancelled Product', price: 99.99 },
        { product_id: 'p2', name: 'Another Cancelled Product', price: 99.99 },
      ];

      const properties: OrderProperties = {
        ...baseOrderProperties,
        products,
      };

      const result = orderCancelled(properties);

      expect(result.properties!.products).toStrictEqual(products);
    });

    test('should normalize products when provided', () => {
      const rawProducts = [{ productId: 'p1', title: 'Cancelled Product' }];

      const properties: OrderProperties = {
        ...baseOrderProperties,
        products: rawProducts as any,
      };

      const result = orderCancelled(properties);

      expect(result.properties!.products).toStrictEqual([
        { product_id: 'p1', name: 'Cancelled Product' },
      ]);
    });

    test('should handle early cancellation', () => {
      const properties: OrderProperties = {
        order_id: 'order_early_cancel',
        total: 0, // No payment processed yet
      };

      const result = orderCancelled(properties);

      expect(result.properties).toStrictEqual({
        order_id: 'order_early_cancel',
        total: 0,
      });
    });

    test('should throw error when order_id is missing', () => {
      expect(() => {
        orderCancelled({ total: 100 } as any);
      }).toThrow('Missing required properties: order_id');
    });
  });

  describe('orderStatusUpdated', () => {
    test('should create a valid order status updated event', () => {
      const properties: OrderStatusProperties = {
        order_id: 'order_123',
        carrier: 'UPS',
        estimated_delivery: '2024-01-15',
        previous_status: 'processing',
        status: 'shipped',
        tracking_number: 'TRACK123456',
      };

      const result = orderStatusUpdated(properties);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.ORDER_STATUS_UPDATED,
        category: 'ecommerce',
        properties: {
          order_id: 'order_123',
          carrier: 'UPS',
          estimated_delivery: '2024-01-15',
          previous_status: 'processing',
          status: 'shipped',
          tracking_number: 'TRACK123456',
        },
        requiredProperties: ['order_id', 'status'],
      });
    });

    test('should handle different order statuses', () => {
      const statuses = [
        'confirmed',
        'processing',
        'shipped',
        'out_for_delivery',
        'delivered',
        'returned',
        'failed',
      ] as const;

      statuses.forEach(status => {
        const properties: OrderStatusProperties = {
          order_id: 'order_123',
          status,
        };

        const result = orderStatusUpdated(properties);
        expect(result.properties!.status).toBe(status);
      });
    });

    test('should handle minimal status update', () => {
      const properties: OrderStatusProperties = {
        order_id: 'order_456',
        status: 'confirmed',
      };

      const result = orderStatusUpdated(properties);

      expect(result.properties).toStrictEqual({
        order_id: 'order_456',
        status: 'confirmed',
      });
    });

    test('should handle delivery status with tracking', () => {
      const properties: OrderStatusProperties = {
        order_id: 'order_789',
        carrier: 'FedEx',
        previous_status: 'out_for_delivery',
        status: 'delivered',
        tracking_number: 'DELIVERED123',
      };

      const result = orderStatusUpdated(properties);

      expect(result.properties).toMatchObject({
        order_id: 'order_789',
        carrier: 'FedEx',
        status: 'delivered',
        tracking_number: 'DELIVERED123',
      });
    });

    test('should throw error when order_id is missing', () => {
      expect(() => {
        orderStatusUpdated({ status: 'shipped' } as any);
      }).toThrow('Missing required properties: order_id');
    });

    test('should throw error when status is missing', () => {
      expect(() => {
        orderStatusUpdated({ order_id: 'order_123' } as any);
      }).toThrow('Missing required properties: status');
    });

    test('should throw error when both required properties are missing', () => {
      expect(() => {
        orderStatusUpdated({} as any);
      }).toThrow('Missing required properties: order_id, status');
    });

    test('should clean undefined properties', () => {
      const properties: OrderStatusProperties = {
        order_id: 'order_123',
        carrier: undefined,
        estimated_delivery: undefined,
        status: 'shipped',
        tracking_number: 'TRACK123',
      };

      const result = orderStatusUpdated(properties);

      expect(result.properties).toStrictEqual({
        order_id: 'order_123',
        status: 'shipped',
        tracking_number: 'TRACK123',
      });
    });
  });

  describe('returnRequested', () => {
    const baseProducts: BaseProductProperties[] = [
      { product_id: 'p1', name: 'Defective Product', price: 99.99, quantity: 1 },
    ];

    test('should create a valid return requested event', () => {
      const properties: ReturnProperties = {
        order_id: 'order_123',
        products: baseProducts,
        reason: 'Product arrived damaged',
        return_method: 'mail',
      };

      const result = returnRequested(properties);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.RETURN_REQUESTED,
        category: 'ecommerce',
        properties: {
          order_id: 'order_123',
          products: baseProducts,
          reason: 'Product arrived damaged',
          return_method: 'mail',
        },
        requiredProperties: ['order_id', 'reason'],
      });
    });

    test('should normalize products when provided', () => {
      const rawProducts = [{ price: '49.99', productId: 'p1', title: 'Return Product' }];

      const properties: ReturnProperties = {
        order_id: 'order_123',
        products: rawProducts as any,
        reason: 'Wrong size',
      };

      const result = returnRequested(properties);

      expect(result.properties!.products).toStrictEqual([
        { product_id: 'p1', name: 'Return Product', price: 49.99 },
      ]);
    });

    test('should handle different return reasons', () => {
      const reasons = [
        'Product arrived damaged',
        'Wrong item received',
        'Wrong size',
        'Quality not as expected',
        'Changed mind',
        'Found better price elsewhere',
      ];

      reasons.forEach(reason => {
        const properties: ReturnProperties = {
          order_id: 'order_123',
          products: baseProducts,
          reason,
        };

        const result = returnRequested(properties);
        expect(result.properties!.reason).toBe(reason);
      });
    });

    test('should handle different return methods', () => {
      const methods = ['mail', 'store', 'pickup'] as const;

      methods.forEach(method => {
        const properties: ReturnProperties = {
          order_id: 'order_123',
          products: baseProducts,
          reason: 'Defective',
          return_method: method,
        };

        const result = returnRequested(properties);
        expect(result.properties!.return_method).toBe(method);
      });
    });

    test('should handle return with refund amount', () => {
      const properties: ReturnProperties = {
        order_id: 'order_123',
        products: baseProducts,
        reason: 'Defective',
        refund_amount: 99.99,
      };

      const result = returnRequested(properties);

      expect(result.properties!.refund_amount).toBe(99.99);
    });

    test('should throw error when order_id is missing', () => {
      expect(() => {
        returnRequested({
          products: baseProducts,
          reason: 'test',
        } as any);
      }).toThrow('Missing required properties: order_id');
    });

    test('should throw error when reason is missing', () => {
      expect(() => {
        returnRequested({
          order_id: 'order_123',
          products: baseProducts,
        } as any);
      }).toThrow('Missing required properties: reason');
    });

    test('should throw error when both required properties are missing', () => {
      expect(() => {
        returnRequested({ products: baseProducts } as any);
      }).toThrow('Missing required properties: order_id, reason');
    });

    test('should clean undefined properties', () => {
      const properties: ReturnProperties = {
        order_id: 'order_123',
        return_id: undefined,
        products: baseProducts,
        reason: 'Defective',
        refund_amount: undefined,
        return_method: undefined,
      };

      const result = returnRequested(properties);

      expect(result.properties).toStrictEqual({
        order_id: 'order_123',
        products: baseProducts,
        reason: 'Defective',
      });
    });
  });

  describe('returnCompleted', () => {
    const baseProducts: BaseProductProperties[] = [
      { product_id: 'p1', name: 'Returned Product', price: 99.99 },
    ];

    test('should create a valid return completed event', () => {
      const properties = {
        order_id: 'order_123',
        return_id: 'return_456',
        completion_date: '2024-01-10',
        products: baseProducts,
        reason: 'Defective product',
        refund_amount: 99.99,
        refund_status: 'completed' as const,
      };

      const result = returnCompleted(properties);

      expect(result).toStrictEqual({
        name: ECOMMERCE_EVENTS.RETURN_COMPLETED,
        category: 'ecommerce',
        properties: {
          order_id: 'order_123',
          return_id: 'return_456',
          completion_date: '2024-01-10',
          products: baseProducts,
          reason: 'Defective product',
          refund_amount: 99.99,
          refund_status: 'completed',
        },
        requiredProperties: ['order_id', 'return_id'],
      });
    });

    test('should handle different refund statuses', () => {
      const statuses = ['pending', 'completed', 'failed'] as const;

      statuses.forEach(status => {
        const properties = {
          order_id: 'order_123',
          return_id: 'return_456',
          products: baseProducts,
          reason: 'test',
          refund_status: status,
        };

        const result = returnCompleted(properties);
        expect(result.properties!.refund_status).toBe(status);
      });
    });

    test('should normalize products when provided', () => {
      const rawProducts = [{ price: '75.00', productId: 'p1', title: 'Returned Item' }];

      const properties = {
        order_id: 'order_123',
        return_id: 'return_456',
        products: rawProducts as any,
        reason: 'Wrong size',
      };

      const result = returnCompleted(properties);

      expect(result.properties!.products).toStrictEqual([
        { product_id: 'p1', name: 'Returned Item', price: 75.0 },
      ]);
    });

    test('should handle minimal return completion', () => {
      const properties = {
        order_id: 'order_123',
        return_id: 'return_456',
        products: baseProducts,
        reason: 'Defective',
      };

      const result = returnCompleted(properties);

      expect(result.properties).toStrictEqual({
        order_id: 'order_123',
        return_id: 'return_456',
        products: baseProducts,
        reason: 'Defective',
      });
    });

    test('should throw error when order_id is missing', () => {
      expect(() => {
        returnCompleted({
          return_id: 'return_456',
          products: baseProducts,
          reason: 'test',
        } as any);
      }).toThrow('Missing required properties: order_id');
    });

    test('should throw error when return_id is missing', () => {
      expect(() => {
        returnCompleted({
          order_id: 'order_123',
          products: baseProducts,
          reason: 'test',
        } as any);
      }).toThrow('Missing required properties: return_id');
    });

    test('should throw error when both required properties are missing', () => {
      expect(() => {
        returnCompleted({
          products: baseProducts,
          reason: 'test',
        } as any);
      }).toThrow('Missing required properties: order_id, return_id');
    });

    test('should clean undefined properties', () => {
      const properties = {
        order_id: 'order_123',
        return_id: 'return_456',
        completion_date: undefined,
        products: baseProducts,
        reason: 'Defective',
        refund_amount: undefined,
        refund_status: undefined,
      };

      const result = returnCompleted(properties);

      expect(result.properties).toStrictEqual({
        order_id: 'order_123',
        return_id: 'return_456',
        products: baseProducts,
        reason: 'Defective',
      });
    });
  });

  // Edge cases and integration tests
  describe('edge Cases and Integration', () => {
    test('should handle order lifecycle from completion to return', () => {
      const orderId = 'lifecycle_order_123';
      const products: BaseProductProperties[] = [
        { product_id: 'p1', name: 'Lifecycle Product', price: 199.99, quantity: 1 },
      ];

      // 1. Order completed
      const completedResult = orderCompleted({
        order_id: orderId,
        products,
        total: 199.99,
      });

      // 2. Order status updates
      const shippedResult = orderStatusUpdated({
        order_id: orderId,
        status: 'shipped',
        tracking_number: 'TRACK123',
      });

      const deliveredResult = orderStatusUpdated({
        order_id: orderId,
        previous_status: 'shipped',
        status: 'delivered',
      });

      // 3. Return requested
      const returnRequestResult = returnRequested({
        order_id: orderId,
        products,
        reason: 'Product defective',
      });

      // 4. Return completed
      const returnCompletedResult = returnCompleted({
        order_id: orderId,
        return_id: `return_${orderId}`,
        products,
        reason: 'Product defective',
        refund_amount: 199.99,
      });

      // All events should maintain consistent order_id
      expect(completedResult.properties!.order_id).toBe(orderId);
      expect(shippedResult.properties!.order_id).toBe(orderId);
      expect(deliveredResult.properties!.order_id).toBe(orderId);
      expect(returnRequestResult.properties!.order_id).toBe(orderId);
      expect(returnCompletedResult.properties!.order_id).toBe(orderId);

      // Products should be consistent
      expect(completedResult.properties!.products).toStrictEqual(products);
      expect(returnRequestResult.properties!.products).toStrictEqual(products);
      expect(returnCompletedResult.properties!.products).toStrictEqual(products);
    });

    test('should handle large orders with many products efficiently', () => {
      const largeProductList = Array.from({ length: 1000 }, (_, i) => ({
        product_id: `bulk_p${i}`,
        name: `Bulk Product ${i}`,
        price: Math.random() * 100,
        quantity: Math.floor(Math.random() * 5) + 1,
      }));

      const totalValue = largeProductList.reduce(
        (sum, product) => sum + product.price * product.quantity,
        0,
      );

      const properties: OrderProperties = {
        order_id: 'bulk_order_123',
        products: largeProductList,
        total: totalValue,
      };

      const startTime = performance.now();
      const result = orderCompleted(properties);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should complete in under 200ms
      expect(result.properties!.products).toHaveLength(1000);
      expect(result.properties!.total).toBe(totalValue);
    });

    test('should ensure consistent event naming across all order emitters', () => {
      const eventNames = [
        orderCompleted({ order_id: 'o1' }).event,
        orderFailed({ order_id: 'o2' }).name,
        orderRefunded({ order_id: 'o3' }).name,
        orderCancelled({ order_id: 'o4' }).name,
        orderStatusUpdated({ order_id: 'o5', status: 'shipped' }).name,
        returnRequested({ order_id: 'o6', products: [], reason: 'test' }).name,
        returnCompleted({ order_id: 'o7', return_id: 'r1', products: [], reason: 'test' }).name,
      ];

      // All event names should be valid ECOMMERCE_EVENTS
      eventNames.forEach(eventName => {
        expect(Object.values(ECOMMERCE_EVENTS)).toContain(eventName);
      });

      // Event names should be unique
      const uniqueNames = new Set(eventNames);
      expect(uniqueNames.size).toBe(eventNames.length);
    });

    test('should handle complex monetary calculations correctly', () => {
      const properties: OrderProperties = {
        order_id: 'complex_order',
        discount: 10.0,
        revenue: 249.99,
        shipping: 15.0,
        tax: 25.0,
        total: 299.99,
      };

      // Test with completion
      const completedResult = orderCompleted(properties);
      expect(completedResult.properties!.total).toBe(299.99);
      expect(completedResult.properties!.revenue).toBe(249.99);

      // Test with refund
      const refundProperties: OrderProperties = {
        ...properties,
        total: 149.99, // Partial refund
      };
      const refundResult = orderRefunded(refundProperties);
      expect(refundResult.properties!.total).toBe(149.99);
    });

    test('should maintain type safety across all order emitters', () => {
      // This test ensures TypeScript types are working correctly

      // orderCompleted requires order_id
      const completeProps: OrderProperties = { order_id: 'o1' };
      expect(() => orderCompleted(completeProps)).not.toThrow();

      // orderStatusUpdated requires order_id and status
      const statusProps: OrderStatusProperties = {
        order_id: 'o1',
        status: 'shipped',
      };
      expect(() => orderStatusUpdated(statusProps)).not.toThrow();

      // returnRequested requires order_id and reason
      const returnProps: ReturnProperties = {
        order_id: 'o1',
        products: [],
        reason: 'test',
      };
      expect(() => returnRequested(returnProps)).not.toThrow();
    });

    test('should handle malformed data gracefully', () => {
      // Test with invalid currency
      const invalidCurrencyResult = orderCompleted({
        order_id: 'test',
        currency: 'INVALID_CURRENCY',
      });
      expect(invalidCurrencyResult.properties!.currency).toBeUndefined();

      // Test with malformed products
      expect(() => {
        orderCompleted({
          order_id: 'test',
          products: [{ name: 'No ID Product' }] as any,
        });
      }).toThrow('Product must have an id');

      // Test with empty required fields
      expect(() => {
        orderStatusUpdated({
          order_id: '',
          status: 'shipped',
        });
      }).toThrow('Missing required properties: order_id');
    });
  });
});
