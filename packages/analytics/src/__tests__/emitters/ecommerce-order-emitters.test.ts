import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  orderCompleted,
  orderFailed,
  orderRefunded,
  orderCancelled,
  orderStatusUpdated,
  returnRequested,
  returnCompleted,
} from '../../shared/emitters/ecommerce/events/order';
import { ECOMMERCE_EVENTS } from '../../shared/emitters/ecommerce/types';
import type {
  OrderProperties,
  OrderStatusProperties,
  ReturnProperties,
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

describe('Order Emitters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('orderCompleted', () => {
    const baseOrderProperties: OrderProperties = {
      order_id: 'order_123',
      affiliation: 'Online Store',
      total: 299.99,
      revenue: 259.99,
      shipping: 15.00,
      tax: 25.00,
      discount: 10.00,
      coupon: 'SAVE10',
      currency: 'USD',
    };

    it('should create a valid order completed event', () => {
      const result = orderCompleted(baseOrderProperties);

      expect(result).toEqual({
        event: ECOMMERCE_EVENTS.ORDER_COMPLETED,
        properties: {
          order_id: 'order_123',
          affiliation: 'Online Store',
          total: 299.99,
          revenue: 259.99,
          shipping: 15.00,
          tax: 25.00,
          discount: 10.00,
          coupon: 'SAVE10',
          currency: 'USD',
        },
        context: { category: 'ecommerce' },
        options: undefined,
      });
    });

    it('should create order completed event with products', () => {
      const products: BaseProductProperties[] = [
        { product_id: 'p1', name: 'Product 1', price: 99.99, quantity: 2 },
        { product_id: 'p2', name: 'Product 2', price: 149.99, quantity: 1 },
      ];

      const properties: OrderProperties = {
        ...baseOrderProperties,
        products,
      };

      const result = orderCompleted(properties);

      expect(result.properties.products).toEqual(products);
    });

    it('should normalize products when provided', () => {
      const rawProducts = [
        { productId: 'p1', title: 'Product 1', price: '99.99' },
        { id: 'p2', name: 'Product 2', price: 149.99 },
      ];

      const properties: OrderProperties = {
        ...baseOrderProperties,
        products: rawProducts as any,
      };

      const result = orderCompleted(properties);

      expect(result.properties.products).toEqual([
        { product_id: 'p1', name: 'Product 1', price: 99.99 },
        { product_id: 'p2', name: 'Product 2', price: 149.99 },
      ]);
    });

    it('should validate and normalize currency', () => {
      const properties: OrderProperties = {
        ...baseOrderProperties,
        currency: 'eur',
      };

      const result = orderCompleted(properties);
      expect(result.properties.currency).toBe('EUR');
    });

    it('should handle invalid currency gracefully', () => {
      const properties: OrderProperties = {
        ...baseOrderProperties,
        currency: 'invalid',
      };

      const result = orderCompleted(properties);
      expect(result.properties.currency).toBeUndefined();
    });

    it('should accept emitter options', () => {
      const options = { userId: 'user123', timestamp: new Date() };
      const result = orderCompleted(baseOrderProperties, options);

      expect(result.options).toBe(options);
    });

    it('should handle minimal order properties', () => {
      const minimal: OrderProperties = { order_id: 'order_456' };
      const result = orderCompleted(minimal);

      expect(result.properties).toEqual({ order_id: 'order_456' });
    });

    it('should clean undefined properties', () => {
      const properties: OrderProperties = {
        order_id: 'order_123',
        total: 100.00,
        revenue: undefined,
        shipping: undefined,
        tax: undefined,
        discount: undefined,
        coupon: undefined,
        currency: undefined,
        products: undefined,
      };

      const result = orderCompleted(properties);

      expect(result.properties).toEqual({
        order_id: 'order_123',
        total: 100.00,
      });
    });

    it('should throw error when order_id is missing', () => {
      expect(() => {
        orderCompleted({ total: 100 } as any);
      }).toThrow('Missing required properties: order_id');
    });

    it('should handle zero values correctly', () => {
      const properties: OrderProperties = {
        order_id: 'order_123',
        total: 0,
        revenue: 0,
        shipping: 0,
        tax: 0,
        discount: 0,
      };

      const result = orderCompleted(properties);

      expect(result.properties).toMatchObject({
        order_id: 'order_123',
        total: 0,
        revenue: 0,
        shipping: 0,
        tax: 0,
        discount: 0,
      });
    });
  });

  describe('orderFailed', () => {
    const baseOrderProperties: OrderProperties = {
      order_id: 'order_failed_123',
      total: 199.99,
      currency: 'USD',
    };

    it('should create a valid order failed event', () => {
      const properties = {
        ...baseOrderProperties,
        failure_reason: 'Credit card declined',
        error_code: 'CARD_DECLINED',
      };

      const result = orderFailed(properties);

      expect(result).toEqual({
        name: ECOMMERCE_EVENTS.ORDER_FAILED,
        category: 'ecommerce',
        requiredProperties: ['order_id'],
        properties: {
          order_id: 'order_failed_123',
          total: 199.99,
          currency: 'USD',
          failure_reason: 'Credit card declined',
          error_code: 'CARD_DECLINED',
        },
      });
    });

    it('should handle order failure without error details', () => {
      const result = orderFailed(baseOrderProperties);

      expect(result.properties).toEqual({
        order_id: 'order_failed_123',
        total: 199.99,
        currency: 'USD',
      });
    });

    it('should handle different failure reasons', () => {
      const failureReasons = [
        'Payment declined',
        'Insufficient funds',
        'Address verification failed',
        'Fraud detection triggered',
        'System timeout',
      ];

      failureReasons.forEach((reason) => {
        const properties = {
          ...baseOrderProperties,
          failure_reason: reason,
        };

        const result = orderFailed(properties);
        expect(result.properties.failure_reason).toBe(reason);
      });
    });

    it('should handle different error codes', () => {
      const errorCodes = [
        'CARD_DECLINED',
        'INSUFFICIENT_FUNDS',
        'EXPIRED_CARD',
        'CVC_FAILED',
        'FRAUD_DETECTED',
        'SYSTEM_ERROR',
      ];

      errorCodes.forEach((code) => {
        const properties = {
          ...baseOrderProperties,
          error_code: code,
        };

        const result = orderFailed(properties);
        expect(result.properties.error_code).toBe(code);
      });
    });

    it('should normalize products in failed order', () => {
      const products = [
        { productId: 'p1', title: 'Failed Product', price: '99.99' },
      ];

      const properties = {
        ...baseOrderProperties,
        products: products as any,
        failure_reason: 'Payment failed',
      };

      const result = orderFailed(properties);

      expect(result.properties.products).toEqual([
        { product_id: 'p1', name: 'Failed Product', price: 99.99 },
      ]);
    });

    it('should throw error when order_id is missing', () => {
      expect(() => {
        orderFailed({ total: 100, failure_reason: 'test' } as any);
      }).toThrow('Missing required properties: order_id');
    });

    it('should clean undefined properties', () => {
      const properties = {
        order_id: 'order_123',
        total: 100,
        failure_reason: 'Payment failed',
        error_code: undefined,
        revenue: undefined,
      };

      const result = orderFailed(properties);

      expect(result.properties).toEqual({
        order_id: 'order_123',
        total: 100,
        failure_reason: 'Payment failed',
      });
    });
  });

  describe('orderRefunded', () => {
    const baseOrderProperties: OrderProperties = {
      order_id: 'order_refund_123',
      total: 299.99,
      revenue: 259.99,
      currency: 'USD',
    };

    it('should create a valid order refunded event', () => {
      const result = orderRefunded(baseOrderProperties);

      expect(result).toEqual({
        name: ECOMMERCE_EVENTS.ORDER_REFUNDED,
        category: 'ecommerce',
        requiredProperties: ['order_id'],
        properties: {
          order_id: 'order_refund_123',
          total: 299.99,
          revenue: 259.99,
          currency: 'USD',
        },
      });
    });

    it('should handle partial refund with products', () => {
      const products: BaseProductProperties[] = [
        { product_id: 'p1', name: 'Refunded Product', price: 99.99, quantity: 1 },
      ];

      const properties: OrderProperties = {
        ...baseOrderProperties,
        total: 99.99, // Partial refund amount
        products,
      };

      const result = orderRefunded(properties);

      expect(result.properties.products).toEqual(products);
      expect(result.properties.total).toBe(99.99);
    });

    it('should normalize currency', () => {
      const properties: OrderProperties = {
        ...baseOrderProperties,
        currency: 'gbp',
      };

      const result = orderRefunded(properties);
      expect(result.properties.currency).toBe('GBP');
    });

    it('should handle full refund', () => {
      const properties: OrderProperties = {
        order_id: 'order_123',
        total: 299.99,
        revenue: 299.99, // Full refund
        shipping: 15.00,
        tax: 25.00,
      };

      const result = orderRefunded(properties);

      expect(result.properties).toMatchObject({
        order_id: 'order_123',
        total: 299.99,
        revenue: 299.99,
        shipping: 15.00,
        tax: 25.00,
      });
    });

    it('should throw error when order_id is missing', () => {
      expect(() => {
        orderRefunded({ total: 100 } as any);
      }).toThrow('Missing required properties: order_id');
    });

    it('should clean undefined properties', () => {
      const properties: OrderProperties = {
        order_id: 'order_123',
        total: 100,
        revenue: undefined,
        shipping: undefined,
      };

      const result = orderRefunded(properties);

      expect(result.properties).toEqual({
        order_id: 'order_123',
        total: 100,
      });
    });
  });

  describe('orderCancelled', () => {
    const baseOrderProperties: OrderProperties = {
      order_id: 'order_cancel_123',
      total: 199.99,
      currency: 'USD',
    };

    it('should create a valid order cancelled event', () => {
      const result = orderCancelled(baseOrderProperties);

      expect(result).toEqual({
        name: ECOMMERCE_EVENTS.ORDER_CANCELLED,
        category: 'ecommerce',
        requiredProperties: ['order_id'],
        properties: {
          order_id: 'order_cancel_123',
          total: 199.99,
          currency: 'USD',
        },
      });
    });

    it('should handle cancellation with products', () => {
      const products: BaseProductProperties[] = [
        { product_id: 'p1', name: 'Cancelled Product', price: 99.99 },
        { product_id: 'p2', name: 'Another Cancelled Product', price: 99.99 },
      ];

      const properties: OrderProperties = {
        ...baseOrderProperties,
        products,
      };

      const result = orderCancelled(properties);

      expect(result.properties.products).toEqual(products);
    });

    it('should normalize products when provided', () => {
      const rawProducts = [
        { productId: 'p1', title: 'Cancelled Product' },
      ];

      const properties: OrderProperties = {
        ...baseOrderProperties,
        products: rawProducts as any,
      };

      const result = orderCancelled(properties);

      expect(result.properties.products).toEqual([
        { product_id: 'p1', name: 'Cancelled Product' },
      ]);
    });

    it('should handle early cancellation', () => {
      const properties: OrderProperties = {
        order_id: 'order_early_cancel',
        total: 0, // No payment processed yet
      };

      const result = orderCancelled(properties);

      expect(result.properties).toEqual({
        order_id: 'order_early_cancel',
        total: 0,
      });
    });

    it('should throw error when order_id is missing', () => {
      expect(() => {
        orderCancelled({ total: 100 } as any);
      }).toThrow('Missing required properties: order_id');
    });
  });

  describe('orderStatusUpdated', () => {
    it('should create a valid order status updated event', () => {
      const properties: OrderStatusProperties = {
        order_id: 'order_123',
        status: 'shipped',
        previous_status: 'processing',
        tracking_number: 'TRACK123456',
        carrier: 'UPS',
        estimated_delivery: '2024-01-15',
      };

      const result = orderStatusUpdated(properties);

      expect(result).toEqual({
        name: ECOMMERCE_EVENTS.ORDER_STATUS_UPDATED,
        category: 'ecommerce',
        requiredProperties: ['order_id', 'status'],
        properties: {
          order_id: 'order_123',
          status: 'shipped',
          previous_status: 'processing',
          tracking_number: 'TRACK123456',
          carrier: 'UPS',
          estimated_delivery: '2024-01-15',
        },
      });
    });

    it('should handle different order statuses', () => {
      const statuses = [
        'confirmed',
        'processing',
        'shipped',
        'out_for_delivery',
        'delivered',
        'returned',
        'failed',
      ] as const;

      statuses.forEach((status) => {
        const properties: OrderStatusProperties = {
          order_id: 'order_123',
          status,
        };

        const result = orderStatusUpdated(properties);
        expect(result.properties.status).toBe(status);
      });
    });

    it('should handle minimal status update', () => {
      const properties: OrderStatusProperties = {
        order_id: 'order_456',
        status: 'confirmed',
      };

      const result = orderStatusUpdated(properties);

      expect(result.properties).toEqual({
        order_id: 'order_456',
        status: 'confirmed',
      });
    });

    it('should handle delivery status with tracking', () => {
      const properties: OrderStatusProperties = {
        order_id: 'order_789',
        status: 'delivered',
        previous_status: 'out_for_delivery',
        tracking_number: 'DELIVERED123',
        carrier: 'FedEx',
      };

      const result = orderStatusUpdated(properties);

      expect(result.properties).toMatchObject({
        order_id: 'order_789',
        status: 'delivered',
        tracking_number: 'DELIVERED123',
        carrier: 'FedEx',
      });
    });

    it('should throw error when order_id is missing', () => {
      expect(() => {
        orderStatusUpdated({ status: 'shipped' } as any);
      }).toThrow('Missing required properties: order_id');
    });

    it('should throw error when status is missing', () => {
      expect(() => {
        orderStatusUpdated({ order_id: 'order_123' } as any);
      }).toThrow('Missing required properties: status');
    });

    it('should throw error when both required properties are missing', () => {
      expect(() => {
        orderStatusUpdated({} as any);
      }).toThrow('Missing required properties: order_id, status');
    });

    it('should clean undefined properties', () => {
      const properties: OrderStatusProperties = {
        order_id: 'order_123',
        status: 'shipped',
        tracking_number: 'TRACK123',
        carrier: undefined,
        estimated_delivery: undefined,
      };

      const result = orderStatusUpdated(properties);

      expect(result.properties).toEqual({
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

    it('should create a valid return requested event', () => {
      const properties: ReturnProperties = {
        order_id: 'order_123',
        products: baseProducts,
        reason: 'Product arrived damaged',
        return_method: 'mail',
      };

      const result = returnRequested(properties);

      expect(result).toEqual({
        name: ECOMMERCE_EVENTS.RETURN_REQUESTED,
        category: 'ecommerce',
        requiredProperties: ['order_id', 'reason'],
        properties: {
          order_id: 'order_123',
          products: baseProducts,
          reason: 'Product arrived damaged',
          return_method: 'mail',
        },
      });
    });

    it('should normalize products when provided', () => {
      const rawProducts = [
        { productId: 'p1', title: 'Return Product', price: '49.99' },
      ];

      const properties: ReturnProperties = {
        order_id: 'order_123',
        products: rawProducts as any,
        reason: 'Wrong size',
      };

      const result = returnRequested(properties);

      expect(result.properties.products).toEqual([
        { product_id: 'p1', name: 'Return Product', price: 49.99 },
      ]);
    });

    it('should handle different return reasons', () => {
      const reasons = [
        'Product arrived damaged',
        'Wrong item received',
        'Wrong size',
        'Quality not as expected',
        'Changed mind',
        'Found better price elsewhere',
      ];

      reasons.forEach((reason) => {
        const properties: ReturnProperties = {
          order_id: 'order_123',
          products: baseProducts,
          reason,
        };

        const result = returnRequested(properties);
        expect(result.properties.reason).toBe(reason);
      });
    });

    it('should handle different return methods', () => {
      const methods = ['mail', 'store', 'pickup'] as const;

      methods.forEach((method) => {
        const properties: ReturnProperties = {
          order_id: 'order_123',
          products: baseProducts,
          reason: 'Defective',
          return_method: method,
        };

        const result = returnRequested(properties);
        expect(result.properties.return_method).toBe(method);
      });
    });

    it('should handle return with refund amount', () => {
      const properties: ReturnProperties = {
        order_id: 'order_123',
        products: baseProducts,
        reason: 'Defective',
        refund_amount: 99.99,
      };

      const result = returnRequested(properties);

      expect(result.properties.refund_amount).toBe(99.99);
    });

    it('should throw error when order_id is missing', () => {
      expect(() => {
        returnRequested({
          products: baseProducts,
          reason: 'test',
        } as any);
      }).toThrow('Missing required properties: order_id');
    });

    it('should throw error when reason is missing', () => {
      expect(() => {
        returnRequested({
          order_id: 'order_123',
          products: baseProducts,
        } as any);
      }).toThrow('Missing required properties: reason');
    });

    it('should throw error when both required properties are missing', () => {
      expect(() => {
        returnRequested({ products: baseProducts } as any);
      }).toThrow('Missing required properties: order_id, reason');
    });

    it('should clean undefined properties', () => {
      const properties: ReturnProperties = {
        order_id: 'order_123',
        products: baseProducts,
        reason: 'Defective',
        return_id: undefined,
        refund_amount: undefined,
        return_method: undefined,
      };

      const result = returnRequested(properties);

      expect(result.properties).toEqual({
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

    it('should create a valid return completed event', () => {
      const properties = {
        order_id: 'order_123',
        return_id: 'return_456',
        products: baseProducts,
        reason: 'Defective product',
        refund_amount: 99.99,
        completion_date: '2024-01-10',
        refund_status: 'completed' as const,
      };

      const result = returnCompleted(properties);

      expect(result).toEqual({
        name: ECOMMERCE_EVENTS.RETURN_COMPLETED,
        category: 'ecommerce',
        requiredProperties: ['order_id', 'return_id'],
        properties: {
          order_id: 'order_123',
          return_id: 'return_456',
          products: baseProducts,
          reason: 'Defective product',
          refund_amount: 99.99,
          completion_date: '2024-01-10',
          refund_status: 'completed',
        },
      });
    });

    it('should handle different refund statuses', () => {
      const statuses = ['pending', 'completed', 'failed'] as const;

      statuses.forEach((status) => {
        const properties = {
          order_id: 'order_123',
          return_id: 'return_456',
          products: baseProducts,
          reason: 'test',
          refund_status: status,
        };

        const result = returnCompleted(properties);
        expect(result.properties.refund_status).toBe(status);
      });
    });

    it('should normalize products when provided', () => {
      const rawProducts = [
        { productId: 'p1', title: 'Returned Item', price: '75.00' },
      ];

      const properties = {
        order_id: 'order_123',
        return_id: 'return_456',
        products: rawProducts as any,
        reason: 'Wrong size',
      };

      const result = returnCompleted(properties);

      expect(result.properties.products).toEqual([
        { product_id: 'p1', name: 'Returned Item', price: 75.00 },
      ]);
    });

    it('should handle minimal return completion', () => {
      const properties = {
        order_id: 'order_123',
        return_id: 'return_456',
        products: baseProducts,
        reason: 'Defective',
      };

      const result = returnCompleted(properties);

      expect(result.properties).toEqual({
        order_id: 'order_123',
        return_id: 'return_456',
        products: baseProducts,
        reason: 'Defective',
      });
    });

    it('should throw error when order_id is missing', () => {
      expect(() => {
        returnCompleted({
          return_id: 'return_456',
          products: baseProducts,
          reason: 'test',
        } as any);
      }).toThrow('Missing required properties: order_id');
    });

    it('should throw error when return_id is missing', () => {
      expect(() => {
        returnCompleted({
          order_id: 'order_123',
          products: baseProducts,
          reason: 'test',
        } as any);
      }).toThrow('Missing required properties: return_id');
    });

    it('should throw error when both required properties are missing', () => {
      expect(() => {
        returnCompleted({
          products: baseProducts,
          reason: 'test',
        } as any);
      }).toThrow('Missing required properties: order_id, return_id');
    });

    it('should clean undefined properties', () => {
      const properties = {
        order_id: 'order_123',
        return_id: 'return_456',
        products: baseProducts,
        reason: 'Defective',
        completion_date: undefined,
        refund_status: undefined,
        refund_amount: undefined,
      };

      const result = returnCompleted(properties);

      expect(result.properties).toEqual({
        order_id: 'order_123',
        return_id: 'return_456',
        products: baseProducts,
        reason: 'Defective',
      });
    });
  });

  // Edge cases and integration tests
  describe('Edge Cases and Integration', () => {
    it('should handle order lifecycle from completion to return', () => {
      const orderId = 'lifecycle_order_123';
      const products: BaseProductProperties[] = [
        { product_id: 'p1', name: 'Lifecycle Product', price: 199.99, quantity: 1 },
      ];

      // 1. Order completed
      const completedResult = orderCompleted({
        order_id: orderId,
        total: 199.99,
        products,
      });

      // 2. Order status updates
      const shippedResult = orderStatusUpdated({
        order_id: orderId,
        status: 'shipped',
        tracking_number: 'TRACK123',
      });

      const deliveredResult = orderStatusUpdated({
        order_id: orderId,
        status: 'delivered',
        previous_status: 'shipped',
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
      expect(completedResult.properties.order_id).toBe(orderId);
      expect(shippedResult.properties.order_id).toBe(orderId);
      expect(deliveredResult.properties.order_id).toBe(orderId);
      expect(returnRequestResult.properties.order_id).toBe(orderId);
      expect(returnCompletedResult.properties.order_id).toBe(orderId);

      // Products should be consistent
      expect(completedResult.properties.products).toEqual(products);
      expect(returnRequestResult.properties.products).toEqual(products);
      expect(returnCompletedResult.properties.products).toEqual(products);
    });

    it('should handle large orders with many products efficiently', () => {
      const largeProductList = Array.from({ length: 1000 }, (_, i) => ({
        product_id: `bulk_p${i}`,
        name: `Bulk Product ${i}`,
        price: Math.random() * 100,
        quantity: Math.floor(Math.random() * 5) + 1,
      }));

      const totalValue = largeProductList.reduce((sum, product) => 
        sum + (product.price * product.quantity), 0
      );

      const properties: OrderProperties = {
        order_id: 'bulk_order_123',
        total: totalValue,
        products: largeProductList,
      };

      const startTime = performance.now();
      const result = orderCompleted(properties);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should complete in under 200ms
      expect(result.properties.products).toHaveLength(1000);
      expect(result.properties.total).toBe(totalValue);
    });

    it('should ensure consistent event naming across all order emitters', () => {
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
      eventNames.forEach((eventName) => {
        expect(Object.values(ECOMMERCE_EVENTS)).toContain(eventName);
      });

      // Event names should be unique
      const uniqueNames = new Set(eventNames);
      expect(uniqueNames.size).toBe(eventNames.length);
    });

    it('should handle complex monetary calculations correctly', () => {
      const properties: OrderProperties = {
        order_id: 'complex_order',
        total: 299.99,
        revenue: 249.99,
        shipping: 15.00,
        tax: 25.00,
        discount: 10.00,
      };

      // Test with completion
      const completedResult = orderCompleted(properties);
      expect(completedResult.properties.total).toBe(299.99);
      expect(completedResult.properties.revenue).toBe(249.99);

      // Test with refund
      const refundProperties: OrderProperties = {
        ...properties,
        total: 149.99, // Partial refund
      };
      const refundResult = orderRefunded(refundProperties);
      expect(refundResult.properties.total).toBe(149.99);
    });

    it('should maintain type safety across all order emitters', () => {
      // This test ensures TypeScript types are working correctly

      // orderCompleted requires order_id
      const completeProps: OrderProperties = { order_id: 'o1' };
      expect(() => orderCompleted(completeProps)).not.toThrow();

      // orderStatusUpdated requires order_id and status
      const statusProps: OrderStatusProperties = { 
        order_id: 'o1', 
        status: 'shipped' 
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

    it('should handle malformed data gracefully', () => {
      // Test with invalid currency
      const invalidCurrencyResult = orderCompleted({
        order_id: 'test',
        currency: 'INVALID_CURRENCY',
      });
      expect(invalidCurrencyResult.properties.currency).toBeUndefined();

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