import { CartStatus } from '#/prisma-generated/client';
import {
  extractCartItems,
  findVariantForCartItem,
  mapWebappCartToPrisma,
} from '#/prisma/src/seed/mappers/cart-mapper';
import { describe, expect, it } from 'vitest';

describe('cart-mapper', () => {
  const mockWebappCart = {
    id: 'gid://shopify/Cart/1',
    note: 'Test note',
    createdAt: '2025-01-06',
    totalQuantity: 4,
    cost: {
      subtotal: 199,
      shipping: 0,
      tax: 0,
      total: 199,
      discount: 0,
    },
    lines: [
      {
        id: '1',
        name: 'Test Product',
        handle: 'test-product',
        price: 199,
        color: 'Red',
        inStock: true,
        size: 'L',
        quantity: 1,
        image: {
          src: '/images/test.jpg',
          width: 400,
          height: 400,
          alt: 'Test Product',
        },
      },
    ],
  };

  describe('mapWebappCartToPrisma', () => {
    it('maps webapp cart to Prisma format correctly', () => {
      const userId = 'user-123';
      const result = mapWebappCartToPrisma(mockWebappCart, userId);

      expect(result.status).toBe(CartStatus.ACTIVE);
      expect(result.currency).toBe('USD');
      expect(result.notes).toBe('Test note');
      expect(result.user).toStrictEqual({ connect: { id: userId } });
      expect((result.metadata as any)?.totalQuantity).toBe(4);
      expect((result.metadata as any)?.cost).toStrictEqual(mockWebappCart.cost);
    });

    // Enhanced test coverage
    it('handles empty note', () => {
      const cartWithEmptyNote = { ...mockWebappCart, note: '' };
      const userId = 'user-123';
      const result = mapWebappCartToPrisma(cartWithEmptyNote, userId);

      expect(result.notes).toBe('');
    });

    it('handles null note', () => {
      const cartWithNullNote = { ...mockWebappCart, note: null as any };
      const userId = 'user-123';
      const result = mapWebappCartToPrisma(cartWithNullNote, userId);

      expect(result.notes).toBeNull();
    });

    it('handles very long notes', () => {
      const longNote = 'A'.repeat(1000);
      const cartWithLongNote = { ...mockWebappCart, note: longNote };
      const userId = 'user-123';
      const result = mapWebappCartToPrisma(cartWithLongNote, userId);

      expect(result.notes).toBe(longNote);
    });

    it('handles special characters in notes', () => {
      const specialNote =
        'Note with special chars: &, @, #, $, %, ^, *, (, ), [, ], {, }, |, \\, /, :, ;, ", \', <, >, ?, !, ~, `';
      const cartWithSpecialNote = { ...mockWebappCart, note: specialNote };
      const userId = 'user-123';
      const result = mapWebappCartToPrisma(cartWithSpecialNote, userId);

      expect(result.notes).toBe(specialNote);
    });

    it('handles different cost structures', () => {
      const costVariations = [
        { subtotal: 0, shipping: 0, tax: 0, total: 0, discount: 0 },
        { subtotal: 100, shipping: 10, tax: 5, total: 115, discount: 0 },
        { subtotal: 200, shipping: 0, tax: 0, total: 200, discount: 20 },
        { subtotal: 1000, shipping: 50, tax: 100, total: 1150, discount: 100 },
      ];

      costVariations.forEach(cost => {
        const cartWithCost = { ...mockWebappCart, cost };
        const userId = 'user-123';
        const result = mapWebappCartToPrisma(cartWithCost, userId);

        expect((result.metadata as any)?.cost).toStrictEqual(cost);
      });
    });

    it('handles different total quantities', () => {
      const quantityVariations = [0, 1, 10, 100, 1000];

      quantityVariations.forEach(totalQuantity => {
        const cartWithQuantity = { ...mockWebappCart, totalQuantity };
        const userId = 'user-123';
        const result = mapWebappCartToPrisma(cartWithQuantity, userId);

        expect((result.metadata as any)?.totalQuantity).toBe(totalQuantity);
      });
    });

    it('handles different date formats', () => {
      const dateFormats = [
        '2025-01-06',
        '2025-01-06T10:30:00Z',
        '2025-01-06T10:30:00.000Z',
        '2025-01-06 10:30:00',
        '2025-01-06 10:30:00.000',
      ];

      dateFormats.forEach(createdAt => {
        const cartWithDate = { ...mockWebappCart, createdAt };
        const userId = 'user-123';
        const result = mapWebappCartToPrisma(cartWithDate, userId);

        expect(result.createdAt).toBeInstanceOf(Date);
        expect(result.updatedAt).toBeInstanceOf(Date);
      });
    });

    it('handles invalid date gracefully', () => {
      const cartWithInvalidDate = { ...mockWebappCart, createdAt: 'invalid-date' };
      const userId = 'user-123';
      const result = mapWebappCartToPrisma(cartWithInvalidDate, userId);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('generates consistent results for same input', () => {
      const userId = 'user-123';
      const result1 = mapWebappCartToPrisma(mockWebappCart, userId);
      const result2 = mapWebappCartToPrisma(mockWebappCart, userId);

      expect(result1.status).toBe(result2.status);
      expect(result1.currency).toBe(result2.currency);
      expect(result1.notes).toBe(result2.notes);
      expect((result1.metadata as any)?.totalQuantity).toBe(
        (result2.metadata as any)?.totalQuantity,
      );
    });

    it('includes all required fields', () => {
      const userId = 'user-123';
      const result = mapWebappCartToPrisma(mockWebappCart, userId);

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('currency');
      expect(result).toHaveProperty('notes');
      expect(result).toHaveProperty('metadata');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      expect(result.metadata).toHaveProperty('totalQuantity');
      expect(result.metadata).toHaveProperty('cost');
      expect(result.metadata as any).toHaveProperty('originalId');
    });

    it('sets correct default values', () => {
      const userId = 'user-123';
      const result = mapWebappCartToPrisma(mockWebappCart, userId);

      expect(result.status).toBe(CartStatus.ACTIVE);
      expect(result.currency).toBe('USD');
      expect((result.metadata as any).originalId).toBe(mockWebappCart.id);
    });
  });

  describe('extractCartItems', () => {
    it('extracts cart items correctly', () => {
      const cartId = 'cart-123';
      const productMap = new Map([['test-product', 'product-123']]);
      const result = extractCartItems(mockWebappCart, cartId, productMap);

      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(1);
      expect(result[0].price).toBe(199);
      expect(result[0].savedForLater).toBe(false);
      expect(result[0].cart).toStrictEqual({ connect: { id: cartId } });
      expect(result[0].product).toStrictEqual({ connect: { id: 'product-123' } });
    });

    it('handles out of stock items', () => {
      const outOfStockCart = {
        ...mockWebappCart,
        lines: [{ ...mockWebappCart.lines[0], inStock: false }],
      };
      const cartId = 'cart-123';
      const productMap = new Map([['test-product', 'product-123']]);
      const result = extractCartItems(outOfStockCart, cartId, productMap);

      expect(result[0].savedForLater).toBe(true);
    });

    // Enhanced test coverage
    it('handles multiple cart items', () => {
      const multiItemCart = {
        ...mockWebappCart,
        lines: [
          mockWebappCart.lines[0],
          {
            id: '2',
            name: 'Test Product 2',
            handle: 'test-product-2',
            price: 299,
            color: 'Blue',
            inStock: true,
            size: 'M',
            quantity: 2,
            image: {
              src: '/images/test2.jpg',
              width: 400,
              height: 400,
              alt: 'Test Product 2',
            },
          },
        ],
      };
      const cartId = 'cart-123';
      const productMap = new Map([
        ['test-product', 'product-123'],
        ['test-product-2', 'product-456'],
      ]);
      const result = extractCartItems(multiItemCart, cartId, productMap);

      expect(result).toHaveLength(2);
      expect(result[0].quantity).toBe(1);
      expect(result[0].price).toBe(199);
      expect(result[1].quantity).toBe(2);
      expect(result[1].price).toBe(299);
    });

    it('handles items with lead time', () => {
      const cartWithLeadTime = {
        ...mockWebappCart,
        lines: [{ ...mockWebappCart.lines[0], leadTime: '2-3 weeks' }],
      };
      const cartId = 'cart-123';
      const productMap = new Map([['test-product', 'product-123']]);
      const result = extractCartItems(cartWithLeadTime, cartId, productMap);

      expect((result[0].metadata as any)?.leadTime).toBe('2-3 weeks');
    });

    it('handles items without lead time', () => {
      const cartWithoutLeadTime = {
        ...mockWebappCart,
        lines: [{ ...mockWebappCart.lines[0], leadTime: undefined }],
      };
      const cartId = 'cart-123';
      const productMap = new Map([['test-product', 'product-123']]);
      const result = extractCartItems(cartWithoutLeadTime, cartId, productMap);

      expect((result[0].metadata as any)?.leadTime).toBeUndefined();
    });

    it('handles items with missing product in productMap', () => {
      const cartId = 'cart-123';
      const productMap = new Map(); // Empty map
      const result = extractCartItems(mockWebappCart, cartId, productMap);

      expect(result).toHaveLength(1);
      expect(result[0].product).toBeUndefined();
    });

    it('handles items with zero quantity', () => {
      const cartWithZeroQty = {
        ...mockWebappCart,
        lines: [{ ...mockWebappCart.lines[0], quantity: 0 }],
      };
      const cartId = 'cart-123';
      const productMap = new Map([['test-product', 'product-123']]);
      const result = extractCartItems(cartWithZeroQty, cartId, productMap);

      expect(result[0].quantity).toBe(0);
    });

    it('handles items with negative quantity', () => {
      const cartWithNegativeQty = {
        ...mockWebappCart,
        lines: [{ ...mockWebappCart.lines[0], quantity: -1 }],
      };
      const cartId = 'cart-123';
      const productMap = new Map([['test-product', 'product-123']]);
      const result = extractCartItems(cartWithNegativeQty, cartId, productMap);

      expect(result[0].quantity).toBe(-1);
    });

    it('handles items with zero price', () => {
      const cartWithZeroPrice = {
        ...mockWebappCart,
        lines: [{ ...mockWebappCart.lines[0], price: 0 }],
      };
      const cartId = 'cart-123';
      const productMap = new Map([['test-product', 'product-123']]);
      const result = extractCartItems(cartWithZeroPrice, cartId, productMap);

      expect(result[0].price).toBe(0);
    });

    it('handles items with negative price', () => {
      const cartWithNegativePrice = {
        ...mockWebappCart,
        lines: [{ ...mockWebappCart.lines[0], price: -10 }],
      };
      const cartId = 'cart-123';
      const productMap = new Map([['test-product', 'product-123']]);
      const result = extractCartItems(cartWithNegativePrice, cartId, productMap);

      expect(result[0].price).toBe(-10);
    });

    it('handles items with special characters in color and size', () => {
      const cartWithSpecialChars = {
        ...mockWebappCart,
        lines: [{ ...mockWebappCart.lines[0], color: 'Red & Blue', size: 'L/XL' }],
      };
      const cartId = 'cart-123';
      const productMap = new Map([['test-product', 'product-123']]);
      const result = extractCartItems(cartWithSpecialChars, cartId, productMap);

      expect((result[0].metadata as any)?.color).toBe('Red & Blue');
      expect((result[0].metadata as any)?.size).toBe('L/XL');
    });

    it('handles items with missing image', () => {
      const cartWithoutImage = {
        ...mockWebappCart,
        lines: [{ ...mockWebappCart.lines[0], image: undefined as any }],
      };
      const cartId = 'cart-123';
      const productMap = new Map([['test-product', 'product-123']]);
      const result = extractCartItems(cartWithoutImage, cartId, productMap);

      expect((result[0].metadata as any)?.image).toBeUndefined();
    });

    it('handles empty lines array', () => {
      const cartWithEmptyLines = { ...mockWebappCart, lines: [] };
      const cartId = 'cart-123';
      const productMap = new Map();
      const result = extractCartItems(cartWithEmptyLines, cartId, productMap);

      expect(result).toHaveLength(0);
    });

    it('includes all required metadata fields', () => {
      const cartId = 'cart-123';
      const productMap = new Map([['test-product', 'product-123']]);
      const result = extractCartItems(mockWebappCart, cartId, productMap);

      expect(result[0].metadata as any).toHaveProperty('color');
      expect(result[0].metadata as any).toHaveProperty('size');
      expect(result[0].metadata as any).toHaveProperty('inStock');
      expect(result[0].metadata as any).toHaveProperty('originalLineId');
      expect(result[0].metadata as any).toHaveProperty('image');
    });

    it('generates consistent results for same input', () => {
      const cartId = 'cart-123';
      const productMap = new Map([['test-product', 'product-123']]);
      const result1 = extractCartItems(mockWebappCart, cartId, productMap);
      const result2 = extractCartItems(mockWebappCart, cartId, productMap);

      expect(result1.length).toBe(result2.length);
      expect(result1[0].quantity).toBe(result2[0].quantity);
      expect(result1[0].price).toBe(result2[0].price);
      expect(result1[0].savedForLater).toBe(result2[0].savedForLater);
    });
  });

  describe('findVariantForCartItem', () => {
    it('finds matching variant', () => {
      const line = mockWebappCart.lines[0];
      const variants = [
        { id: 'variant-1', name: 'Test Product', slug: 'test-product-red-l', parentId: 'parent-1' },
      ];

      const result = findVariantForCartItem(line, variants);
      expect(result).toBe('variant-1');
    });

    it('returns null when no matching variant', () => {
      const line = mockWebappCart.lines[0];
      const variants = [
        {
          id: 'variant-1',
          name: 'Test Product',
          slug: 'test-product-blue-m',
          parentId: 'parent-1',
        },
      ];

      const result = findVariantForCartItem(line, variants);
      expect(result).toBeNull();
    });

    // Enhanced test coverage
    it('handles case insensitive matching', () => {
      const line = { ...mockWebappCart.lines[0], color: 'RED', size: 'L' };
      const variants = [
        { id: 'variant-1', name: 'Test Product', slug: 'test-product-red-l', parentId: 'parent-1' },
      ];

      const result = findVariantForCartItem(line, variants);
      expect(result).toBe('variant-1');
    });

    it('handles spaces in color names', () => {
      const line = { ...mockWebappCart.lines[0], color: 'Dark Blue', size: 'M' };
      const variants = [
        {
          id: 'variant-1',
          name: 'Test Product',
          slug: 'test-product-dark-blue-m',
          parentId: 'parent-1',
        },
      ];

      const result = findVariantForCartItem(line, variants);
      expect(result).toBe('variant-1');
    });

    it('handles special characters in color names', () => {
      const line = { ...mockWebappCart.lines[0], color: 'Red & Blue', size: 'L' };
      const variants = [
        {
          id: 'variant-1',
          name: 'Test Product',
          slug: 'test-product-red-blue-l',
          parentId: 'parent-1',
        },
      ];

      const result = findVariantForCartItem(line, variants);
      expect(result).toBe('variant-1');
    });

    it('handles empty variants array', () => {
      const line = mockWebappCart.lines[0];
      const variants: Array<{ id: string; name: string; slug: string; parentId: string | null }> =
        [];

      const result = findVariantForCartItem(line, variants);
      expect(result).toBeNull();
    });

    it('handles multiple variants with same slug', () => {
      const line = mockWebappCart.lines[0];
      const variants = [
        { id: 'variant-1', name: 'Test Product', slug: 'test-product-red-l', parentId: 'parent-1' },
        { id: 'variant-2', name: 'Test Product', slug: 'test-product-red-l', parentId: 'parent-1' },
      ];

      const result = findVariantForCartItem(line, variants);
      expect(result).toBe('variant-1'); // Returns first match
    });

    it('handles variants with null parentId', () => {
      const line = mockWebappCart.lines[0];
      const variants = [
        { id: 'variant-1', name: 'Test Product', slug: 'test-product-red-l', parentId: null },
      ];

      const result = findVariantForCartItem(line, variants);
      expect(result).toBe('variant-1');
    });

    it('handles very long product handles', () => {
      const longHandle = 'a'.repeat(100);
      const line = { ...mockWebappCart.lines[0], handle: longHandle };
      const variants = [
        {
          id: 'variant-1',
          name: 'Test Product',
          slug: `${longHandle}-red-l`,
          parentId: 'parent-1',
        },
      ];

      const result = findVariantForCartItem(line, variants);
      expect(result).toBe('variant-1');
    });

    it('handles very long color names', () => {
      const longColor = 'a'.repeat(50);
      const line = { ...mockWebappCart.lines[0], color: longColor };
      const variants = [
        {
          id: 'variant-1',
          name: 'Test Product',
          slug: `test-product-${longColor}-l`,
          parentId: 'parent-1',
        },
      ];

      const result = findVariantForCartItem(line, variants);
      expect(result).toBe('variant-1');
    });

    it('handles very long size names', () => {
      const longSize = 'a'.repeat(20);
      const line = { ...mockWebappCart.lines[0], size: longSize };
      const variants = [
        {
          id: 'variant-1',
          name: 'Test Product',
          slug: `test-product-red-${longSize}`,
          parentId: 'parent-1',
        },
      ];

      const result = findVariantForCartItem(line, variants);
      expect(result).toBe('variant-1');
    });

    it('generates consistent results for same input', () => {
      const line = mockWebappCart.lines[0];
      const variants = [
        { id: 'variant-1', name: 'Test Product', slug: 'test-product-red-l', parentId: 'parent-1' },
      ];

      const result1 = findVariantForCartItem(line, variants);
      const result2 = findVariantForCartItem(line, variants);

      expect(result1).toBe(result2);
    });
  });
});
