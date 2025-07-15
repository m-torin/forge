import {
  AddressType,
  OrderItemStatus,
  OrderStatus,
  PaymentStatus,
} from '#/prisma-generated/client';
import {
  extractOrderAddress,
  extractOrderItems,
  mapWebappOrderToPrisma,
} from '#/prisma/src/seed/mappers/order-mapper';
import { describe, expect, it } from 'vitest';

describe('order-mapper', () => {
  const mockWebappOrder = {
    number: '1234',
    date: 'March 22, 2025',
    status: 'Delivered on January 11, 2025',
    invoiceHref: '#',
    totalQuantity: 2,
    cost: {
      subtotal: 199,
      shipping: 0,
      tax: 0,
      total: 199,
      discount: 0,
    },
    products: [
      {
        id: 'gid://1',
        title: 'Test Product',
        handle: 'test-product',
        description: 'Test description',
        href: '#',
        price: 99,
        status: 'Shipped',
        step: 0,
        date: 'March 24, 2021',
        datetime: '2021-03-24',
        address: ['John Doe', '123 Main St', 'Toronto, ON N3Y 4H8'],
        email: 'test@example.com',
        phone: '1234567890',
        featuredImage: {
          src: '/images/test.jpg',
          width: 400,
          height: 400,
          alt: 'Test Product',
        },
        quantity: 1,
        size: 'M',
        color: 'Black',
      },
    ],
  };

  describe('mapWebappOrderToPrisma', () => {
    it('maps webapp order to Prisma format correctly', () => {
      const userId = 'user-123';
      const addressId = 'address-123';
      const result = mapWebappOrderToPrisma(mockWebappOrder, userId, addressId);

      expect(result.orderNumber).toBe('1234');
      expect(result.status).toBe(OrderStatus.DELIVERED);
      expect(result.paymentStatus).toBe(PaymentStatus.PAID);
      expect(result.currency).toBe('USD');
      expect(result.subtotal).toBe(199);
      expect(result.total).toBe(199);
      expect(result.user).toStrictEqual({ connect: { id: userId } });
      expect(result.shippingAddress).toStrictEqual({ connect: { id: addressId } });
      expect(result.billingAddress).toStrictEqual({ connect: { id: addressId } });
    });

    it('handles different order statuses', () => {
      const pendingOrder = { ...mockWebappOrder, status: 'Processing' };
      const userId = 'user-123';
      const addressId = 'address-123';
      const result = mapWebappOrderToPrisma(pendingOrder, userId, addressId);

      expect(result.status).toBe(OrderStatus.PROCESSING);
      expect(result.paymentStatus).toBe(PaymentStatus.PAID);
    });
  });

  describe('mapWebappOrderToPrisma edge cases', () => {
    it('handles unknown status gracefully', () => {
      const unknownStatusOrder = { ...mockWebappOrder, status: 'Unknown Status' };
      const userId = 'user-123';
      const addressId = 'address-123';
      const result = mapWebappOrderToPrisma(unknownStatusOrder, userId, addressId);
      expect(result.status).toBe(OrderStatus.PENDING);
      expect(result.paymentStatus).toBe(PaymentStatus.PENDING);
    });
    it('handles missing cost fields', () => {
      const noCostOrder = { ...mockWebappOrder, cost: undefined };
      const userId = 'user-123';
      const addressId = 'address-123';
      // @ts-expect-error: purposely missing cost
      const result = mapWebappOrderToPrisma(noCostOrder, userId, addressId);
      expect(result.subtotal).toBeUndefined();
      expect(result.total).toBeUndefined();
    });
  });

  describe('extractOrderAddress', () => {
    it('extracts address correctly', () => {
      const userId = 'user-123';
      const result = extractOrderAddress(mockWebappOrder, userId);

      expect(result.type).toBe(AddressType.SHIPPING);
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.street1).toBe('123 Main St');
      expect(result.city).toBe('Toronto');
      expect(result.state).toBe('ON');
      expect(result.postalCode).toBe('N3Y 4H8');
      expect(result.country).toBe('CA');
      expect(result.user).toStrictEqual({ connect: { id: userId } });
    });
  });

  describe('extractOrderAddress edge cases', () => {
    it('handles missing address array', () => {
      const orderNoAddress = {
        ...mockWebappOrder,
        products: [{ ...mockWebappOrder.products[0], address: undefined }],
      };
      const userId = 'user-123';
      // @ts-expect-error: purposely missing address
      const result = extractOrderAddress(orderNoAddress, userId);
      expect(result.firstName).toBe('John'); // fallback
      expect(result.street1).toBe('123 Main St');
    });
    it('handles empty products array', () => {
      const orderNoProducts = { ...mockWebappOrder, products: [] };
      const userId = 'user-123';
      const result = extractOrderAddress(orderNoProducts, userId);
      expect(result.firstName).toBe('John');
    });
  });

  describe('extractOrderItems', () => {
    it('extracts order items correctly', () => {
      const orderId = 'order-123';
      const productMap = new Map([['test-product', 'product-123']]);
      const result = extractOrderItems(mockWebappOrder, orderId, productMap);

      expect(result).toHaveLength(1);
      expect(result[0].productName).toBe('Test Product');
      expect(result[0].variantName).toBe('Test Product - Black - M');
      expect(result[0].quantity).toBe(1);
      expect(result[0].price).toBe(99);
      expect(result[0].total).toBe(99);
      expect(result[0].status).toBe(OrderItemStatus.FULFILLED);
      expect(result[0].order).toStrictEqual({ connect: { id: orderId } });
      expect(result[0].product).toStrictEqual({ connect: { id: 'product-123' } });
    });

    it('handles different item statuses', () => {
      const orderWithProcessing = {
        ...mockWebappOrder,
        products: [{ ...mockWebappOrder.products[0], status: 'Preparing to ship' }],
      };
      const orderId = 'order-123';
      const productMap = new Map([['test-product', 'product-123']]);
      const result = extractOrderItems(orderWithProcessing, orderId, productMap);

      expect(result[0].status).toBe(OrderItemStatus.PROCESSING);
    });
  });

  describe('extractOrderItems edge cases', () => {
    it('returns empty array if no products', () => {
      const orderNoProducts = { ...mockWebappOrder, products: [] };
      const orderId = 'order-123';
      const productMap = new Map();
      const result = extractOrderItems(orderNoProducts, orderId, productMap);
      expect(result).toHaveLength(0);
    });
    it('handles missing product handle in productMap', () => {
      const orderId = 'order-123';
      const productMap = new Map();
      const result = extractOrderItems(mockWebappOrder, orderId, productMap);
      expect(result[0].product).toBeUndefined();
    });
    it('handles zero and negative quantities', () => {
      const orderWithZeroQty = {
        ...mockWebappOrder,
        products: [{ ...mockWebappOrder.products[0], quantity: 0 }],
      };
      const orderWithNegativeQty = {
        ...mockWebappOrder,
        products: [{ ...mockWebappOrder.products[0], quantity: -5 }],
      };
      const orderId = 'order-123';
      const productMap = new Map([['test-product', 'product-123']]);
      const resultZero = extractOrderItems(orderWithZeroQty, orderId, productMap);
      const resultNeg = extractOrderItems(orderWithNegativeQty, orderId, productMap);
      expect(resultZero[0].quantity).toBe(0);
      expect(resultNeg[0].quantity).toBe(-5);
    });
  });
});
